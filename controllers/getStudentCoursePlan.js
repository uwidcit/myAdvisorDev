const AdvisingSession = require("../models/AdvisingSession");
const Student = require("../models/Student");
const SelectedCourse = require("../models/SelectedCourse")
const { getCoursePlan } = require("./getCoursePlan");
const { Op } = require('sequelize');
async function getStudentCoursePlan(studentId,semesterId){
    try{
        const advising_info = await AdvisingSession.findOne({
            attributes: ['planStatus', 'updatedAt'],
            where: {
                [Op.and] : [
                    {studentId: studentId},
                    {semesterId:semesterId}
                ]
                
            }
        }).then(info => {
            if(!info){
                return null;
            }else{
                const date = JSON.stringify(info.get('updatedAt')).split("T")[0].substring(1);
                return [info.get('planStatus'),date];
            }
        });
        if(!advising_info){
            return null;
        }

        const plan = await getCoursePlan(studentId, semesterId);

        return {
            [studentId]: {
                lastUpdated: advising_info[1],
                status: advising_info[0],
                plan: plan,
                limit: 15
            }
        }
    } catch (error) {
        const msg = `Error in getting student's ${studentId} courseplan for semesterId ${semesterId}:`;
        console.log(msg, error.message);
        return null;
    }
}
//Pretty Redundant
async function getStudentCoursePlanSimple(studentId,semesterId){
    try{
        const courseplan = await AdvisingSession.findOne({
            attributes: ['studentId','planStatus','id'],
            where: {
                [Op.and] :[
                    {studentId:studentId},
                    {semesterId:semesterId}
                ]
            }
        }).then(async (plan)=>{
            const student = plan.get('studentId');
            const stat = plan.get('planStatus');
            const current_year = new Date().getFullYear();
            const year = current_year - await Student.findOne({
                attributes:['year'],
                where :{
                    studentId: student
                }
            }).then(async(stu)=>{
                return stu.get('year');
            });
            const planId = plan.get('id');
            const courses = await SelectedCourse.findAll({
                attributes :['courseCode'],
                where : {
                    AdvisingSessionId: planId
                }
            }).then(courses => courses.map(course => {
                return course.get('courseCode');
            }));
            return{
                year:year,
                status:stat,
                courses:courses
            }
        });
        return courseplan;
    }catch(error){
        const msg = `Error in getting student's ${studentId} courseplan for semesterId ${semesterId}:`;
        console.log(msg,error.message);
        return null;
    }
}
module.exports = { getStudentCoursePlan, getStudentCoursePlanSimple }