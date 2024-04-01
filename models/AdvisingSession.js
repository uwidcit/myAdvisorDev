const { Sequelize } = require("sequelize");
const db = require("../db");
// const Student = require("./Student");
// const Semester = require("./Semester")
// const SelectedCourse = require("./SelectedCourse");
const AdvisingSession = db.define("advisingsession", {
}, {
    timestamps: true
});
// AdvisingSession.belongsTo(Student, {
//     foreignKey: 'studentId',
//     allowNull: false
// });
// AdvisingSession.belongsTo(Semester, {
//     foreignKey: 'semesterId',
//     allowNull: false
// });
// AdvisingSession.hasMany(SelectedCourse, {
//     foreignKey: 'advisingSessionId',
//     allowNull: false
// });
// SelectedCourse.belongsTo(AdvisingSession, {
//     foreignKey: 'advisingSessionId',
//     allowNull: false
// });
module.exports = AdvisingSession;

