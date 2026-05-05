import pool from '../config/db.js';

export const findAll = async () => {
    const { rows } = await pool.query(
        `SELECT r.*,
                COALESCE(SUM(a.amount_paid), 0) AS total_collected
         FROM money_recipients r
         LEFT JOIN attendance a ON a.received_by = r.id
         GROUP BY r.id
         ORDER BY r.name ASC`
    );
    return rows;
};

export const create = async ({ name, role, is_active }) => {
    const { rows } = await pool.query(
        `INSERT INTO money_recipients (name, role, is_active)
         VALUES ($1, $2, $3) RETURNING *`,
        [name, role || null, is_active ?? true]
    );
    return rows[0];
};

export const update = async (id, { name, role, is_active }) => {
    const { rows } = await pool.query(
        `UPDATE money_recipients SET name = $1, role = $2, is_active = $3
         WHERE id = $4 RETURNING *`,
        [name, role || null, is_active, id]
    );
    return rows[0] || null;
};

export const remove = async (id) => {
    const { rowCount } = await pool.query(
        'DELETE FROM money_recipients WHERE id = $1',
        [id]
    );
    return rowCount > 0;
};
