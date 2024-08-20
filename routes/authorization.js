/* 
    constants to enable connectivity between components and encryption using bcrypt
    bcrypt and saltRounds enable authorization and encryption
    jwt uses the passport module to create and store a user token
*/
const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// import models
const Student = require("../models/Student");
const Admin = require("../models/Admin");

// ---Routes---

// login to student or staff account
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if(process.env.NODE_ENV === 'development'){
            console.log("LOG::> Username: ", username);
            console.log("LOG::> Passowrd: ", password);
        }

        const student = await Student.findOne({ where: { "studentId": username } });
        const admin = await Admin.findOne({ where: { "adminID": username } });
        const account = student || admin;

        if(!account) return res.status(401).send("Invalid account or password");
        if(!(await bcrypt.compare(password,account.password)))
            return res.status(401).send("Invalid account or password");
        //if no statement above triggered, account is valid, now time to set jwt
        //the jwt is set for a student if it's a student and admin if it's an admin
        const key = student? process.env.studentSecret: process.env.staffSecret;
        const user = student? student.studentId: admin.adminID;
        const accountType = student? "student": "admin";
        const token = jwt.sign({user}, key, {expiresIn:"24hr"});
        const idname = student? "studentId": "adminID";
        let student_extra_attrs = student? {programmeId:student.programmeId}: {}
        res.json({
            token,
            accountType,
            email: admin.email,
            ...student_extra_attrs,
            [idname]: account[idname],
            firstName: admin.firstName,
            lastName: admin.lastName,
            createdAt: admin.createdAt
        })
    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
