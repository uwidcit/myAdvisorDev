require('dotenv').config()
console.log("db.js files: ", typeof process.env.SYNCED)
const Sequelize = require("sequelize");

// Function to create a Sequelize instance based on the environment
function createSequelizeInstance() {
  const env = process.env.NODE_ENV || 'development'; // Default to 'development' if NODE_ENV is not set
  // console.log saying "In db.js files, we are in {env} environment and SYNCED is {process.env.SYNCED}"
  console.log(`In db.js files, we are in ${env} environment and SYNCED is ${process.env.SYNCED}`);

  if (env === 'production') {
    // Extracting database connection information from the URL
    const regex = /^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
    const matches = RegExp(regex).exec(process.env.POSTGRES_URL);
    if (!matches) {
      throw new Error('Invalid POSTGRES_URL format');
    }
    const [_, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME] = matches;

    // PostgreSQL database configuration
    return new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
    });
  } else if( env === 'development') {
    // SQLite database configuration
    return new Sequelize({
      dialect: 'sqlite',
      storage: 'database.sqlite', // Path to your SQLite database file
      logging: false,
      pool: {
        max: 50,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        mode: Sequelize.QueryTypes.WAL
      }
    });
  }
}

// Create and export the Sequelize instance
const db = createSequelizeInstance();

module.exports = db;
