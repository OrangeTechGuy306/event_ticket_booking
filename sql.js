const MYSQL = require("mysql")
require("dotenv").config()

module.exports.SQL = MYSQL.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 3306,
    database: process.env.DB_NAME
})