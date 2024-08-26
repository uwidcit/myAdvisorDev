# Routes

### About
This directory has the routes defined for the various endpoint concepts such as authorisation, admin, student, etc. This is the bread and butter of this backend github repo, endpoint wise. The key to understanding the relationship between the routes and index.js is reading up on [express router](https://expressjs.com/en/guide/routing.html). Be advised of routerUtils.js which is relied on inside here and exists in the scripts folder

### Public Routes
Besides authorization, should the others be publicly accessible without any implied authentication? idk but here they are:

- `courses.js`
- `authorization.js`
- `programmes.js`
- `semester.js` (minus the _"plan"_ route inside of it)

### Routes Using Controllers
- `admin.js`
- `student.js`
- `transcript.js`