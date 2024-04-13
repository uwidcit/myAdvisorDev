const StudentCourses = require("../models/StudentCourse");
const Semester = require("../models/Semester");
const Course = require("../models/Course");

async function getStudentsCourses(studentId){//returns list of json
    const student_courses = await StudentCourses.findAll({ 
        where: { 
            studentId: studentId
        } 
    });
    const processedCourses = await Promise.all(student_courses.map(async (info) => {
        const std_course_info = info.dataValues;

        const [sem_info, course_info] = await Promise.all([
            Semester.findOne({
                attributes: ['academicYear','num'],
                where :{
                    id : std_course_info['semesterId']
                }
            }).then(async(sem)=>{
                return [sem.get('academicYear'),sem.get('num')];
            }),
            Course.findOne({
                attributes : ['title','credits'],
                where: {
                    code: std_course_info['courseCode']
                }
            }).then(async(course)=>{
                return [course.get('title'),course.get('credits')];
            })
        ]);

        std_course_info['yearDone'] = sem_info[0];
        std_course_info['semesterDone'] = sem_info[1];
        std_course_info['courseName'] = course_info[0];
        std_course_info['courseCredits'] = course_info[1];
        return {
            id : std_course_info.id,
            courseCode: std_course_info.courseCode,
            courseName: course_info[0],
            creditHours: course_info[1],
            grade : std_course_info.grade,
            semester: sem_info[1],
            academicYear: sem_info[0]
        };
    }));

    return processedCourses;
    
}
module.exports = { getStudentsCourses }