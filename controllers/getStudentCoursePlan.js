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
            
            const [student, advisingSession] = await Promise.all([
                Student.findByPk(studentId, {
                    attributes: ['programmeId'],
                    transaction: t
                }),
                AdvisingSession.findOne({
                    where: { studentId, semesterId },
                    attributes: ['updatedAt', 'planStatus', 'id'],
                    transaction: t
                })
            ]);

            if (!student) throw new Error("Student not found.");
            if (!advisingSession) throw new Error("No advising session found.");

            
            const [selectedCourses, studentCourses, electiveRequirements] = await Promise.all([
                SelectedCourse.findAll({
                    where: { advisingSessionId: advisingSession.id },
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

async function getNewStudentCoursePlan(studentId, semesterId, programmeId) {
    try {
        
        const [completedCourses, semester, programmeCourses, eligibleCourses] = await Promise.all([
            StudentCourse.findAll({
                attributes: ['courseCode'],
                where: {
                    studentId,
                    grade: {
                        [Op.in]: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'EX']
                    }
                }
            }).then(courses => new Set(courses.map(c => c.courseCode))),
            Semester.findByPk(semesterId, { attributes: ['num'] }),
            ProgrammeCourse.findAll({
                attributes: ['courseCode', 'typeId'],
                where: { programmeId },
                include: [{ model: Type, attributes: ['type'] }]
            }),
            getAllEligibleCourses(studentId).then(courses => new Set(courses.map(course => course.dataValues.code)))
        ]);

        const listOfCoursesBySemesterNum = await Course.findAll({
            attributes: ['code'],
            where: { semester: semester.num }
        }).then(courses => new Set(courses.map(course => course.code)));

        
        const courseCategories = {
            "L1CORE": initializeCategory(),
            "L2CORE": initializeCategory(),
            "L3CORE": initializeCategory(),
            "ADVELECTIVE": initializeCategory(),
            "CIELECTIVE": initializeCategory(),
            "CIMELECTIVE": initializeCategory(),
            "FOUN": initializeCategory()
        };

        
        programmeCourses.forEach(pc => {
            const course = pc.courseCode;
            const category = pc.type.dataValues.type;
            if (courseCategories[category]) {
                courseCategories[category].courses.push(createCourseInfo(course, completedCourses.has(course), listOfCoursesBySemesterNum.has(course)));
            }
        });

        
        const coursesData = await Course.findAll({
            where: { code: { [Op.in]: Object.keys(courseCategories).flatMap(cat => courseCategories[cat].courses.map(c => c.courseId)) } },
            attributes: ['code', 'title', 'credits']
        });

        const courseDataMap = new Map(coursesData.map(course => [course.code, { title: course.title, credits: course.credits }]));
        for (let category in courseCategories) {
            courseCategories[category].courses.forEach(courseInfo => {
                const courseDetails = courseDataMap.get(courseInfo.courseId);
                if (courseDetails) {
                    courseInfo.courseName = courseDetails.title;
                    courseInfo.credits = courseDetails.credits;
                    courseCategories[category].totalCredits += courseDetails.credits;
                    if (courseInfo.completed) {
                        courseCategories[category].completedCredits += courseDetails.credits;
                    }
                }
            });
        }

        
        const electiveRequirements = await ElectiveRequirement.findAll({
            attributes: ['amount', 'typeId'],
            where: { programmeId },
            include: [{ model: Type, attributes: ['type'] }]
        });

        electiveRequirements.forEach(req => {
            const category = req.type.dataValues.type;
            if (courseCategories[category]) {
                courseCategories[category].requiredCredits = req.amount;
                courseCategories[category].creditsRemaining = req.amount - courseCategories[category].completedCredits;
            }
        });

        
        const plan = Object.entries(courseCategories).map(([category, courses]) => ({
            category,
            creditsRemaining: courses.creditsRemaining || 0,
            totalCreditsForCategory: courses.requiredCredits || 0,
            courses: courses.courses
        }));

        const totalCreditsCompleted = Object.values(courseCategories).reduce((sum, { completedCredits }) => sum + completedCredits, 0);
        const totalRequiredCredits = Object.values(courseCategories).reduce((sum, { requiredCredits }) => sum + requiredCredits, 0);
        const totalCreditsRemaining = totalRequiredCredits - totalCreditsCompleted;

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
}

function initializeCategory() {
    return { courses: [], totalCredits: 0, completedCredits: 0, requiredCredits: 0, creditsRemaining: 0 };
}

function createCourseInfo(courseId, completed, available) {
    return { courseId, courseName: '', credits: 0, completed, selected: completed, available };
}


module.exports = { getStudentCoursePlan, getStudentCoursePlanByStudentIdAndSemesterId, getNewStudentCoursePlan }
