const AdvisingSession = require("../models/AdvisingSession");
const Student = require("../models/Student");
const SelectedCourse = require("../models/SelectedCourse");
const StudentCourse = require("../models/StudentCourse");
const Course = require("../models/Course");
const ProgrammeCourse = require("../models/ProgrammeCourse");
const Type = require("../models/Type");
const ElectiveRequirement = require("../models/ElectiveRequirement");
const Semester = require("../models/Semester");
const { getCoursePlan } = require("./getCoursePlan");
const { getAllEligibleCourses } = require("../controllers/getEligibleCourses");
const { Op, where } = require('sequelize');
const db = require('../db');
async function getStudentCoursePlan(studentId, semesterId) {

    try {
        const advising_info = await AdvisingSession.findOne({
            attributes: ['planStatus', 'updatedAt'],
            where: {
                [Op.and]: [
                    { studentId: studentId },
                    { semesterId: semesterId }
                ]

            }
        });

        const plan = await getCoursePlan(studentId, semesterId);
        const current_date = new Date();
        const year = current_date.getFullYear();
        const month = String(current_date.getMonth() + 1).padStart(2, '0');
        const day = String(current_date.getDate()).padStart(2, '0');
        let last_update = `${year}-${month}-${day}`;
        let status = "New";
        if (advising_info) {
            last_update = advising_info.get('updatedAt');
            status = advising_info.get('planStatus');
        }
        return {
            [studentId]: {
                lastUpdated: last_update,
                status: status,
                plan: plan,
                limit: 15
            }
        }
    } catch (error) {
        const msg = `Error in getting student's ${studentId} structured courseplan for semesterId ${semesterId}:`;
        console.log(msg, { ...error });
        return null;
    }
}


async function getStudentCoursePlanByStudentIdAndSemesterId(studentId, semesterId) {
    try {
        const result = await db.transaction(async (t) => {
            // Fetch the student and advising session
            const [student, advisingSession] = await Promise.all([
                Student.findByPk(studentId, {
                    attributes: ['programmeId'],
                    transaction: t
                }),
                AdvisingSession.findOne({
                    where: { studentId, semesterId },
                    attributes: ['updatedAt', 'planStatus'],
                    transaction: t
                })
            ]);

            if (!student) throw new Error("Student not found.");
            if (!advisingSession) throw new Error("No advising session found.");

            // Fetch selected and completed courses in parallel
            const [selectedCourses, studentCourses, electiveRequirements] = await Promise.all([
                SelectedCourse.findAll({
                    include: [
                        {
                            model: Course,
                            attributes: ['code', 'title', 'credits'],
                            include: [{
                                model: ProgrammeCourse,
                                where: { programmeId: student.programmeId },
                                attributes: ['typeId'],
                                include: [{ model: Type, attributes: ['type'] }]
                            }]
                        }
                    ],
                    attributes: [],
                    transaction: t
                }),
                StudentCourse.findAll({
                    where: { studentId },
                    include: [{
                        model: Course,
                        attributes: ['code', 'title', 'credits'],
                        include: [{
                            model: ProgrammeCourse,
                            where: { programmeId: student.programmeId },
                            attributes: ['typeId'],
                            include: [{ model: Type, attributes: ['type'] }]
                        }]
                    }],
                    attributes: [],
                    transaction: t
                }),
                ElectiveRequirement.findAll({
                    where: { programmeId: student.programmeId },
                    include: [{ model: Type, attributes: ['type'] }],
                    attributes: ['amount'],
                    transaction: t
                })
            ]);

            // Transform data and calculate credits remaining (similar to original logic)
            const completedCourseData = studentCourses.map(sc => ({
                courseCode: sc.course.code,
                courseTitle: sc.course.title,
                credits: sc.course.credits,
                type: sc.course.programmeCourses[0]?.type?.type || 'Unknown',
                selected: false,
                completed: true
            }));

            const selectedCourseData = selectedCourses.map(sc => ({
                courseCode: sc.course.code,
                courseTitle: sc.course.title,
                credits: sc.course.credits,
                type: sc.course.programmeCourses[0]?.type?.type || 'Unknown',
                selected: true,
                completed: false
            }));

            const electiveRequirementsMap = electiveRequirements.reduce((acc, req) => {
                acc[req.type.type] = req.amount;
                return acc;
            }, {});

            const allCourses = [...completedCourseData, ...selectedCourseData];

            const coursesByType = allCourses.reduce((acc, course) => {
                if (!acc[course.type]) acc[course.type] = [];
                acc[course.type].push(course);
                return acc;
            }, {});

            const calculateCreditsRemaining = (courses, type) => {
                const requiredCredits = electiveRequirementsMap[type] || 0;
                const completedCredits = courses.filter(course => course.completed).reduce((sum, course) => sum + course.credits, 0);
                return Math.max(requiredCredits - completedCredits, 0);
            };

            const plan = Object.entries(coursesByType).map(([category, courses]) => ({
                category,
                creditsRemaining: calculateCreditsRemaining(courses, category),
                totalCreditsForCategory: electiveRequirementsMap[category] || 0,
                courses: courses.map(course => ({
                    courseCode: course.courseCode,
                    courseTitle: course.courseTitle,
                    type: course.type,
                    selected: course.selected,
                    completed: course.completed,
                    credits: course.credits
                }))
            }));

            return {
                [studentId]: {
                    lastUpdated: advisingSession.updatedAt.toISOString().split('T')[0],
                    status: advisingSession.planStatus || "Pending",
                    plan: plan,
                    limit: 15
                }
            };
        });

        return result;
    } catch (error) {
        console.error("Error fetching student course plan:", error.message);
        throw new Error(error.message || "Internal server error");
    }
}

