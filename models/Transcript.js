const { Sequelize } = require("sequelize");
const db = require("../db");
// const Student = require("./Student");
const Transcript = db.define("transcript", {
    id: {
        // allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    gpa: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    name: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    degree: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    major: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    admitTerm: {
        allowNull: false,
        type: Sequelize.STRING,
    },
    degreeAttemptHours: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    degreePassedHours: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    degreeEarnedHours: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    degreeGpaHours: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    degreeQualityPoints: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
    },
    createdAt: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATEONLY,
        allowNull: false
    }
}, { timestamps: true });
module.exports = Transcript;