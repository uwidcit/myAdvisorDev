const { Op } = require("sequelize");
const SelectedCourse = require('../models/SelectedCourse');
const AdvisingSession = require('../models/AdvisingSession');
// const programmeCourse = require('../models/AdvisingSession');

async function getPlannedCourses(studentId, semesterId) {


    let advisingSession = await AdvisingSession.findOne({ 
        where: { 
            [Op.and]:[
                {studentId: studentId}, 
                {semesterId: semesterId}
            ] 
        }    
    });
    // console.log("Advising Session: ",advisingSession);
    if (advisingSession) {
        let advisingSessionId = advisingSession.dataValues.id;
        let SelectedCourses = await SelectedCourse.findAll({ 
            attributes : ['courseCode'],
            where: { advisingSessionId } 
        }).then(async (courses)=>{
            return courses.map(c => c.get('courseCode'));
        });
        return SelectedCourses
    }


}

module.exports = { getPlannedCourses };


