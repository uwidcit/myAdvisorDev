const Student = require("../models/Student");
const AdvisingSession = require("../models/AdvisingSession");
const Programme = require("../models/Programme");
const Semester = require("../models/Semester");


async function getAllCoursePlans() {
    try {
        const students = await Student.findAll();
        const semesters = await Semester.findAll(); // Assuming you have a Semester model

        const coursePlans = [];

        for (const semester of semesters) {
            const semesterId = semester.id; // Assuming semester has an id property
            for (const student of students) {
                let studentId = student.studentId;
                let programmeId = student.programmeId;

                let courseplan = {
                    studentId: studentId,
                    programmeName: '',
                    firstName: student.firstName,
                    lastName: student.lastName,
                    year: 0,
                    courses: []
                };

                const programme = await Programme.findOne({ where: { id: programmeId } });
                if (programme) {
                    courseplan.programmeName = programme.name;
                }

                const advisingSession = await AdvisingSession.findOne({ where: { studentId, semesterId } });

                if (advisingSession) {
                    const sessionId = advisingSession.id;
                    const selectedCourses = await SelectedCourse.findAll({ where: { advisingSessionId: sessionId } });

                    for (const ac of selectedCourses) {
                        courseplan.courses.push(ac.courseCode);
                    }
                }
                courseplan = {
                    semesterId: courseplan
                }
                coursePlans[semesterId].push(courseplan);
            }
        }

        return coursePlans;
    } catch (error) {
        // Handle errors here
        console.error(error);
        throw new Error('Failed to fetch course plans.');
    }
};
