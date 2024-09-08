/* 
    constants to enable connectivity between components and encryption using bcrypt
    bcrypt and saltRounds enable authorization and encryption
    jwt uses the passport module to create and store a user token
*/
const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');
const studentAccountVerification = require("../middleware/studentAccountVerification");
const { NotFoundError } = require('../middleware/errors');

const { getEligibleCourses, getAllEligibleCourses } = require("../controllers/getEligibleCourses");
const { getStudentsCourses } = require("../controllers/getStudentCourses");
const { getDegreeProgress } = require("../controllers/getDegreeProgress");
const { getPlannedCourses } = require("../controllers/getPlannedCourses");
const { getCoursePlan } = require("../controllers/getCoursePlan");
const { getStudentCoursePlan, getStudentCoursePlanSimple } = require("../controllers/getStudentCoursePlan");
const { getAllCoursePlans } = require("../controllers/getAllCoursePlans");

const { Sequelize } = require('sequelize');

// import models
const Student = require("../models/Student");
const AdvisingSession = require("../models/AdvisingSession");
// const AdvisingWindow = require('../models/AdvisingWindow')
const StudentCourse = require("../models/StudentCourse");
const Transcript = require("../models/Transcript");
const Programme = require("../models/Programme");
const ProgrammeCourse = require("../models/ProgrammeCourse");
const Semester = require("../models/Semester");
const SemesterCourses = require("../models/SemesterCourse");
const Prerequisite = require("../models/Prerequisite");
const Antirequisite = require("../models/Antirequisite");
const CourseGroup = require("../models/CourseGroup");
const Course = require("../models/Course");
const PCR = require("../models/ElectiveRequirement");
const Type = require("../models/Type");
const SelectedCourse = require("../models/SelectedCourse");


