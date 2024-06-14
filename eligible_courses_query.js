const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    pool: {
        max: 50, // Maximum number of connections in the pool
        min: 0,  // Minimum number of connections in the pool
        acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
        idle: 10000  // Maximum time, in milliseconds, that a connection can be idle before being closed
    },
});

async function getEligibleCourses(studentId) {
    const query = `
    WITH student_programme AS (
    SELECT programmeId 
    FROM Students 
    WHERE studentId = :studentId
    ),
    taken_courses AS (
        SELECT courseCode 
        FROM StudentCourses 
        WHERE studentId = :studentId AND grade != 'F'
    ),
    antireqs AS (
        SELECT antirequisiteCourseCode 
        FROM Antirequisites 
        WHERE courseCode IN (SELECT courseCode FROM taken_courses)
    )
    SELECT DISTINCT c.code, c.title
    FROM Courses c
    JOIN ProgrammeCourses pc ON c.code = pc.courseCode
    JOIN student_programme sp ON pc.programmeId = sp.programmeId
    WHERE c.code NOT IN (SELECT courseCode FROM taken_courses)
    AND c.code NOT IN (SELECT antirequisiteCourseCode FROM antireqs)
    AND NOT EXISTS (
        SELECT 1
        FROM Prerequisites p
        WHERE p.courseCode = c.code
            AND p.groupId IS NULL
            AND p.courseCode NOT IN (SELECT courseCode FROM taken_courses)
    )
    AND NOT EXISTS (
        SELECT 1
        FROM Prerequisites p
        JOIN CourseGroups cg ON p.groupId = cg.groupId
        WHERE p.courseCode = c.code
            AND p.groupId IS NOT NULL
            AND NOT EXISTS (
                SELECT 1
                FROM taken_courses tc
                WHERE tc.courseCode = cg.courseCode
            )
    );
  `;

    const results = await sequelize.query(query, {
        replacements: { studentId: studentId },
        type: sequelize.QueryTypes.SELECT
    });

    console.log(results);
}

getEligibleCourses(816030787).catch(err => console.error(err));