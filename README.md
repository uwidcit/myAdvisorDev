[![Open in SundaeBytes](https://www.kwasi.dev/web/image/1049-9d47fb8a/button.png)](https://devops.sundaebytestt.com/templates/github-devenv/workspace?param.Base+Image=sundaebytes%2Fubuntu-base-nodesktop-devenv-web-multieditor%3Alatest&param.CPU+Allocation=4096&param.RAM+Allocation=4096&param.git_repo=git@github.com:uwidcit/myAdvisorDev.git)

# myAdvisor 2024
myAdvisor is an automated self-advising and GPA management system created for the use of the University of the West Indies students.
It aims to replace the current system of advising to an automated and faster system for greater convenience and efficiency.

This project is part of the Computer Science Programme at the University of the West Indies.
The project was originally worked on by:
- Seth Timothy
- Matthew Christian
- Nevash Gobin
- Akeel Henry

The following members worked on the previous version project:
- Alexis Pitypaul
- Shalana Seuraj

The following members are part of the 2024 Project Course development team:
- Quinn Mohammed
- Faith Shim
- Jarrod Moore

The following members are part of the DCIT CCU Program
- Joshua Noel
- Katoya Ottley
- Paul Taylor

The following member updated the backend - May - June, 2024
- @firepenguindisopanda

The system would be designed using a PERN Stack architecture
PostgreSQL
Express
React
NodeJS

# Pre-requisites
### NodeJS Version
While many versions can support this repository, the convention is to use version `20.10.0`.
<br>You can find out how to install nodejs. Some helpful resources are:
- [installing nvm](https://github.com/nvm-sh/nvm) to use the nvm [CLI](https://www.w3schools.com/whatis/whatis_cli.asp) to install the specific versoin of nodejs
- [installing nodejs from a package manager](https://nodejs.org/en/download/package-manager/all) which includes nvm but many, **many** other [CLI](https://www.w3schools.com/whatis/whatis_cli.asp)s
- [download nodejs v20.10.0 for windows directly](https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi)
- [downlaod nodejs v20.10.0 for macOS directly](https://nodejs.org/dist/v20.10.0/node-v20.10.0.pkg)
- [the entire nodejs v20.10.0 distribution list](https://nodejs.org/dist/v20.10.0/) to see which binary suits your operating system and processor architecture

### Node Package Manager (npm) Dependencies
1. bcrypt
2. cors
3. dotenv
4. express
5. jsonwebtoken
6. multer
7. pdf2json
8. pg
9. sequelize
10. sqlite3
11. xlsx

# Getting Started
### Preamble
There are `README.md` files in each folder, so besides the information in here, feel free to look at the other folders' documentation, especially for [models](/models/README.md) and [routes](/routes/README.md).

### Controllers
The _controllers_ folder contains helper files with a more specific convention than the relatively "miscellaneous" utilities folder.

### Database
For the _db_ folder, there are database scripts such as [db.js](/db/db.js) and [initialize.js](/db/initialize.js) are in there along with a bevy of data files (lots of json and xlsx files). You would see the [db.js](/db/db.js) being imported by lots of JavaScript files, especially in the [**models**](#models) folder.

### Middleware
A strange word, "what is it" might be the first question brought to mind, however [middlware](https://expressjs.com/en/guide/using-middleware.html) is an express originated concept where some utility functions such as authorisation checks are placed **before** the function that defines the "normal" execution of data on that route.

### Models
For the _models_ folder, you can look at the models which are defined as [sequelize model instances](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/).<br>
Sequelize is the [ORM](https://www.freecodecamp.org/news/what-is-an-orm-the-meaning-of-object-relational-mapping-database-tools/) that is used for this repository. On that note you can get familiar with [sequelize model querying](https://sequelize.org/docs/v6/core-concepts/model-querying-basics/) if you aren't familiar already.

### Routes
The _routes_ folder contains the heart of the [API](https://www.ibm.com/topics/api) that is this backend repository (well how anything interacts with it regardless). The flow of an entity interacting with this as an application starts with [index.js](index.js) which hosts the express server and imports the route folder scripts to populate the server with the whole host of end to end routes that exist.

### Utilities
The _utilities_ folder contains "helper" files, similar to the [**controllers**](#controllers) folder, however for more arbitrary directives such as having a transcript parser and test script and routeUtils.

### .env
Environment Secrets in this repository is managed via a `.env` file that is created and given values to the keys listed below (so what is shown below is somewhat the template for your `.env` file)
```
PORT=
SYNCED=
NODE_ENV=
staffSecret=
studentSecret=
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```
