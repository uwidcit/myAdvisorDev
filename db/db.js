require('dotenv').config()
console.log("db.js files: ",process.env.SYNCED)
const Sequelize = require("sequelize");

function postgresdb(){
  return new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    pool: {
      max: 50, // Maximum number of connections in the pool
      min: 0,  // Minimum number of connections in the pool
      acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
      idle: 10000  // Maximum time, in milliseconds, that a connection can be idle before being closed
    },
  })
}

function sqlitedb(){
  return new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: 'db/database.sqlite', // Replace with the path to your SQLite database file
    pool: {
      max: 50, // Maximum number of connections in the pool
      min: 0,  // Minimum number of connections in the pool
      acquire: 30000, // Maximum time, in milliseconds, that a connection can be idle before being released
      idle: 10000  // Maximum time, in milliseconds, that a connection can be idle before being closed
    },
    dialectOptions: {
      // Enable WAL mode
      // https://sqldocs.org/sqlite/sqlite-write-ahead-logging/#when-to-use-wal-mode
      mode: Sequelize.QueryTypes.WAL
    }
  });
}

module.exports = process.env.NODE_ENV==="production"? postgresdb(): sqlitedb();

