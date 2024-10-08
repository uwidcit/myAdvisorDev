const { Sequelize } = require("sequelize");
const db = require("../db");

// const StudentCourse = require("./StudentCourse");
// const AdvisingSession = require("./AdvisingSession");
const Semester = db.define("semester", {
    startDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    num: {
        type: Sequelize.ENUM('1', '2', '3'),
        allowNull: false
    },
    academicYear: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
// Semester.hasMany(StudentCourse, {
//     foreignKey: 'semesterId',
//     allowNull: false
// });
// Semester.hasMany(SemesterCourse, {
//     foreignKey: 'semesterId',
//     allowNull: false
// });
// Semester.hasMany(AdvisingSession, {
//     foreignKey: 'semesterId',
//     allowNull: false
// });
module.exports = Semester;
