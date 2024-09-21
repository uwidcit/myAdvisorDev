const StudentCourses = require("../models/StudentCourse");
const Semester = require("../models/Semester");
const Course = require("../models/Course");
const Student = require("../models/Student");

async function getStudentsCourses(studentId) {
    try {
        const studentObject = await Student.findByPk(studentId);
        const studentFullName = `${studentObject.firstName} ${studentObject.lastName}`;
        const studentCourses = await StudentCourses.findAll({
            where: { studentId },
            include: [
                {
                    model: Semester,
                    attributes: ['academicYear', 'num'],
                    as: 'semester'
                },
                {
                    model: Course,
                    attributes: ['title', 'credits'],
                    as: 'course'
                }
            ],
            attributes: ['id', 'courseCode', 'grade', 'semesterId']
        });

        // Process the data in one step without the need for nested promises
        const processedCourses = studentCourses.map(course => {
            const {
                id,
                courseCode,
                grade,
                semester: { num: semester, academicYear },
                course: { title: courseName, credits: creditHours }
            } = course.dataValues;

            return {
                id,
                courseCode,
                courseName,
                creditHours,
                grade,
                semester,
                academicYear
            };
        });
        
        return { fullName: studentFullName, processedCourses };
    } catch (error) {
        console.error("Error fetching student courses:", error);
        throw new Error('Failed to retrieve student courses'); // Adding more specific error handling
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