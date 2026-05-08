import pool from '../config/db.js';

try {
    // Drop the old conflicting column
    await pool.query(`ALTER TABLE reactions DROP COLUMN IF EXISTS emoji`);
    console.log('✅ Dropped old emoji column');

    // Make sure emoji_type is NOT NULL
    await pool.query(`ALTER TABLE reactions ALTER COLUMN emoji_type SET NOT NULL`);
    console.log('✅ emoji_type set NOT NULL');

    // Make sure message_id and user_id are NOT NULL
    await pool.query(`ALTER TABLE reactions ALTER COLUMN message_id SET NOT NULL`);
    await pool.query(`ALTER TABLE reactions ALTER COLUMN user_id SET NOT NULL`);
    console.log('✅ message_id and user_id set NOT NULL');

    console.log('✅ reactions table fixed — reactions will now work');
} catch (err) {
    console.error('Error:', err.message);
} finally {
    await pool.end();
}
