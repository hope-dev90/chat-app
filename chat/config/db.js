import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL connected');
        client.release();
    } catch (error) {
        const refused = error.code === 'ECONNREFUSED' || error.errors?.some((err) => err.code === 'ECONNREFUSED');

        if (refused) {
            console.error(
                [
                    'PostgreSQL connection failed.',
                    `No database is accepting connections at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}.`,
                    'Start PostgreSQL, then run: npm run db:setup',
                    'After that, start the server again with: node server.js'
                ].join('\n')
            );
        } else {
            console.error('PostgreSQL connection error:', error.message);
        }

        process.exit(1);
    }
};

export default pool;
