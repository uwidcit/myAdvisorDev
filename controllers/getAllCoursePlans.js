const Student = require("../models/Student");
const AdvisingSession = require("../models/AdvisingSession");
const SelectedCourse = require("../models/SelectedCourse");
const Semester = require("../models/Semester");
async function getAllCoursePlans(semesterId) {
    try {
        const coursePlans = await Semester.findOne({
            where: { id: semesterId },
            include: [{
                model: AdvisingSession,
                include: [{
                    model: SelectedCourse,
                    include: [{
                        model: Course,
                        attributes: ['code', 'title', 'credits']
                    }]
                }, {
                    model: Student,
                    attributes: ['studentId', 'firstName', 'lastName']
                }]
            }],
            attributes: ['id', 'num', 'academicYear']
        });

        if (!coursePlans) {
            console.log(`No course plans found for semesterId ${semesterId}`);
            return null;
        }

        return coursePlans;
    } catch (error) {
        const msg = `Error in getting all student courseplans for semesterId ${semesterId}:`;
        console.log(msg, error.message);
        return null;
    }
}
// (async () => {
//     console.log(await getAllCoursePlans(2));
// })()
module.exports = { getAllCoursePlans }