router.post("/create-plan", studentAccountVerification, async (req, res) => {

    try {
        const studentId = req.user;
        let selectedCourses = req.body.selectedCourses;
        const semesterId = req.body.semesterId;

        let session = await AdvisingSession.findOne({ where: { studentId: studentId, semesterId: semesterId } });

        if (!session) {

            session = await AdvisingSession.create({
                studentId: studentId,
                planStatus: "Pending",
                semesterId: semesterId
            });

            for (i = 0; i < selectedCourses.length; i++) {
                // console.log(selectedCourses[i])
                await SelectedCourse.create({
                    advisingSessionId: session.id,
                    courseCode: selectedCourses[i].courseCode
                });
            }

            res.status(200).send("Created New Course Plan");
        }
        else {

            await SelectedCourse.destroy({ where: { advisingSessionId: session.id } });
            await session.destroy();


            session = await AdvisingSession.create({
                studentId: studentId,
                planStatus: "Pending",
                semesterId: semesterId
            });


            // console.log(session);


            // Create new selected courses with updated course codes
            for (let i = 0; i < selectedCourses.length; i++) {
                await SelectedCourse.create({
                    advisingSessionId: session.id,
                    courseCode: selectedCourses[i]
                });
            }

            res.status(200).send("Updated Old Course Plan");

        }



    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

// save advising session
router.post("/academic-advising/session/:studentId", async (req, res) => {
    try {
        // get current student details
        const student = await Student.findOne({ where: { studentId: req.params.studentId } });

        // setup date format and get current date
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();

        today = yyyy + '-' + mm + '-' + dd;

        const session = await AdvisingSession.findOne({ where: { studentId: student.studentId } });
        //console.log(student.studentId);
        //const window = await AdvisingWindow.findOne({ where: { id: 1 } });

        if (!session) {
            await AdvisingSession.create({
                studentId: student.studentId,
                sessionDate: today,
                semesterId: req.body.semester
            })
                .then(() => {
                    return res.status(200).send("Advising Session Completed");
                })
                .catch(err => {
                    console.log("Error: ", err.message);
                });
        }
        else {
            await session.destroy();

            await AdvisingSession.create({
                studentId: student.studentId,
                sessionDate: today,
                semesterId: req.body.semester
            })
                .then(() => {
                    return res.status(200).send("Advising Session Completed");
                })
                .catch(err => {
                    console.log("Error: ", err.message);
                });
        }
    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});
//Creating a CoursePlan / AdvisingSession (input:)


router.get("/eligibleCourses/:semesterId", studentAccountVerification, async (req, res) => {
    const student = req.user
    const semester = req.params.semesterId;
    const eligible_courses = await getEligibleCourses(student, semester);
    // const all_elg_courses = await getAllEligibleCourses(student);
    // const courseData = all_elg_courses.map(course => course.dataValues);
    // console.log(courseData);
    res.json({
        "student": student,
        "upcomingSemester": semester,
        "eligibleCourses": eligible_courses
    });
});

router.get("/degreeProgress", studentAccountVerification, async (req, res) => {

    // get logged in studentId
    const studentId = req.user;

    let degreeProgress = await getDegreeProgress(studentId);
    res.json(
        degreeProgress
    );

})

/**
 * GET /courses/:studentId
 * Fetches courses for a given student ID after verifying the student's account.
 */
router.get('/courses/:studentId', studentAccountVerification, async (req, res, next) => {
    const { studentId } = req.params;
    try {
        const courses = await getStudentsCourses(studentId);
        if (!courses) {
            throw new NotFoundError(`Courses for student ID ${studentId} not found.`);
        }
        res.status(200).json(courses);
    } catch (error) {
        next(error);
    }
});

//For the table on CourseplannerViewer if coursePlan for selectedSemester && selectedSemester==currentSemester
router.get("/course-plan/:semesterId", studentAccountVerification, async (req, res) => {

    let semesterId = req.params.semesterId;
    const studentId = req.user;

    const coursePlan = await getStudentCoursePlanSimple(studentId, semesterId);
    if (coursePlan) {
        res.status(200).json(coursePlan);
    } else {
        res.status(404).send("Course Plan for Student Not Found");
    }
});
//coursePlanReport.jsx
router.get("/course-plan/detail/:semesterId", studentAccountVerification, async (req, res) => {

    let semesterId = req.params.semesterId;
    const studentId = req.user;


    // -----------------CALL THE FUNCTION-------------------------

    try {
        const coursePlan = await getStudentCoursePlan(studentId, semesterId);
        // console.log("Course Plan: ", coursePlan);
        if (coursePlan) {
            res.status(200).json(coursePlan);
        } else {
            res.status(404).send("Course Plan for Student Not Found");
        }
    } catch (error) {
        console.error("Error ::>", error);
    }

});

router.get("/:studentId/course-plan/:semesterId", studentAccountVerification, async (req, res) => {
    const studentId = req.params.studentId;
    const semesterId = req.params.semesterId;

    try {
        // Validate inputs
        if (!studentId || !semesterId) {
            return res.status(400).json({ error: "Invalid studentId or semesterId" });
        }

        // Fetch student's program ID
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: `Student with ID ${studentId} not found` });
        }
        const programmeId = student.programmeId;

        // Fetch completed courses
        const completedCourses = await StudentCourse.findAll({
            attributes: ['courseCode'],
            where: {
                studentId,
                grade: {
                    [Op.in]: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'EX']
                }
            }
        }).then(courses => courses.map(c => c.courseCode));

        // Fetch the semester and courses for that semester
        const semester = await Semester.findByPk(semesterId);
        const coursesBySemesterNum = await Course.findAll({
            where: { semester: semester.num }
        });

        let listOfCoursesBySemesterNum = coursesBySemesterNum.map(course => course.code);

        // Fetch all programme courses
        const programmeCourses = await ProgrammeCourse.findAll({
            attributes: ['courseCode', 'typeId'],
            where: { programmeId },
            include: [{ model: Type, attributes: ['type'] }]
        });

        // Fetch eligible courses
        const eligibleCourses = await getAllEligibleCourses(studentId);
        const listOfEligibleCourses = eligibleCourses.map(course => course.dataValues.code);

        // Structure the courses by categories using the Types table
        const courseCategories = {
            "L1CORE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "L2CORE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "L3CORE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "ADVELECTIVE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "CIELECTIVE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "CIMELECTIVE": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 },
            "FOUN": { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 }
        };

        // Add programme courses to their respective categories
        programmeCourses.forEach(pc => {
            const course = pc.courseCode;
            const category = pc.type.dataValues.type;

            const courseInfo = {
                courseId: course,
                courseName: '',  // Will be filled below
                credits: 0,      // Will be filled below
                completed: completedCourses.includes(course),
                selected: completedCourses.includes(course),
                available: listOfCoursesBySemesterNum.includes(course)
            };

            if (courseCategories[category]) {
                courseCategories[category].courses.push(courseInfo);
            }
        });

        // Fill in course names and credits
        const coursesData = await Course.findAll({
            where: {
                code: { [Op.in]: programmeCourses.map(pc => pc.courseCode) }
            }
        });

        coursesData.forEach(course => {
            for (let category in courseCategories) {
                const courseInfo = courseCategories[category].courses.find(c => c.courseId === course.code);
                if (courseInfo) {
                    courseInfo.courseName = course.title;
                    courseInfo.credits = course.credits;
                    courseCategories[category].totalCredits += course.credits;
                    if (courseInfo.completed) {
                        courseCategories[category].completedCredits += course.credits;
                    }
                }
            }
        });

        // Fetch the total amount of credits required for the programme using ElectiveRequirement
        const electiveRequirements = await PCR.findAll({
            include: [{ model: Type, attributes: ['type'] }],
            attributes: ['amount', 'typeId'],
            where: { programmeId }
        });

        // Map the elective requirements to their respective categories
        electiveRequirements.forEach(req => {
            const category = req.type.dataValues.type;
            if (courseCategories[category]) {
                courseCategories[category].requiredCredits = req.amount;
            }
            courseCategories[category].creditsRemaining = courseCategories[category].requiredCredits - courseCategories[category].completedCredits;
        });

        // Calculate total credits completed and remaining
        let totalCreditsCompleted = 0;
        let totalRequiredCredits = 0;
        for (let category in courseCategories) {
            totalCreditsCompleted += courseCategories[category].completedCredits;
            totalRequiredCredits += courseCategories[category].requiredCredits;
        }
        const totalCreditsRemaining = totalRequiredCredits - totalCreditsCompleted;

        // Update availability based on eligible courses
        for (let category in courseCategories) {
            courseCategories[category].courses.forEach(course => {
                if (listOfEligibleCourses.includes(course.courseId)) {
                    course.available = true;
                }
            });
        }

        // Add credits summary to the response
        const response = {
            ...courseCategories,
            totalCreditsCompleted,
            totalCreditsRemaining,
            totalRequiredCredits,
            limit: 15
        };

        return res.status(200).json({ message: 'Course plan data retrieved successfully', data: response });
    } catch (error) {
        console.error('Error fetching course plan:', error.message);
        return res.status(500).json({ error: 'Failed to retrieve course plan data' });
    }
});

router.get("/course-plans/:semesterId", studentAccountVerification, async (req, res) => {
    try {
        const semesterId = req.params.semesterId;
        const CoursePlanList = await getAllCoursePlans(semesterId);
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;
        // console.log("SemesterId  ", semesterId)
        if (!semesterId) {
            return res.status(400).json({ message: 'Semester ID is required' });
        }

        // Filter CoursePlanList based on semesterId
        const filteredPlans = CoursePlanList.filter(plan => plan.semesterId === parseInt(semesterId));

        if (filteredPlans.length === 0) {
            return res.status(200).json({});
        }

        const totalPlans = filteredPlans.length;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const paginatedPlans = filteredPlans.slice(start, end);

        const payload = {
            allPlan: CoursePlanList, // You might want to consider sending only the filtered plans instead of all plans
            plans: paginatedPlans,
            totalPlans,
            totalPages: Math.ceil(totalPlans / itemsPerPage),
            currentPage: page,
        };
        // console.log("Got Course Plans for semester, ", semesterId)
        res.status(200).json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;




