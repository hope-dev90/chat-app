import pool from '../config/db.js';

try {
    // Drop the broken unique index
    await pool.query(`DROP INDEX IF EXISTS reactions_message_id_idx`);
    // Recreate as a normal index
    await pool.query(`CREATE INDEX IF NOT EXISTS reactions_message_id_idx ON reactions (message_id)`);
    console.log('✅ reactions_message_id_idx fixed — reactions will now work correctly');
} catch (err) {
    console.error('Error:', err.message);
} finally {
    await pool.end();
}
