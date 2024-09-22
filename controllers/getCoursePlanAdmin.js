
const { getEligibleCourses } = require("../controllers/getEligibleCourses");
const { getDegreeProgress } = require("../controllers/getDegreeProgress");
const { getPlannedCourses } = require("../controllers/getPlannedCourses");

async function getCoursePlanAdmin(programmeId, studentCourseCodes, programmeCourses, semCourses, prereqs, antireqs, coursegroups, courses, programmeCreditRequirements, types, studentId, semesterId) {

    let plannedCoursesObjs = [];
    let coursePlan;
    let plannedCourseCodes = [];

    // -----------------CALL THE FUNCTIONS-------------------------


    eligibleCourses = getEligibleCourses(programmeId, studentCourseCodes, programmeCourses, semCourses, prereqs, antireqs, coursegroups);
    

    degreeProgress = getDegreeProgress(programmeId, studentCourseCodes, programmeCourses, courses, programmeCreditRequirements, types);
    

    plannedCourses = await getPlannedCourses(studentId, semesterId);

    if (plannedCoursesObjs) {





    }

    return coursePlan;

}


module.exports = { getCoursePlanAdmin };



