// constants for express routes, paths and db connection
const dotenv = require('dotenv').config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3003;
const newinitializeDatabase = require('./init');


// app connection and resources
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');


// routes
app.get("/", require("./routes/index"));

app.use("/admin", require("./routes/admin"));

app.use("/student", require("./routes/student"));

app.use("/courses", require("./routes/courses"));

app.use("/careers", require("./routes/careers"));

app.use("/programmes", require("./routes/programmes"));

app.use("/transcript", require("./routes/transcript"));

app.use("/accounts", require("./routes/authorization"));

app.use("/semester", require("./routes/semester"));

app.listen(port, () => {
  console.log(`Server is starting on port ${port}`);
});
