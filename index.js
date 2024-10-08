// constants for express routes, paths and db connection
const dotenv = require('dotenv').config();

const express = require("express");
const app = express();
const cors = require("cors");
const corsOptions =require('./config/corsOptions');
const path = require("path");
const pool = require("./db");
const passport = require("passport");
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })
const { parse } = require('./utilities/parser');
const errorHandler = require('./middleware/errorHandler');
const morgan = require('morgan');
const credentials = require('./middleware/credentials');
const bcrypt = require("bcrypt");

const port = process.env.PORT || 3002;

// app connection and resources
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.req(req, res, 'content-length'), '-',
    tokens['remote-addr'](req, res), '-',
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}));

// models
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


//import associations
require("./models/Associations");

const { ppid } = require("process");
async function newinitializeDatabase() {
  (async () => {
    try {
      if (process.env.SYNCED === "FALSE") {
        // Create tables if they do not exist
        await pool.sync()
        await Admin.sync();
        await Semester.sync();
        // await Career.sync();
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
      // await db.close();
    }
  })();


}


newinitializeDatabase();

// // if in production (deployment), changes main client path to build
// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname, "myadvisor/build")));
//   }

// routes
app.get("/", (req, res) => {
  res.status(200).send("Server running...");
});

app.use("/admin", require("./routes/admin"));

app.use("/student", require("./routes/student"));

app.use("/courses", require("./routes/courses"));

app.use("/careers", require("./routes/careers"));

app.use("/programmes", require("./routes/programmes"));

app.use("/transcript", require("./routes/transcript"));

app.use("/accounts", require("./routes/authorization"));

app.use("/semester", require("./routes/semester"));

// Error handling middleware should be the last middleware
app.use(errorHandler);

// // if a bad route is entered
// if (process.env.NODE_ENV === "production") {
//     app.get("*", (req, res) => {
//       console.log(" load home ");
//       //res.sendFile(path.join(__dirname, "myadvisor/build/index.html"));
//     });
//   } else {
//     app.get("*", (req, res) => {
//       console.log(" load home 2 ");
//       //res.sendFile(path.join(__dirname, "myadvisor/public/index.html"));
//     });
//   }

app.listen(port, () => {
  console.log(`Server is starting on port ${port}`);
});
