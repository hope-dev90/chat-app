import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, '..', 'schema.sql');

try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    console.log('Database schema is ready');
} catch (error) {
    const refused = error.code === 'ECONNREFUSED' || error.errors?.some((err) => err.code === 'ECONNREFUSED');

    if (refused) {
        console.error(
            [
                'Database setup failed.',
                `No PostgreSQL server is accepting connections at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}.`,
                'Start PostgreSQL first, then run: npm run db:setup'
            ].join('\n')
        );
    } else {
        console.error('Database setup failed:', error.message);
    }

    process.exitCode = 1;
} finally {
    await pool.end();
}
