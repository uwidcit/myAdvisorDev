require('dotenv').config()
const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
]

module.exports = allowedOrigins;