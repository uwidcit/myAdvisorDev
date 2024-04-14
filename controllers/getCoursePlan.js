const ProgrammeCourse = require("../models/ProgrammeCourse");
const StudentCourse = require("../models/StudentCourse");
const SemesterCourse = require("../models/SemesterCourse");
const Student = require("../models/Student");
const Course = require("../models/Course");
const ElectiveRequirement = require("../models/ElectiveRequirement");
const Type = require("../models/Type");
const { Op } = require("sequelize");
const { getEligibleCourses } = require("../controllers/getEligibleCourses");
const { getDegreeProgress } = require("../controllers/getDegreeProgress");
const { getPlannedCourses } = require("../controllers/getPlannedCourses");

async function getCoursePlan(studentId, semesterId) {
    const programme_id = await Student.findOne({
        attributes: ['programmeId'],
        where: {
            studentId: studentId
        }
    }).then(async (programme) => {
        return programme.get('programmeId');
    });

    // const programme_courses = await ProgrammeCourse.findAll({
    //     attributes: ['courseCode'],
    //     where: {
    //         ProgrammeId: programme_id
    //     }
    // });
    // const student_courses = await StudentCourse.findAll({
    //     attributes: ['courseCode'],
    //     where: {
    //         studentId: studentId
    //     }
    // }).then(async (std_courses) => {
    //     return std_courses.map(std => std.get('courseCode'));
    // });
    // const courses = await Course.findAll();
    // const credit_requirements = await ElectiveRequirement.findAll({
    //     where: {
    //         ProgrammeId: programme_id
    //     }
    // });
    // const types = await Type.findAll();
    let eligiblecoursesObj = [];
    let coursePlan = [];

    //where selected courses can pull from
    const courses_eligible = await getEligibleCourses(studentId, semesterId);
    const degree_progress = await getDegreeProgress(studentId);//use to determine effect of selected courses
    const planned_courses = await getPlannedCourses(studentId, semesterId);//what is displayed on the courseplan

    if (courses_eligible) {
        // get eligibleCourses
        for (let course_c of courses_eligible) {
            const typeName = await Type.findOne({
                attributes: ['type'],
                where: {
                    id: await ProgrammeCourse.findOne({
                        attributes: ['typeId'],
                        where: {
                            [Op.and]: [
                                { courseCode: course_c },
                                { programmeId: programme_id }
                            ]
                        }
                    }).then(async (programme) => {
                        return programme.get('typeId');
                    })
                }
            }).then(async (type) => {
                return type.get('type')
            });

            const [courseName, credits] = await Course.findOne({
                attributes: ['title', 'credits'],
                where: {
                    code: course_c
                }
            }).then(async (content) => {
                return [content.get('title'), content.get('credits')]
            });
            eligiblecoursesObj.push({
                "courseCode": course_c,
                "courseTitle": courseName,
                "type": typeName,
                "selected": false,
                "credits": credits
            })
        }
    }

    if (planned_courses) {
        for (let courseCode of planned_courses) {
            // console.log("planned: ", courseCode);
            const courseToUpdate = eligiblecoursesObj.find((course) => course['courseCode'] === courseCode);
            if (courseToUpdate) {
                courseToUpdate.selected = true;
                // console.log(courseToUpdate);
            }
        }


    }

    if (planned_courses) {

        // console.log("degree_progress Requiremtns: ", degree_progress.Requirements);

        for (type in degree_progress.Requirements) {
            let planData = {};
            let plancourses = [];
            planData["creditType"] = type;
            planData["creditsRemaining"] = degree_progress.Requirements[type][0];
            // console.log(type);
            // console.log(degree_progress.Requirements[type][0]);
            for (let e of eligiblecoursesObj) {
                if (e.type === type) {
                    if (e.selected) {
                        planData["creditsRemaining"] -= e.credits;
                    }
                    // console.log(plannedCoursesObj);


                    // console.log("planData.creditsRemaining",planData.creditsRemaining);
                    // console.log("remaining credits",planData["creditsRemaining"]);
                    plancourses.push(e);
                }
            }
            planData["creditsRemaining"] = [planData.creditsRemaining, degree_progress.Requirements[type][1]];
            planData["Courses"] = plancourses;
            coursePlan.push(planData);
        }

    } else {
        for (type in degree_progress.Requirements) {
            let planData = {};
            let plancourses = [];
            planData
            planData["creditType"] = type;
            planData["creditsRemaining"] = degree_progress.Requirements[type][0];
            // console.log(type);
            // console.log(degree_progress.Requirements[type][0]);

            planData["creditsRemaining"] = [degree_progress.Requirements[type][0], degree_progress.Requirements[type][1]];
            planData["Courses"] = plancourses;



            coursePlan.push(planData);

        }
    }

    // console.log("COURSEPLAN:::> ", coursePlan);

    // coursePlan.forEach(item => {
    //     console.log(`Credit Type: ${item.creditType}`);
    //     console.log(`Credits Remaining: ${item.creditsRemaining}`);

    //     // Iterate over each course in Courses array
    //     item.Courses.forEach(course => {
    //         console.log(`Course Name: ${course.courseCode}`);
    //         // Print other properties of the course if needed
    //     });

    //     console.log(); // Add a line break for readability
    // });

    return coursePlan;

}
// (async () => {
//     const test = await getCoursePlan('816031565', 2);
//     console.log(test);
// })()
module.exports = { getCoursePlan };