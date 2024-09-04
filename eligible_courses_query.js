const { Sequelize } = require("sequelize");
const fs = require('fs').promises;
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: 'localhost', // Update with your PostgreSQL host
    port: 5432,        // Default PostgreSQL port
    database: 'myadvisor', // Update with your database name
    username: 'postgres', // Update with your username
    password: 'postgres', // Update with your password
    pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function getEligibleCoursesBySemesterId(studentId, currentSemesterId) {
    const query = `
    WITH student_programme AS (
    SELECT "programmeId"
    FROM "students"
    WHERE "studentId" = :studentId
),
completed_courses AS (
    SELECT "courseCode"
    FROM "studentcourses"
    WHERE "studentId" = :studentId AND "grade" IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F1', 'F2', 'F3', 'EX')
),
eligible_courses AS (
    SELECT sc."courseCode"
    FROM "semestercourses" sc
    JOIN "courses" c ON sc."courseCode" = c."code"
    JOIN "programmes" p ON p."id" = (SELECT "programmeId" FROM student_programme)
    WHERE sc."semesterId" = :currentSemesterId
      AND c."code" NOT IN (SELECT "courseCode" FROM completed_courses)
      AND c."code" NOT IN (
          SELECT "antirequisiteCourseCode"
          FROM "antirequisites"
          WHERE "courseCode" IN (SELECT "courseCode" FROM completed_courses)
      )
      AND NOT EXISTS (
          SELECT 1
          FROM "prerequisites" pr
          LEFT JOIN "courseGroups" cg ON pr."groupId" = cg."groupId"
          WHERE pr."courseCode" = c."code"
          AND (
              pr."groupId" IS NULL AND pr."courseCode" NOT IN (SELECT "courseCode" FROM completed_courses)
              OR
              pr."groupId" IS NOT NULL AND NOT EXISTS (
                  SELECT 1
                  FROM completed_courses cc
                  WHERE cg."courseCode" = cc."courseCode"
              )
          )
      )
)
SELECT c."code", c."title"
FROM eligible_courses ec
JOIN "courses" c ON ec."courseCode" = c."code";
  `;

    const results = await sequelize.query(query, {
        replacements: { studentId: studentId, currentSemesterId: currentSemesterId },
        type: sequelize.QueryTypes.SELECT
    });

    console.log(results);
}

async function getEligibleCourses(studentId) {
    const query = `
    WITH student_programme AS (
    SELECT "programmeId"
    FROM "students"
    WHERE "studentId" = :studentId
),
completed_courses AS (
    SELECT "courseCode"
    FROM "studentcourses"
    WHERE "studentId" = :studentId AND "grade" IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'F1', 'F2', 'F3', 'EX')
),
eligible_courses AS (
    SELECT c."code" AS "courseCode"
    FROM "courses" c
    JOIN "programmeCourses" pc ON c."code" = pc."courseCode"
    WHERE pc."programmeId" = (SELECT "programmeId" FROM student_programme)
      AND c."code" NOT IN (SELECT "courseCode" FROM completed_courses)
      AND c."code" NOT IN (
          SELECT "antirequisiteCourseCode"
          FROM "antirequisites"
          WHERE "courseCode" IN (SELECT "courseCode" FROM completed_courses)
      )
      AND NOT EXISTS (
          SELECT 1
          FROM "prerequisites" pr
          LEFT JOIN "courseGroups" cg ON pr."groupId" = cg."groupId"
          WHERE pr."courseCode" = c."code"
          AND (
              pr."groupId" IS NULL AND pr."courseCode" NOT IN (SELECT "courseCode" FROM completed_courses)
              OR
              pr."groupId" IS NOT NULL AND NOT EXISTS (
                  SELECT 1
                  FROM completed_courses cc
                  WHERE cg."courseCode" = cc."courseCode"
              )
          )
      )
)
SELECT c."code", c."title"
FROM eligible_courses ec
JOIN "courses" c ON ec."courseCode" = c."code";
  `;

    const results = await sequelize.query(query, {
        replacements: { studentId: studentId },
        type: sequelize.QueryTypes.SELECT
    });

    console.log(results);
}

