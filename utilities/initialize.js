const db = require("../db");

const ProgrammesJSON = require("../programmes.json");
const CoursesJSON = require("../courses.json");
const TypesJSON = require("../types.json");
const StudentsJSON = require("../students.json");
const SemestersJSON = require("../semesters.json");
const StudentCoursesJSON = require("../studentCourses.json");
const GroupsJSON = require("../groups.json");
const CourseGroupsJSON = require("../courseGroups.json");
const PrerequisitesJSON = require("../prerequisites.json");

const Type = require("../models/Type");
const Programme = require("../models/Programme");
const Course = require("../models/Course");
const ProgrammeCourse = require("../models/ProgrammeCourse");

// const Dummytranscript = require("./dummytranscript.json")
// const DummyProgCourses = require("./dummyProgCourses.json")
require("../models/Associations");

// models
// const Admin = require("../models/Admin");
// const AdvisedCourse = require("../models/SelectedCourse");
// const AdvisingSesssion = require("../models/AdvisingSession")
// const Antirequisite = require("../models/Antirequisite");
// const AwardedDegree = require("../models/AwardedDegree");
const ElectiveRequirement = require("../models/ElectiveRequirement");
// const PotentialGraduate = require("../models/PotentialGraduate");
const Prerequisite = require("../models/Prerequisite");
const Semester = require("../models/Semester");
const Student = require("../models/Student");
const StudentCourse = require("../models/StudentCourse");
// const Transcript = require("../models/Transcript");s
const Group = require("../models/Group");
const CourseGroup = require("../models/CourseGroup");
// const SemesterCourse = require("../models/SemesterCourse");
require("../models/Associations");

async function createType({ type, description }) {
    return Type.create({ type, description });
}

async function createProgramme(programmeData) {
    return Programme.create(programmeData);
}

async function loadProgrammes(programmesJSON) {
    let promises = programmesJSON.map(createProgramme);
    try {
        await Promise.all(promises);
        console.log("Loaded Programmes");
    } catch (e) {
        console.error("Error loading programmes: ", e);
    }
}


async function createCourse(courseData) {
    return Course.create(courseData);
}

async function loadCourses(coursesJSON) {
    let promises = coursesJSON.map(createCourse);
    try {
        await Promise.all(promises);
        console.log("Loaded Courses");
    } catch (e) {
        console.error("Error loading courses: ", e);
    }
}

async function loadTypes(TypesJSON) {
    let promises = TypesJSON.map(createType);
    try {
        await Promise.all(promises);
        console.log('Loaded Types');
    } catch (e) {
        console.error("Error: ", e);
    }
}

async function createProgrammeCourse(programmeId, courseCode, typeId) {
    return ProgrammeCourse.create({ programmeId, courseCode, typeId });
}

async function loadProgrammeCourses(programmesJSON) {
    let promises = programmesJSON.map(async (programmeData) => {
        const programme = await Programme.findOne({ where: { name: programmeData.name } });
        const courseIdArray = Object.keys(programmeData.courses);

        const coursePromises = courseIdArray.map(async (courseCode) => {
            const course = await Course.findOne({ where: { code: courseCode } });;
            const typeName = await Type.findOne({
                where: {
                    type: programmeData.courses[courseCode]
                }
            });
            const typeId = await Type.findOne({
                where: {
                    type: typeName.type
                }
            });

            return createProgrammeCourse(programme.id, course.code, typeId.id);

        });

        return Promise.all(coursePromises);
    });

    try {
        await Promise.all(promises);
        console.log('Loaded Programme Courses');
    } catch (e) {
        console.error("Error loading programme courses: ", e);
    }
}


async function createElectiveRequirement(amount, programmeId, typeId) {
    return ElectiveRequirement.create({ amount, programmeId, typeId });
}

async function loadElectiveRequirements(programmesJSON) {
    let promises = programmesJSON.map(async (programmeData) => {
        const programme = await Programme.findOne({ where: { name: programmeData.name } });
        const reqIdArray = Object.keys(programmeData.requirements);

        const reqPromises = reqIdArray.map(async (type_n) => {
            const amt = programmeData.requirements[type_n];
            const typeId = await Type.findOne({
                where: {
                    type: type_n
                }
            });

            return createElectiveRequirement(amt, programme.id, typeId.id);

        });

        return Promise.all(reqPromises);
    });

    try {
        await Promise.all(promises);
        console.log('Loaded Elective Requirements');
    } catch (e) {
        console.error("Error loading Elective Requirements: ", e);
    }
}

async function createGroup(groupData) {
    return Group.create(groupData);
}

async function loadGroups(groupData) {
    let promises = groupData.map(createGroup);
    try {
        await Promise.all(promises);
        console.log("Loaded Groups");
    } catch (e) {
        console.error("Error loading groups: ", e);
    }
}

async function createCourseGroup(courseGroupData) {
    return CourseGroup.create(courseGroupData);
}

async function loadCourseGroups(courseGroupData) {
    let promises = courseGroupData.map(createCourseGroup);
    try {
        await Promise.all(promises);
        console.log("Loaded Course Groups");
    } catch (e) {
        console.error("Error loading course groups: ", e);
    }
}

async function createPrerequisite(prerequisiteData) {
    return Prerequisite.create(prerequisiteData);
}

async function loadPrerequisites(prerequisiteData) {
    let promises = prerequisiteData.map(createPrerequisite);
    try {
        await Promise.all(promises);
        console.log("Loaded Course Groups");
    } catch (e) {
        console.error("Error loading course groups: ", e);
    }
}


//Dummy data loading
async function createStudent(studentData) {
    return Student.create(studentData);
}

async function loadDummyStudents(studentsData) {
    let promises = studentsData.map(createStudent);
    try {
        await Promise.all(promises);
        console.log("Loaded Students");
    } catch (e) {
        console.error("Error loading students: ", e);
    }
}

async function createSemester(semesterData) {
    return Semester.create(semesterData);
}

async function loadDummySemesters(semesterData) {
    let promises = semesterData.map(createSemester);
    try {
        await Promise.all(promises);
        console.log("Loaded Semesters");
    } catch (e) {
        console.error("Error loading semesters: ", e);
    }
}

async function createStudentCourse(studentCorseData) {
    return StudentCourse.create(studentCorseData);
}

async function loadDummyStudentCourses(studentCorseData) {
    let promises = studentCorseData.map(createStudentCourse);
    try {
        await Promise.all(promises);
        console.log("Loaded Student Courses");
    } catch (e) {
        console.error("Error loading student courses: ", e);
    }
}



(async () => {
    await db.sync({ force: true });
    await loadTypes(TypesJSON);
    await loadCourses(CoursesJSON);
    await loadProgrammes(ProgrammesJSON);
    await loadProgrammeCourses(ProgrammesJSON);
    await loadElectiveRequirements(ProgrammesJSON);
    await loadGroups(GroupsJSON);
    await loadCourseGroups(CourseGroupsJSON);
    await loadPrerequisites(PrerequisitesJSON);
    await loadDummyStudents(StudentsJSON);
    await loadDummySemesters(SemestersJSON);
    await loadDummyStudentCourses(StudentCoursesJSON);
    console.log('Done');
})()