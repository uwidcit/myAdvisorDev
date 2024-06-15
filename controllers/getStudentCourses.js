const StudentCourses = require("../models/StudentCourse");
const Semester = require("../models/Semester");
const Course = require("../models/Course");

async function getStudentsCourses(studentId) {
    try {
        const studentCourses = await StudentCourses.findAll({
            where: { studentId: studentId },
            include: [
                {
                    model: Course,
                    attributes: ['title', 'credits']
                },
                {
                    model: Semester,
                    attributes: ['academicYear', 'num']
                }
            ]
        });

        const processedCourses = studentCourses.map(info => {
            const std_course_info = info.dataValues;
            const course_info = info.Course.dataValues;
            const sem_info = info.Semester.dataValues;

            return {
                id: std_course_info.id,
                courseCode: std_course_info.courseCode,
                courseName: course_info.title,
                creditHours: course_info.credits,
                grade: std_course_info.grade,
                semester: sem_info.num,
                academicYear: sem_info.academicYear
            };
        });

        return processedCourses;
    } catch (error) {
        console.error("Error fetching student courses:", error);
        throw error;
    }
}

module.exports = { getStudentsCourses }