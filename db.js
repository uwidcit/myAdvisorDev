require('dotenv').config(); // Load environment variables from .env file

const { Sequelize } = require('sequelize');

// Function to parse a generic database connection string
function parseConnectionString(connectionString) {
    // This regex is designed to parse most common connection string formats
    const regex = /^(.+?):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/;
    const match = connectionString.match(regex);
    if (!match) throw new Error('Invalid connection string format');

    return {
        dialect: match[1],
        username: match[2],
        password: match[3],
        host: match[4],
        port: match[5],
        database: match[6],
    };
}

let db;

// Check if DATABASE_URL environment variable is set
if (process.env.DATABASE_URL) {
    // Parse the connection string to extract connection details
    const { dialect, username, password, host, database } = parseConnectionString(process.env.DATABASE_URL);

    db = new Sequelize(database, username, password, {
        host: host,
        dialect: dialect, // Dynamically set the dialect based on the connection string
    });
} else {
    console.log("No database url detected");
    // Fall back to SQLite if DATABASE_URL is not set
    db = new Sequelize({
        dialect: 'sqlite',
        storage: 'database.sqlite', // Specify your SQLite database file
    });
}

// Test the connection
async function testDBConnection() {
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}


module.exports = db;

