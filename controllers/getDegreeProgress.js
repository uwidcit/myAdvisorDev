const Type = require("../models/Type");


// returns the students degree progress(list of completed courses, total credits completed, remaining requirements and total credits remaining)
function getDegreeProgress(programmeId, studentCourseCodes, programmeCourses, courses, programmeCreditRequirements, types) {

    let totalCredits = 0;
    let completedCourses = [];
    let degreeCredits = 0;

    creditRequirements = {};

    for (let ct of programmeCreditRequirements) {
        const creditType = types.find(type => type.id === ct.typeId);
        if (creditType) {
            creditRequirements[creditType.type] = [ct.amount, ct.amount];
        }
    }
    // console.log("creditRequirements: ", creditRequirements);
    // console.log("LENGTH:", studentCourseCodes.length);
    for (let creditType in creditRequirements) {
        degreeCredits += creditRequirements[creditType][0];
        for (let i = 0; i < studentCourseCodes.length; i++) {
            try {
                let course = courses.find((c) => c.code === studentCourseCodes[i]);

                // console.log("COURSE<<<<<>>>>>>: ", course.code);

                const type = types.find(type => type.type === creditType);
                console.log(type);

                let programmeCourse = programmeCourses.find((c) => c.courseCode === studentCourseCodes[i] && c.programmeId === programmeId && c.typeId === type.id);

                // console.log("code: ", studentCourseCodes[i]);
                // console.log("progId", programmeId);
                // console.log("typeId", type.id);
                // console.log("PROGRAMMECOURSE<<<<<>>>>>>: ", programmeCourse.courseCode);

                if (creditRequirements[creditType][0] <= 0) {
                    break;
                }

                if (programmeCourse && !completedCourses.includes(programmeCourse.courseCode)) {
                    let credits = parseInt(course.credits);
                    completedCourses.push(course.code);
                    creditRequirements[creditType][0] -= credits;
                    totalCredits = totalCredits + credits;
                    console.log(completedCourses);
                }

            } catch (error) {
                console.error("Error fetching course or programme course:", error);
            }
        }
    }


    // console.log(creditRequirements);

    // let remainingRequirements = [];
    // for (let type in creditRequirements) {
    //     // console.log("<><><><>", programmeCreditRequirements[type].amount)
    //     remainingRequirements.push({ type, remainingCredits: creditRequirements[type] });
    // }
    let degreeProgress = {
        Requirements: creditRequirements, //remainingRequirements,
        //completedCourses: completedCourses,
        totalCompletedCredits: [totalCredits, degreeCredits],
        remainingCredits: degreeCredits - totalCredits
    };
    // console.log("degree progress: ",degreeProgress);

    return degreeProgress;
}


module.exports = { getDegreeProgress };


