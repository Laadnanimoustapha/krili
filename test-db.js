require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing database connection...');
    console.log('URL:', process.env.DATABASE_URL ? 'Found' : 'Missing');
    
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        console.log('Successfully connected to database!');
        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

testConnection();
