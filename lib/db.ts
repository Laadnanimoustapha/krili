import mysql from 'mysql2/promise';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not defined');
}

export const db = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
