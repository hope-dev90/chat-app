import pool from '../config/db.js';

export const get = async () => {
    const { rows } = await pool.query(
        'SELECT * FROM opening_day_config ORDER BY id DESC LIMIT 1'
    );
    return rows[0] || null;
};

// Replace all config rows with a single new one
export const set = async ({ event_name, event_date, venue, notes }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM opening_day_config');
        const { rows } = await client.query(
            `INSERT INTO opening_day_config (event_name, event_date, venue, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [event_name || 'Patron Opening Day', event_date, venue || null, notes || null]
        );
        await client.query('COMMIT');
        return rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

export const update = async ({ event_name, event_date, venue, notes }) => {
    const { rows } = await pool.query(
        `UPDATE opening_day_config
         SET event_name = COALESCE($1, event_name),
             event_date = COALESCE($2, event_date),
             venue      = COALESCE($3, venue),
             notes      = COALESCE($4, notes),
             updated_at = NOW()
         WHERE id = (SELECT id FROM opening_day_config ORDER BY id DESC LIMIT 1)
         RETURNING *`,
        [event_name || null, event_date || null, venue || null, notes || null]
    );
    return rows[0] || null;
};
