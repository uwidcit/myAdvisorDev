/* 
    constants to enable connectivity between components and encryption using bcrypt
    bcrypt and saltRounds enable authorization and encryption
    jwt uses the passport module to create and store a user token
*/
const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const studentAccountVerification = require("../middleware/studentAccountVerification");

const { getEligibleCourses } = require("../controllers/getEligibleCourses");
const { getDegreeProgress } = require("../controllers/getDegreeProgress");
const { getPlannedCourses } = require("../controllers/getPlannedCourses");
const { getCoursePlan } = require("../controllers/getCoursePlan");
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



router.get("/eligibleCourses/:semesterId", studentAccountVerification, async (req, res) => {
    const student = req.user
    const semester = req.params.semesterId;
    const eligible_courses = await getEligibleCourses(student, semester);
    console.log(eligible_courses);
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
    console.log("Degree Progress: ", degreeProgress);
    res.json({
        "DegreeProgress: ": degreeProgress
    });

})


router.get("/course-plan/:semesterId", studentAccountVerification, async (req, res) => {

    let semesterId = req.params.semesterId;

    const studentId = req.user;
    // const studentId = "816021684";
    // let programme;

    // -----------------GET DATA FROM DATABASE-------------------------

    // //#region 

    // // get course codes of courses completed by student
    // const studentCourses = await StudentCourse.findAll({ where: { studentId: studentId } });
    // let studentCourseCodes = [];
    // for (i = 0; i < studentCourses.length; i++) {
    //     studentCourseCodes.push(studentCourses[i].dataValues.courseCode);
    // }
    // // console.log("student courses: ", studentCourseCodes);

    // // Get programme id from student model
    // const student = await Student.findOne({ where: { studentId: studentId } });
    // if (student) {
    //     programmeId = student.dataValues.programmeId;
    //     // console.log("student: ", student.dataValues.programmeId);
    // }

    // // // Get student's transcript
    // // const transcript = await Transcript.findOne({ where: { studentId: studentId }, });
    // // switch (transcript.major) {
    // //     case "Computer Science (Special)":
    // //         programme = await Programme.findOne({ where: { name: "BSc " + transcript.major } })
    // //         break;
    // // };
    // // let programmeId = programme.dataValues.id
    // // console.log("Programme Id: ",programmeId);

    // //  get programme courses for programmeId
    // const programmeCourse = await ProgrammeCourse.findAll({ where: { programmeId } });
    // let programmeCourses = [];
    // for (i = 0; i < programmeCourse.length; i++) {
    //     programmeCourses.push(programmeCourse[i].dataValues);
    // }
    // // console.log("programmeCourses: ", programmeCourses);


    // // get semesterCourses
    // const semesterCourses = await SemesterCourses.findAll({ where: { semesterId: semesterId } })
    // let semCourses = [];
    // for (i = 0; i < semesterCourses.length; i++) {
    //     semCourses.push(semesterCourses[i].dataValues.courseCode);
    // }
    // // console.log("Semester Courses :  ", semCourses);


    // // get prerequisites
    // const prerequisites = await Prerequisite.findAll();
    // let prereqs = [];
    // for (let prereq in prerequisites) {
    //     prereqs.push(prerequisites[prereq].dataValues);
    //     // console.log("prerequisites: ", prerequisites[prereq]. dataValues);
    // }
    // // console.log("prerequisites: ", prereqs);

    // // get antirequisites
    // const antirequisites = await Antirequisite.findAll();
    // let antireqs = [];
    // for (let antireq in antirequisites) {
    //     antireqs.push(antirequisites[antireq].dataValues);
    // }
    // // console.log("antireqs: ", antireqs);

    // // get courseGroups
    // const courseGroups = await CourseGroup.findAll();
    // let coursegroups = [];
    // for (let cg in courseGroups) {
    //     coursegroups.push(courseGroups[cg].dataValues);
    //     // console.log("prerequisites: ", prerequisites[prereq]. dataValues);
    // }
    // // console.log("courseGroups:  ", coursegroups);

    // //  get courses
    // let course = await Course.findAll();
    // let courses = [];
    // for (i = 0; i < course.length; i++) {
    //     courses.push(course[i].dataValues);
    // }
    // //  console.log("courses: ", courses);

    // // get programmeCreditRequirements
    // let pcrs = await PCR.findAll({ where: { programmeId } });
    // let programmeCreditRequirements = [];
    // for (i = 0; i < pcrs.length; i++) {
    //     programmeCreditRequirements.push(pcrs[i].dataValues);
    // }
    // // console.log("PCR: ", programmeCreditRequirements);

    // // get types
    // let type = await Type.findAll();
    // let types = [];
    // for (i = 0; i < type.length; i++) {
    //     types.push(type[i].dataValues);
    // }
    // console.log("types: ", types);

    //#endregion


    // -----------------CALL THE FUNCTION-------------------------

    let coursePlan = await getCoursePlan(studentId, semesterId);



    // console.log("COURSEPLAN:::> ", coursePlan);
    // console.log(semesterId);
    res.json({
        studentId: {
            "lastUpdated": "",
            "status": "confirmed",
            "plan": coursePlan,
            "limit": 15,
        }
    });

});

router.get("/course-plan/detail/:semesterId", studentAccountVerification, async (req, res) => {

    let semesterId = req.params.semesterId;
    console.log(semesterId)
    const studentId = req.user;

    // -----------------CALL THE FUNCTION-------------------------

    let coursePlan = await getCoursePlan(studentId, semesterId);



    // console.log("COURSEPLAN:::> ", coursePlan);
    // console.log(semesterId);
    res.json({
        "lastUpdated": "",
        "status": "confirmed",
        "plan": coursePlan,
        "limit": 15,
    });

});

router.get("/course-plans", studentAccountVerification, async (req, res) => {


    try {
        const CoursePlanList = await getAllCoursePlans();
        const semesterId = req.query.semesterId;
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;

        if (!semesterId) {
            return res.status(400).json({ message: 'Semester ID is required' });
        }

        if (!CoursePlanList[semesterId]) {
            return res.status(404).json({ message: 'Course plans not found for the provided semester ID' });
        }

        const totalPlans = CoursePlanList[semesterId].length;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const paginatedPlans = CoursePlanList[semesterId].slice(start, end);

        const payload = {
            allPlan: CoursePlanList,
            plans: paginatedPlans,
            totalPlans,
            totalPages: Math.ceil(totalPlans / itemsPerPage),
            currentPage: page,
        };

        res.status(200).json(payload);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }

});


module.exports = router;




