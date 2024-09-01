const StudentCourses = require("../models/StudentCourse");
const Semester = require("../models/Semester");
const Course = require("../models/Course");

async function getStudentsCourses(studentId) {
    try {
        const studentCourses = await StudentCourses.findAll({
            where: {
                studentId: studentId
            }
        });

        const processedCourses = await Promise.all(studentCourses.map(async (info) => {
            const stdCourseInfo = info.dataValues;

            const [semInfo, courseInfo] = await Promise.all([
                Semester.findOne({
                    attributes: ['academicYear', 'num'],
                    where: {
                        id: stdCourseInfo.semesterId
                    }
                }),
                Course.findOne({
                    attributes: ['title', 'credits'],
                    where: {
                        code: stdCourseInfo.courseCode
                    }
                })
            ]);

            return {
                id: stdCourseInfo.id,
                courseCode: stdCourseInfo.courseCode,
                courseName: courseInfo.title,
                creditHours: courseInfo.credits,
                grade: stdCourseInfo.grade,
                semester: semInfo.num,
                academicYear: semInfo.academicYear
            };
        }));

        return processedCourses;
    } catch (error) {
        console.error("Error in getStudentsCourses:", error);
        throw error;
    }
}

const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: studentCourses } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, studentCourses, totalPages, currentPage };
};

const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? (page - 1) * limit : 0;

    return { limit, offset };
};

async function getStudentsCoursesPaginated(studentId, page, pageSize) {
    const { limit, offset } = getPagination(page, pageSize);

    // Fetch student courses with pagination
    const studentCoursesData = await StudentCourses.findAndCountAll({
        where: { studentId: studentId },
        limit: limit,
        offset: offset
    });

    // Process each course to include semester and course information
    const processedCourses = await Promise.all(studentCoursesData.rows.map(async (info) => {
        const stdCourseInfo = info.dataValues;

        const [semInfo, courseInfo] = await Promise.all([
            Semester.findOne({
                attributes: ['academicYear', 'num'],
                where: { id: stdCourseInfo.semesterId }
            }),
            Course.findOne({
                attributes: ['title', 'credits'],
                where: { code: stdCourseInfo.courseCode }
            })
        ]);

        return {
            id: stdCourseInfo.id,
            courseCode: stdCourseInfo.courseCode,
            courseName: courseInfo.title,
            creditHours: courseInfo.credits,
            grade: stdCourseInfo.grade,
            semester: semInfo.num,
            academicYear: semInfo.academicYear
        };
    }));

    // Add the processed courses to the result
    const paginatedData = getPagingData({ count: studentCoursesData.count, rows: processedCourses }, page, limit);

    return paginatedData;
}

module.exports = { getStudentsCourses, getStudentsCoursesPaginated };