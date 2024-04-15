const { addStudentTranscript } = require('./addStudentTranscript');
// const { addStudentCourses } = require('../controllers/addStudentTranscript');
const db = require('../db');
const { Op } = require('sequelize');
const Semester = require("../models/Semester");
const StudentCourse = require("../models/StudentCourse");
async function addStudentTranscriptCourses(transcriptData){//return status,msg
    if(!await addStudentTranscript(transcriptData)){
        return {status: 400, msg: "Student Transcript Already Added"}
    }else{
        const {
            studentId,
            studentCourses: studentcourselist
        } = transcriptData;
        let invalid_grades = ["IP"];
        studentcourselist.map(async (course) =>{
            const code = Object.keys(course)[0];
            const grade = course[code].grade
            const student_course_exists = await StudentCourse.findOne({
                where: {
                    [Op.and]: [
                        {studentId : studentId},
                        {courseCode: code}
                    ]
                }
            });
            const grade_valid = !invalid_grades.includes(grade);
            const year = course[code].year;
            const current_year = new Date().getFullYear();
            const course_sem = course[code].semester;
            // let sem = undefined;

            const MAX_RETRIES = 3;
            let retries = 0;
            if(year.split("/").every(yr => yr <= current_year)){
                while(retries<MAX_RETRIES){
                    try{
                        await db.transaction(async t => {
                        const semester =  await Semester.findOne({
                            where : {
                                [Op.and]: [
                                    {num:course_sem},
                                    {academicYear:year}
                                ]
                            },
                            attributes : ['id'],
                        },{ transaction:t });
                        let sem_id = undefined;
                        //FOR DEMO PURPOSES
                        if(semester){
                            sem_id = semester.get('id');
                        }else{
                            sem_id = 1;
                        }
                        if(!student_course_exists && grade_valid){
                            await StudentCourse.create({
                                studentId,
                                courseCode: code,
                                semesterId:sem_id,
                                grade:grade
                            },
                            { transaction:t }
                        );
                            console.log(`course ${code} added as studentCourse for student ${studentId} `);
                        }   

                        });
                        break;
                    }catch(error){
                        if (error.message==='SQLITE_BUSY: database is locked' ) {
                            // SQLITE_BUSY error
                            console.warn(`Database is locked. Retrying (${retries + 1}/${MAX_RETRIES})...`);
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
                            retries = retries+1;
                        } else {
                            // Other errors
                            const msg = "Error in Adding student Courses from transcript file:";
                            console.error(msg, error.message);
                            return { status: 500, msg: msg };
                        }
                    }  
                }
            }   
        });
        return {status: 201, msg: "Student Transcript Parsed and Courses Added"}
    }

}
module.exports = { addStudentTranscriptCourses }