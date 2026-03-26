// DB
const DB_USER = process.env.DB_USER || "root"
const DB_PASSWORD = process.env.DB_PASSWORD || "admin"
const DB_HOST = process.env.DB_HOST || "localhost" 
const DB_NAME = process.env.DB_NAME || "remodeling_db" 

const testing = process.env.TEST



module.exports = {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_NAME,
    testing,
}