async function getEligibleCoursesV1(studentId) {
    const query = `
    WITH student_info AS (
    SELECT "programmeId"
    FROM students
    WHERE "studentId" = :studentId
),
passed_courses AS (
    SELECT "courseCode"
    FROM studentcourses
    WHERE "studentId" = :studentId AND "grade" IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'EX')
),
antireqs AS (
    SELECT "antirequisiteCourseCode"
    FROM antirequisites
    WHERE "courseCode" IN (SELECT "courseCode" FROM passed_courses)
),
prereq_groups AS (
    SELECT DISTINCT p."courseCode", p."groupId"
    FROM prerequisites p
    WHERE p."groupId" IS NOT NULL
),
fulfilled_prereq_groups AS (
    SELECT pg."courseCode"
    FROM prereq_groups pg
    JOIN "courseGroups" cg ON pg."groupId" = cg."groupId"
    JOIN passed_courses pc ON cg."courseCode" = pc."courseCode"
    GROUP BY pg."courseCode", pg."groupId"
    HAVING COUNT(DISTINCT cg."courseCode") > 0
)
SELECT DISTINCT c.code, c.title, c.semester
FROM courses c
JOIN "programmeCourses" pc ON c.code = pc."courseCode"
JOIN student_info si ON pc."programmeId" = si."programmeId"
WHERE c.code NOT IN (SELECT "courseCode" FROM passed_courses)
  AND c.code NOT IN (SELECT "antirequisiteCourseCode" FROM antireqs)
  AND NOT EXISTS (
    SELECT 1
    FROM prerequisites p
    WHERE p."courseCode" = c.code
      AND p."groupId" IS NULL
      AND p."courseCode" NOT IN (SELECT "courseCode" FROM passed_courses)
  )
  AND NOT EXISTS (
    SELECT 1
    FROM prereq_groups pg
    WHERE pg."courseCode" = c.code
      AND pg."courseCode" NOT IN (SELECT "courseCode" FROM fulfilled_prereq_groups)
  );
  `;

    const results = await sequelize.query(query, {
        replacements: { studentId: studentId },
        type: sequelize.QueryTypes.SELECT
    });

    console.log(results);
}

async function getCoursesByType(type) {
    const query = `
    SELECT c.code, c.title
    FROM Courses c
    JOIN ProgrammeCourses pc ON c.code = pc.courseCode
    JOIN Types t ON pc.typeId = t.id
    WHERE t.type = :type
  `;

    const results = await sequelize.query(query, {
        replacements: { type: type },
        type: sequelize.QueryTypes.SELECT
    });

    console.log(results);
}

async function getTranscript(studentId) {
    const query = `
    SELECT
        s.studentId,
        t.id AS transcriptId,
        sc.courseCode,
        c.title AS courseTitle,
        sc.grade,
        se.num AS semesterNumber,
        se.academicYear AS semesterYear
    FROM
        Students s
        JOIN Transcripts t ON s.studentId = t.studentId
        JOIN StudentCourses sc ON s.studentId = sc.studentId
        JOIN Courses c ON sc.courseCode = c.code
        JOIN Semesters se ON sc.semesterId = se.id
    WHERE
        s.studentId = :studentId;
    `;

    try {
        const results = await sequelize.query(query, {
            replacements: { studentId: studentId },
            type: sequelize.QueryTypes.SELECT
        });

        console.log(results);
        return results;
    } catch (error) {
        console.error("Error fetching transcript:", error);
    }
}

async function getStudentCourses(studentId) {
    const query = `
    SELECT
        s.studentId,
        sc.courseCode,
        c.title AS courseTitle,
        sc.grade,
        se.num AS semesterNumber,
        se.academicYear AS semesterYear
    FROM
        Students s
        JOIN StudentCourses sc ON s.studentId = sc.studentId
        JOIN Courses c ON sc.courseCode = c.code
        JOIN Semesters se ON sc.semesterId = se.id
    WHERE
        s.studentId = :studentId;
    `;

    try {
        const results = await sequelize.query(query, {
            replacements: { studentId: studentId },
            type: sequelize.QueryTypes.SELECT
        });

        console.log(results);
        return results;
    } catch (error) {
        console.error("Error fetching student courses:", error);
    }
}

async function getAllTables() {
    const query = `
    SELECT name 
    FROM sqlite_master 
    WHERE type='table' 
    ORDER BY name;
    `;

    try {
        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });

        console.log("Available tables:");
        results.forEach(result => {
            console.log(result.name);
        });

        return results.map(result => result.name);
    } catch (error) {
        console.error("Error fetching table names:", error);
    }
}

