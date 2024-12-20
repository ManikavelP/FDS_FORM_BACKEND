const mysql = require('mysql2/promise');

const connection = async()=>{
    try{
        const connect = await mysql.createConnection({
            host: process.env.DB_HOST,       
            user: process.env.DB_USER,          
            password: process.env.DB_PASS,      
            database: process.env.DB_NAME 
        });
        console.log("Databse Connected Successfully!");
        return connect;
    }catch(err){
        console.log(err);
    }
}
module.exports = connection;
