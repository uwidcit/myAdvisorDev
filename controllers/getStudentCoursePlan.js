const AdvisingSession = require("../models/AdvisingSession");
const Student = require("../models/Student");
const SelectedCourse = require("../models/SelectedCourse");
const StudentCourse = require("../models/StudentCourse");
const Course = require("../models/Course");
const ProgrammeCourse = require("../models/ProgrammeCourse");
const Type = require("../models/Type");
const ElectiveRequirement = require("../models/ElectiveRequirement");
const { getCoursePlan } = require("./getCoursePlan");
const { Op, where } = require('sequelize');
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
        // Fetch the student to get their programmeId
        const student = await Student.findByPk(studentId, {
            attributes: ['programmeId']
        });

        if (!student) {
            throw new Error("Student not found.");
        }
        // Fetch the advising session for the student and semester
        const advisingSession = await AdvisingSession.findOne({
            where: { studentId, semesterId },
            attributes: ['updatedAt', 'planStatus']
        });

        if (!advisingSession) {
            throw new Error("No advising session found for the given student and semester.");
        }

        // Fetch the selected courses for the advising session
        const selectedCourses = await SelectedCourse.findAll({
            include: [
                {
                    model: AdvisingSession,
                    where: {
                        studentId: studentId,
                        semesterId: semesterId
                    },
                    attributes: []
                },
                {
                    model: Course,
                    attributes: ['code', 'title', 'credits'],
                    include: [{
                        model: ProgrammeCourse,
                        where: { programmeId: student.programmeId },
                        attributes: ['typeId'],
                        include: [{
                            model: Type,
                            attributes: ['type']
                        }]
                    }]
                }
            ],
            attributes: []
        });

        // Fetch the completed courses for the student in the semester
        const studentCourses = await StudentCourse.findAll({
            where: {
                studentId: studentId,
            },
            include: [{
                model: Course,
                attributes: ['code', 'title', 'credits'],
                include: [{
                    model: ProgrammeCourse,
                    where: { programmeId: student.programmeId },
                    attributes: ['typeId'],
                    include: [{
                        model: Type,
                        attributes: ['type']
                    }]
                }]
            }],
            attributes: []
        });


        // Transform the data
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

        // Fetch elective requirements for the student's programme
        const electiveRequirements = await ElectiveRequirement.findAll({
            where: { programmeId: student.programmeId },
            include: [{
                model: Type,
                attributes: ['type']
            }],
            attributes: ['amount']
        });

        // Create a map of elective requirements
        const electiveRequirementsMap = electiveRequirements.reduce((acc, req) => {
            acc[req.type.type] = req.amount;
            return acc;
        }, {});

        // Combine completed and selected courses
        const allCourses = [...completedCourseData, ...selectedCourseData];

        // Group courses by type (category)
        const coursesByType = allCourses.reduce((acc, course) => {
            if (!acc[course.type]) {
                acc[course.type] = [];
            }
            acc[course.type].push(course);
            return acc;
        }, {});

        // Calculate credits remaining for each category
        const calculateCreditsRemaining = (courses, type) => {
            const requiredCredits = electiveRequirementsMap[type] || 0;
            const completedCredits = courses.filter(course => course.completed).reduce((sum, course) => sum + course.credits, 0);
            return Math.max(requiredCredits - completedCredits, 0);
        };

        
        // Construct the plan array
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

        // Prepare the response object in the specified format
        return {
            [studentId]: {
                lastUpdated: advisingSession.updatedAt.toISOString().split('T')[0], // Use the updatedAt from AdvisingSession
                status: advisingSession.planStatus || "Pending", // Use the status from AdvisingSession if it exists, otherwise default to "Pending"
                plan: plan,
                limit: 15
            }
        };

    } catch (error) {
        console.error("Error fetching student course plan:", error.message);
        throw new Error(error.message || "Internal server error");
    }
}
module.exports = { getStudentCoursePlan, getStudentCoursePlanByStudentIdAndSemesterId }