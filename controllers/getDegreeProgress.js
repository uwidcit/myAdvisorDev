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
    for (let creditType in creditRequirements) {
        degreeCredits += creditRequirements[creditType][0];
        for (let i = 0; i < studentCourseCodes.length; i++) {
            try {
                let course = courses.find((c) => c.code === studentCourseCodes[i]);
                const type = types.find(type => type.type === creditType);
                console.log(type);

                let programmeCourse = programmeCourses.find(
                    (c) => c.courseCode === studentCourseCodes[i] && c.programmeId === programmeId && c.typeId === type.id);

                if (creditRequirements[creditType][0] <= 0) {
                    break;
                }

                if (programmeCourse && !completedCourses.includes(programmeCourse.courseCode)) {
                    let credits = parseInt(course.credits);
                    completedCourses.push(course.code);
                    creditRequirements[creditType][0] -= credits;
                    totalCredits += credits;
                    console.log(completedCourses);
                }

            } catch (error) {
                console.error("Error fetching course or programme course:", error);
            }
        }
    }
    let degreeProgress = {
        Requirements: creditRequirements, 
        totalCompletedCredits: [totalCredits, degreeCredits],
        remainingCredits: degreeCredits - totalCredits
    };
    return degreeProgress;
}


module.exports = { getDegreeProgress };


