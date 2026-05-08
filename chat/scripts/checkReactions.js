import pool from '../config/db.js';
const r = await pool.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='reactions' ORDER BY ordinal_position`);
console.log(JSON.stringify(r.rows, null, 2));
await pool.end();
