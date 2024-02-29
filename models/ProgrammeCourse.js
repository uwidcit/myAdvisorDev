//Development State
const { Sequelize } = require("sequelize");
const db = require("../db");
// const Programme = require("./Programme");
// const Course = require("./Course");
// const Type = require("./Type");

const ProgrammeCourse = db.define("programmeCourse", {
  // has a default primary key id
  programmeId: {
    type: Sequelize.INTEGER,
    // references: {
    //   model: Programme,
    //   key: 'id'
    // }
  },
  courseCode: {
    type: Sequelize.STRING,
    // references: {
    //   model: Course,
    //   key: 'code'
    // }
  },
  typeId: {
    type: Sequelize.INTEGER,
    // references: {
    //   model: Type,
    //   key: 'id'
    // }
  }
});

module.exports = ProgrammeCourse;

// // A Course has many Programme Courses
// Course.hasMany(ProgrammeCourse, {
//   foreignKey: 'courseCode',
//   allowNull: false
// });
// // A Programme Course belongs to one Course
// ProgrammeCourse.belongsTo(Course, {
//   foreignKey: 'courseCode',
//   allowNull: false
// });

// ProgrammeCourse.belongsTo(Programme, {
//   foreignKey: 'programmeId',
//   allowNull: false
// });
// ProgrammeCourse.belongsTo(Type, {
//   foreignKey: 'typeId',
//   allowNull: false
// });
// ProgrammeCourse.belongsTo(Type, { foreignKey: 'typeId' });


module.exports = ProgrammeCourse;
// const { Sequelize } = require("sequelize");
// const db = require("../db");
// const Course = require("./Course");

// const ProgrammeCourse = db.define("programmeCourse", {
//   // has a default primary key id
// });

// // // A Course has many Programme Courses
// // Course.hasMany(ProgrammeCourse, {
// //   foreignKey: 'courseCode',
// //   allowNull: false
// // });
// // // A Programme Course belongs to one Course
// // ProgrammeCourse.belongsTo(Course, {
// //   foreignKey: 'courseCode',
// //   allowNull: false
// // });

// // ProgrammeCourse.belongsTo(Programme, {
// //   foreignKey: 'programmeId',
// //   allowNull: false
// // });
// // ProgrammeCourse.belongsTo(Type, {
// //   foreignKey: 'typeId',
// //   allowNull: false
// // });
// // ProgrammeCourse.belongsTo(Type, { foreignKey: 'typeId' });


// module.exports = ProgrammeCourse;
