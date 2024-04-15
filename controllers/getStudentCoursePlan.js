const AdvisingSession = require("../models/AdvisingSession");
const { getCoursePlan } = require("./getCoursePlan");
async function getStudentCoursePlan(studentId,semesterId){
    try{
        const advising_info = await AdvisingSession.findOne({
            attributes :['planStatus','updatedAt'],
            where: {
                studentId: studentId
            }
        }).then(info => {
            const date = JSON.stringify(info.get('updatedAt')).split("T")[0].substring(1)
            return [info.get('planStatus'),date]
        })
        const plan = await getCoursePlan(studentId, semesterId);
        return {
            [studentId] :{
                lastUpdated : advising_info[1],
                status: advising_info[0],
                plan: plan,
                limit: 15
            }
        }
    }catch(error){
        const msg = `Error in getting student's ${studentId} courseplan for semesterId ${semesterId}:`;
        console.log(msg,error.message);
        return null;
    }
}
module.exports = { getStudentCoursePlan }