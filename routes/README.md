# Routes
# About
This directory has the routes defined for the various endpoint concepts such as authorisation, admin, student, etc. This is the bread and butter of this backend github repo, endpoint wise. The key to understanding the relationship between the routes and index.js is reading up on [express router](https://expressjs.com/en/guide/routing.html). Be advised of `routerUtils.js` which is relied on inside here and exists in the controllers folder



# To Note
### Public Routes
Besides authorization, should the others be publicly accessible without any implied authentication? idk but here they are:

- `courses.js`
- `authorization.js`
- `programmes.js`
- `semester.js` (minus the _"plan"_ route inside of it)

### Routes Using Controllers Other than routerUtils
- `admin.js`
- `student.js`
- `transcript.js`



## Admin
The documented routes here are defined as `some_domain/admin` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/admin/test` and this is sourced from **admin.js**
- **POST** `/create/admin`: nothing to describe yet, just documenting the route for now
- **POST** `/create/student`: nothing to describe yet, just documenting the route for now
- **GET** `/course-plan/all/:semesterId/:page/:itemsPerPage`: nothing to describe yet, just documenting the route for now
- **GET** `/course-plan/:semesterId/:studentId`: nothing to describe yet, just documenting the route for now
- **PUT** `/course-plan/review/:semesterId/:studentId/:decision`: nothing to describe yet, just documenting the route for now
- **GET** `/student/advising-sessions`: nothing to describe yet, just documenting the route for now
- **GET** `/detailed-course-plan/all`: nothing to describe yet, just documenting the route for now
- **POST** `/parse/programmeCourse`: nothing to describe yet, just documenting the route for now
- **POST** `/parse/programmeCourseXLSX`: nothing to describe yet, just documenting the route for now
- **GET** `/degreeProgress/all`: nothing to describe yet, just documenting the route for now
- **GET** `/studentsSummary`: nothing to describe yet, just documenting the route for now
- **GET** `/students`: nothing to describe yet, just documenting the route for now
- **GET** `/student/:studentId`: nothing to describe yet, just documenting the route for now
- **GET** `/degreeProgress/:studentId`: nothing to describe yet, just documenting the route for now

## Accounts
The documented routes here are defined as `some_domain/accounts` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/accounts/test` and this is sourced from **authorization.js**
- **POST** `/login`: nothing to describe yet, just documenting the route for now

## Courses
The documented routes here are defined as `some_domain/courses` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/courses/test` and this is sourced from **courses.js**
- **GET** `/all`: nothing to describe yet, just documenting the route for now
- **GET** `/departments`: nothing to describe yet, just documenting the route for now
- **GET** `/view/:code`: nothing to describe yet, just documenting the route for now
- **POST** `/add`: nothing to describe yet, just documenting the route for now
- **PUT** `/edit/:code`: nothing to describe yet, just documenting the route for now
- **DELETE** `/delete/:code`: nothing to describe yet, just documenting the route for now
- **GET** `/prereqs/:id`: nothing to describe yet, just documenting the route for now
- **GET** `/:departmenttype`: nothing to describe yet, just documenting the route for now
- **GET** `/related-courses/:dept/:semNum`: nothing to describe yet, just documenting the route for now

## Programmes
The documented routes here are defined as `some_domain/programmes` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/programmes/test`
- **GET** `/all`: nothing to describe yet, just documenting the route for now
- **GET** `/:programmeId`: nothing to describe yet, just documenting the route for now
- **POST** `/add`: nothing to describe yet, just documenting the route for now
- **POST** `/add/course`: nothing to describe yet, just documenting the route for now
- **DELETE** `/delete/:programmename`: nothing to describe yet, just documenting the route for now

## Semester
The documented routes here are defined as `some_domain/semester` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/semester/test`
- **POST** `/add`: nothing to describe yet, just documenting the route for now
- **PUT** `/update`: nothing to describe yet, just documenting the route for now
- **GET** `/all`: nothing to describe yet, just documenting the route for now
- **GET** `/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/semesterCourses/:dept/:semNum`: nothing to describe yet, just documenting the route for now
- **POST** `/plan`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/:department/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/flags/:semesterId`: this route is declared but has _no code_ for the route

## Student
The documented routes here are defined as `some_domain/student` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/student/test`
- **POST** `/create-plan`: nothing to describe yet, just documenting the route for now
- **POST** `/academic-advising/session/:studentId`: nothing to describe yet, just documenting the route for now
- **GET** `/eligibleCourses/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/degreeProgress`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/:studentId`: nothing to describe yet, just documenting the route for now
- **GET** `/course-plan/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/course-plan/detail/:semesterId`: nothing to describe yet, just documenting the route for now
- **GET** `/course-plans/:semesterId`: nothing to describe yet, just documenting the route for now

## Transcript
The documented routes here are defined as `some_domain/transcript` and then the rest of the url, for example a description on `/test` would actually be a description on `some_domain/transcript/test`
- **GET** `/details/all`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/all`: nothing to describe yet, just documenting the route for now
- **GET** `/details/view/:studentId`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/view`: nothing to describe yet, just documenting the route for now
- **GET** `/courses/viewAll/:studentId`: nothing to describe yet, just documenting the route for now
- **POST** `/details/add`: nothing to describe yet, just documenting the route for now
- **POST** `/courses/add`: nothing to describe yet, just documenting the route for now
- **POST** `/parseForm`: nothing to describe yet, just documenting the route for now
- **PUT** `/details/edit/:studentId`: nothing to describe yet, just documenting the route for now
- **PUT** `/courses/edit`: nothing to describe yet, just documenting the route for now
- **DELETE** `/details/delete/:studentId`: nothing to describe yet, just documenting the route for now
- **DELETE** `/courses/delete`: nothing to describe yet, just documenting the route for now
- **DELETE** `/courses/deleteAll/:studentId`: nothing to describe yet, just documenting the route for now
- **GET** `/course/options`: nothing to describe yet, just documenting the route for now