/* 
    constants to enable connectivity between components and encryption using bcrypt
    bcrypt and saltRounds enable authorization and encryption
    jwt uses the passport module to create and store a user token
*/
const router = require("express").Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// import models
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const jwtGeneratorStudent = require("../utilities/jwtStudent");
const jwtGeneratorStaff = require("../utilities/jwtStaff");

// ---Routes---

// login to student or staff account
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("LOG::> Username: ", username);
        console.log("LOG::> Password: ", password);

        // Query Admin and Student in parallel
        const [admin, student] = await Promise.all([
            Admin.findOne({ where: { "adminID": username } }),
            Student.findOne({ where: { "studentId": username } })
        ]);

        if (!admin && !student) {
            return res.status(401).send("This account does not exist.");
        }

        if (admin) {
            // Compare password
            const passCompare = await bcrypt.compare(password, admin.password);
            if (!passCompare) {
                return res.status(401).send("Invalid Password.");
            }

            // Generate token for admin user
            const token = jwtGeneratorStaff(admin.adminID);
            return res.json({
                "accountType": "admin",
                "adminID": admin.adminID,
                "firstName": admin.firstName,
                "lastName": admin.lastName,
                "email": admin.email,
                "createdAt": admin.createdAt,
                "token": token
            });
        }

        if (student) {
            const passCompare2 = await bcrypt.compare(password, student.password);
            if (!passCompare2) {
                return res.status(401).send("Invalid Password");
            }

            // Generate token for student user
            const token = jwtGeneratorStudent(student.studentId);
            return res.json({
                "accountType": "student",
                "studentId": student.studentId,
                "firstName": student.firstName,
                "lastName": student.lastName,
                "email": student.email,
                "programmeId": student.programmeId,
                "createdAt": student.createdAt,
                "token": token
            });
        }

        res.status(401).send("Unauthorized Access");

    } catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
