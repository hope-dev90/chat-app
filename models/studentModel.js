import pool from '../config/db.js';

export const findAll = async () => {
    const { rows } = await pool.query(
        'SELECT * FROM students ORDER BY full_name ASC'
    );
    return rows;
};

export const findById = async (id) => {
    const { rows } = await pool.query(
        'SELECT * FROM students WHERE id = $1',
        [id]
    );
    return rows[0] || null;
};

export const create = async ({ full_name, student_number, section }) => {
    const { rows } = await pool.query(
        `INSERT INTO students (full_name, student_number, section)
         VALUES ($1, $2, $3) RETURNING *`,
        [full_name, student_number, section]
    );
    return rows[0];
};

export const update = async (id, { full_name, student_number, section }) => {
    const { rows } = await pool.query(
        `UPDATE students SET full_name = $1, student_number = $2, section = $3
         WHERE id = $4 RETURNING *`,
        [full_name, student_number, section, id]
    );
    return rows[0] || null;
};

export const remove = async (id) => {
    const { rowCount } = await pool.query(
        'DELETE FROM students WHERE id = $1',
        [id]
    );
    return rowCount > 0;
};
