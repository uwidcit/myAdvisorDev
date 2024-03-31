const db = require("./db");
const bcrypt = require("bcrypt");


const Admin = require("./models/Admin");
const SelectedCourse = require("./models/SelectedCourse");
const AdvisingSesssion = require("./models/AdvisingSession")

const Antirequisite = require("./models/Antirequisite");
const AwardedDegree = require("./models/AwardedDegree");
const Course = require("./models/Course");
const ElectiveRequirement = require("./models/ElectiveRequirement");

const Prerequisite = require("./models/Prerequisite");
const Programme = require("./models/Programme");
const ProgrammeCourse = require("./models/ProgrammeCourse");
const Semester = require("./models/Semester");
const Student = require("./models/Student");
const StudentCourse = require("./models/StudentCourse");
const Transcript = require("./models/Transcript");
const Type = require("./models/Type");
const Group = require("./models/Group");
const CourseGroup = require("./models/CourseGroup");
const SemesterCourse = require("./models/SemesterCourse");
require("./models/Associations");

async function newinitializeDatabase() {
  
    try {
        if (!process.env.SYNCED) {
            // Create tables if they do not exist
            await db.sync()
            await Admin.sync();
            await Semester.sync();
            await Course.sync();
            await Programme.sync();
            await Student.sync();
            await Transcript.sync();
            await Type.sync();
            await StudentCourse.sync();
            await AdvisingSesssion.sync();
            await Antirequisite.sync();
            await SelectedCourse.sync();
            await AwardedDegree.sync();
            // await CareerCourse.sync();
            await ElectiveRequirement.sync();
            await ProgrammeCourse.sync();
            await Group.sync();
            await CourseGroup.sync();
            await Prerequisite.sync();
            await SemesterCourse.sync();

            // Creates Admin Account
            const user = await Admin.findOne({ where: { adminID: 816020000 } });//this is essentially return 1st admin object where adminID exists
            if (!user) {
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            const passEncrypt = await bcrypt.hash("adminpass", salt);

            await Admin.create({
                adminID: "816020000",
                firstName: "Admin",
                lastName: "istrator",
                email: "administratorEmail@mail.com",
                password: passEncrypt,
            });
            console.log('Admin account created.');
            } else {
            if (user) {
                console.log("Admin Already Exist.");
            } else {
                console.log("Error");
            }
        }

        process.env.SYNCED = "TRUE";
        console.log('Database tables synchronized.');
        } else {
            console.log('Database tables are already synchronized.');
        }
    } catch (error) {
        console.error('Unable to synchronize the database:', error);
    } finally {
        // Close the database connection when done
        await db.close();
    }
  
}

if (require.main === module) {
    newinitializeDatabase();
}


module.exports = newinitializeDatabase;
