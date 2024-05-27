const router = require("express").Router();
const fs = require('fs');

// import models
const Semester = require("../models/Semester");
const SemesterCourse = require("../models/SemesterCourse");
const AdvisingSession = require("../models/AdvisingSession");
const SelectedCourse = require("../models/SelectedCourse");
const Course = require("../models/Course");
const studentAccountVerification = require("../middleware/studentAccountVerification");

const { Op } = require("sequelize");

// Create a Semester
router.post("/add", async (req, res) => {
    try {
        // destructure data entered
        const { startDate, endDate, num, academicYear, courses } = req.body;

        // check if semester is already added
        let semester = await Semester.findOne({ where: { num, academicYear } });
        if (semester) {
            return res.status(401).send("Semester already exists.");
        }
        else {
            await Semester.create({
                startDate,
                endDate,
                num,
                academicYear
            })
                .then(() => {
                    return res.status(200).send("Semester added!");
                })
                .catch(err => {
                    console.log("Error: ", err.message);
                });
        }

        semester = await Semester.findOne({ where: { num, academicYear } });
        for (let i = 0; i < courses.length; i++) {
            const semesterCourse = await SemesterCourse.findOne({
                where: {
                    courseCode: courses[i],
                    semesterId: semester.id,
                }
            })
            if (!semesterCourse) {
                await SemesterCourse.create({
                    semesterId: semester.id,
                    courseCode: courses[i]
                })
            }
        }

    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

// Update a Semester
router.put("/update", async (req, res) => {
    try {
        // destructure data entered
        const { startDate, endDate, num, academicYear, courses } = req.body;

        const semester = await Semester.findOne({ where: { num, academicYear } });

        if (!semester) {
            return res.status(401).send("Semester not found.");
        }
        else {
            if (startDate)
                semester.startDate = startDate;
            if (endDate)
                semester.endDate = endDate;
            if (num)
                semester.num = num;
            if (academicYear)
                semester.academicYear = academicYear;

            // Remove courses that are not present in the updated data
            if (courses) {
                const existingCourses = await SemesterCourse.findAll({
                    where: {
                        semesterId: semester.id,
                        courseCode: { [Op.notIn]: courses }
                    }
                });
                await Promise.all(existingCourses.map(course => course.destroy()));
            }

            if (courses) {
                for (let i = 0; i < courses.length; i++) {
                    const semesterCourse = await SemesterCourse.findOne({
                        where: {
                            semesterId: semester.id,
                            courseCode: courses[i],
                        }
                    })
                    if (!semesterCourse) {
                        await SemesterCourse.create({
                            semesterId: semester.id,
                            courseCode: courses[i]
                        })
                    }
                }
            }

            await semester.save(); // Save the changes

            res.status(200).send("Semester updated successfully.");

        }
    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

// Get all Semesters
router.get("/all", async (req, res) => {
    try {
        const semesters = await Semester.findAll();
        res.status(200).json(semesters);
    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

//Get Semester by Id
router.get("/:semesterId", async (req, res) => {
    try {
        const semester = await Semester.findOne({ where: { id: req.params.semesterId } });
        res.status(200).json(semester);
    }
    catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});

// Get Courses for a Semester 
router.get("/courses/:semesterId", async (req, res) => {
    const { semesterId } = req.params;

    try {
        // Find the semester by ID
        const semester = await Semester.findOne({ where: { id: semesterId } });

        if (!semester) {
            return res.status(404).send("Semester not found.");
        }

        // let courses;

        // // Fetch courses based on semester.num
        // switch (semester.num) {
        //     case '1':
        //         courses = await Course.findAll({ where: { 
        //             semester: '1'
        //         } });
        //         break;
        //     case '2':
        //         courses = await Course.findAll({ where: { 
        //             semester: '2',
        //         } });
        //         break;
        //     case '3':
        //         // Fetch courses for both semesters in one query (assuming semester is stored in a numeric field)
        //         courses = await Course.findAll({
        //             where: {
        //                 OR: [
        //                     { semester: '1'  },
        //                     { semester: '2'  },
        //                 ],
        //             },
        //         });
        //         break;
        //     default:
        //         return res.status(400).send("Invalid semester number.");
        // }

        const semesterCourses = await SemesterCourse.findAll({
            include: [{ model: Course }],
            where: { semesterId },
        });
        const courses = semesterCourses.map((sc) => sc.course);
        
        
        let filteredCourses;

        switch (semester.num) {
            case '1':
                filteredCourses = courses.filter((course) => course.semester === '1' );
                break;
            case '2':
                filteredCourses = courses.filter((course) => course.semester === '2' );
                break;
            case '3':
                filteredCourses = courses.filter((course) => course.semester === '1' || course.semester === '2');
                break;
            default:
                filteredCourses = [];
        }
        

        // // Prepare the data to be written to the file
        const dataToSend = {
            courses: filteredCourses,
            length: filteredCourses.length
        };

        // // Write the data to a file named 'courses.json'
        // fs.writeFile('get_semester_courses.json', JSON.stringify(dataToSend, null, 2), (err) => {
        //     if (err) {
        //         console.error("Error writing to file:", err.message);
        //         return res.status(500).send("Server Error");
        //     }
        //     console.log("File has been written successfully.");
        // });

        
        res.status(200).json(dataToSend);
    } catch (err) {
        console.error("Error fetching semester courses:", err.message);
        res.status(500).send("Server Error");
    }
});




router.post("/plan", studentAccountVerification, async (req, res) => {
    const { semesterId, courses } = req.body;
    const studentId = req.user;

    try {
        // Find and delete existing advising session along with advised courses
        await AdvisingSession.destroy({
            where: {
                studentId: studentId,
                semesterId: semesterId,
            },
            cascade: true, // Delete associated advised courses
        });

        // Create a new advising session
        const newAdvisingSession = await AdvisingSession.create({
            studentId: studentId,
            semesterId: semesterId,
        });

        let isError = false;

        // Add new advised courses
        for (let i = 0; i < courses.length; i++) {
            try {
                await SelectedCourse.create({
                    advisingSessionId: newAdvisingSession.id,
                    courseCode: courses[i],
                });
            } catch (err) {
                console.log("Error: ", err.message);
                isError = true;
            }
        }

        if (isError) {
            res.status(500).send("Error occurred while adding advised courses");
        } else {
            res.status(200).send("Semester Planned!");
        }
    } catch (err) {
        console.log("Error: ", err.message);
        res.status(500).send("Server Error");
    }
});


router.get("/courses/:department/:semesterId", async (req, res) => {

    let department = req.params.department;
    let semesterId = req.params.semesterId;

    let courses = await Course.findAll({ where: { department } })

    let semesterCourses = await SemesterCourse.findAll({ where: { semesterId } })

    let semesterCoursesInDepartment = semesterCourses.filter(semesterCourse => {
        
        return courses.some(course => course.courseCode === semesterCourse.courseCode);
    });

    // console.log("semesterCourses in department: ", semesterCoursesInDepartment);
    res.json(semesterCoursesInDepartment);

    // console.log("courses: ", courses);

});


router.get("/flags/:semesterId", async (req, res) => {



});


module.exports = router;