async function getAllStudentInformation() {
    const query = `
      SELECT 
          s.studentId AS studentId,
          s.firstName AS firstName,
          s.lastName AS lastName,
          s.year as year,
          s.email AS email,
          s.programmeId AS programmeId,
          p.name AS programmeName,
          p.faculty AS programmeFaculty,
          p.department AS programmeDepartment,
          p.version AS programmeVersion,
          t.id AS transcriptId,
          t.gpa AS transcriptGPA,
          t.degree AS transcriptDegree,
          t.major AS transcriptMajor,
          t.admitTerm AS transcriptAdmitTerm,
          t.degreeAttemptHours AS transcriptAttemptHours,
          t.degreePassedHours AS transcriptPassedHours,
          t.degreeEarnedHours AS transcriptEarnedHours,
          t.degreeGpaHours AS transcriptGPAHours,
          t.degreeQualityPoints AS transcriptQualityPoints,
          ad.dateawarded AS awardedDegreeDate,
          sc.courseCode AS enrolledCourseCode,
          c.title AS enrolledCourseTitle,
          c.credits AS enrolledCourseCredits,
          c.semester AS enrolledCourseSemester,
          sc.grade AS enrolledCourseGrade
      FROM 
          Students s
      LEFT JOIN 
          Programmes p ON s.programmeId = p.id
      LEFT JOIN 
          Transcripts t ON s.studentId = t.studentId
      LEFT JOIN 
          AwardedDegrees ad ON s.studentId = ad.studentId
      LEFT JOIN 
          StudentCourses sc ON s.studentId = sc.studentId
      LEFT JOIN 
          Courses c ON sc.courseCode = c.code
      ORDER BY 
          s.studentId;
    `;

    try {
        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });
        console.log(results);
    } catch (error) {
        console.error('Error executing query:', error);
    }
}

async function getColumnNamesAndTypes(tableName) {
    const query = `
        SELECT 
            c.column_name, 
            c.data_type, 
            c.column_default, 
            c.is_nullable, 
            c.character_maximum_length,
            tc.constraint_type,
            kcu.constraint_name
        FROM information_schema.columns c
        LEFT JOIN information_schema.key_column_usage kcu
            ON c.table_name = kcu.table_name 
            AND c.column_name = kcu.column_name
        LEFT JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
            AND kcu.table_name = tc.table_name
        WHERE c.table_name = :tableName
    `;

    const results = await sequelize.query(query, {
        replacements: { tableName: tableName },
        type: sequelize.QueryTypes.SELECT
    });

    const tableSchema = {};

    results.forEach(row => {
        tableSchema[row.column_name] = {
            type: row.data_type,
            default: row.column_default,
            nullable: row.is_nullable,
            maxLength: row.character_maximum_length,
            constraint: row.constraint_type || null,
            constraintName: row.constraint_name || null
        };
    });

    return tableSchema;
}

async function generateSchemaJSON() {
    const schemaJSON = {};

    for (const tableName of tableNames) {
        schemaJSON[tableName] = await getColumnNamesAndTypes(tableName);
    }

    return schemaJSON;
}

async function writeSchemaToJSON() {
    try {
        const schema = await generateSchemaJSON();
        await fs.writeFile('database_schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema has been written to database_schema.json');
    } catch (error) {
        console.error('Error writing schema to JSON:', error);
    }
}

const tableNames = [
    "SelectedCourses",
    "admins",
    "advisingsessions",
    "antirequisites",
    "awardedDegrees",
    "courseGroups",
    "courses",
    "electiveRequirements",
    "groups",
    "prerequisites",
    "programmeCourses",
    "programmes",
    "semestercourses",
    "semesters",
    "studentcourses",
    "students",
    "transcripts",
    "types"
];

writeSchemaToJSON();
// getEligibleCoursesBySemesterId('816030787', 1).catch(err => console.error(err));
// getEligibleCourses('816030787').catch(err => console.error(err));
// getEligibleCoursesV1('816030787').catch(err => console.error(err));
// getCoursesByType('L1CORE').catch(err => console.error(err));
// getTranscript('816030787').catch(err => console.error(err));
// getStudentCourses('816030787').catch(err => console.error(err));
// getAllTables().catch(err => console.error(err));
// getAllStudentInformation().catch(err => console.error(err));
// initializeDatabase().catch(err => console.error(err));