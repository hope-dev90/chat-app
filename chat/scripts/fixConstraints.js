import pool from '../config/db.js';

try {
    await pool.query(`ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_room_type_check`);
    await pool.query(`ALTER TABLE messages ADD CONSTRAINT messages_room_type_check CHECK (room_type IN ('general','girls','mentor','dm','circle'))`);
    console.log('✅ messages room_type constraint updated');
} catch (err) {
    console.error('Error:', err.message);
} finally {
    await pool.end();
}
