const Type = require("../models/Type");
const ProgrammeCourse = require("../models/ProgrammeCourse");
const StudentCourse = require("../models/StudentCourse");
const Student = require("../models/Student");
const Course = require("../models/Course");
const PCR = require("../models/ElectiveRequirement");
const { Op } = require("sequelize");

//programmeId, studentCourseCodes, programmeCourses, courses, programmeCreditRequirements, types

// returns the students degree progress(list of completed courses, total credits completed, remaining requirements and total credits remaining)
async function getDegreeProgress(student_id) {

    const studentCourses = await StudentCourse.findAll({ where: { studentId: student_id } });
    let studentCourseCodes = [];
    for (i = 0; i < studentCourses.length; i++) {
        studentCourseCodes.push(studentCourses[i].dataValues.courseCode);
    }
    console.log("student courses: ", studentCourseCodes);


    // Get programme id from student model
    const programmeId = await Student.findOne({
        attributes: ['programmeId'],
        where: {
            studentId: student_id
        }
    }).then(async (programme) => {
        return programme.get('programmeId');
    });

    //  get programme courses for programmeId
    const programmeCourse = await ProgrammeCourse.findAll({ where: { programmeId } });
    let programmeCourses = [];
    for (i = 0; i < programmeCourse.length; i++) {
        programmeCourses.push(programmeCourse[i].dataValues);
    }
    console.log("programmeCourse: ", programmeCourses);

    //  get courses
    let course = await Course.findAll();
    let courses = [];
    for (i = 0; i < course.length; i++) {
        courses.push(course[i].dataValues);
    }
    console.log("courses: ", courses);

    // get programmeCreditRequirements
    let pcrs = await PCR.findAll({ where: { programmeId } });
    let programmeCreditRequirements = [];
    for (i = 0; i < pcrs.length; i++) {
        programmeCreditRequirements.push(pcrs[i].dataValues);
    }
    console.log("PCR: ", programmeCreditRequirements);

    // get types
    let type = await Type.findAll();
    let types = [];
    for (i = 0; i < type.length; i++) {
        types.push(type[i].dataValues);
    }
    console.log("types: ", types);


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