async function getNewStudentCoursePlan (studentId, semesterId, programmeId){
    try {
        // Parallelize fetching completed courses, semester, programme courses, and eligible courses
        const [completedCourses, semester, programmeCourses, eligibleCourses] = await Promise.all([
            StudentCourse.findAll({
                attributes: ['courseCode'],
                where: {
                    studentId,
                    grade: {
                        [Op.in]: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'EX']
                    }
                }
            }).then(courses => courses.map(c => c.courseCode)),
            Semester.findByPk(semesterId, { attributes: ['num'] }),
            ProgrammeCourse.findAll({
                attributes: ['courseCode', 'typeId'],
                where: { programmeId },
                include: [{ model: Type, attributes: ['type'] }]
            }),
            getAllEligibleCourses(studentId)
        ]);

        // Prepare lists of course codes
        const listOfCoursesBySemesterNum = await Course.findAll({
            attributes: ['code'],
            where: { semester: semester.num }
        }).then(courses => courses.map(course => course.code));

        const listOfEligibleCourses = eligibleCourses.map(course => course.dataValues.code);

        // Structure courses by category using Types table
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

        // Fetch and update course names and credits
        const coursesData = await Course.findAll({
            where: { code: { [Op.in]: programmeCourses.map(pc => pc.courseCode) } },
            attributes: ['code', 'title', 'credits']
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

        // Fetch elective requirements and map them to categories
        const electiveRequirements = await ElectiveRequirement.findAll({
            attributes: ['amount', 'typeId'],
            where: { programmeId },
            include: [{ model: Type, attributes: ['type'] }]
        });

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

        // Update course availability based on eligible courses
        for (let category in courseCategories) {
            courseCategories[category].courses.forEach(course => {
                if (listOfEligibleCourses.includes(course.courseId)) {
                    course.available = true;
                }
            });
        }

        // Construct the plan array
        const plan = Object.entries(courseCategories).map(([category, courses]) => ({
            category,
            creditsRemaining: courses.creditsRemaining,
            totalCreditsForCategory: courses.requiredCredits,
            courses: courses.courses.map(course => ({
                courseId: course.courseId,
                courseName: course.courseName,
                credits: course.credits,
                completed: course.completed,
                selected: course.selected,
                available: course.available
            }))
        }));

        return {
            status: "New",
            plan,
            totalCreditsCompleted,
            totalCreditsRemaining,
            totalRequiredCredits,
            limit: 15
        };
    } catch (error) {
        console.error('Error in getNewStudentCoursePlan:', error);
        throw new Error('Failed to generate new course plan');
    }
};


module.exports = { getStudentCoursePlan, getStudentCoursePlanByStudentIdAndSemesterId, getNewStudentCoursePlan }