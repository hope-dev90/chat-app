import pool from '../config/db.js';

export const findAll = async ({ status, section } = {}) => {
    const conditions = [];
    const params = [];

    if (status) {
        params.push(status);
        conditions.push(`a.status = $${params.length}`);
    }
    if (section) {
        params.push(section);
        conditions.push(`s.section = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
        `SELECT a.*, s.full_name, s.student_number, s.section,
                r.name AS recipient_name
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         LEFT JOIN money_recipients r ON r.id = a.received_by
         ${where}
         ORDER BY a.marked_at DESC`,
        params
    );
    return rows;
};

export const findByStudentId = async (student_id) => {
    const { rows } = await pool.query(
        `SELECT a.*, s.full_name, s.student_number, s.section,
                r.name AS recipient_name
         FROM attendance a
         JOIN students s ON s.id = a.student_id
         LEFT JOIN money_recipients r ON r.id = a.received_by
         WHERE a.student_id = $1`,
        [student_id]
    );
    return rows[0] || null;
};

export const upsert = async ({
    student_id,
    status,
    time_of_arrival,
    patron_fee_paid,
    amount_paid,
    received_by,
    remarks,
}) => {
    // Default time_of_arrival to NOW() when present or late and not provided
    const arrival =
        time_of_arrival ||
        (status === 'present' || status === 'late' ? new Date() : null);

    const { rows } = await pool.query(
        `INSERT INTO attendance
            (student_id, status, time_of_arrival, patron_fee_paid, amount_paid, received_by, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (student_id) DO UPDATE SET
            status           = EXCLUDED.status,
            time_of_arrival  = EXCLUDED.time_of_arrival,
            patron_fee_paid  = EXCLUDED.patron_fee_paid,
            amount_paid      = EXCLUDED.amount_paid,
            received_by      = EXCLUDED.received_by,
            remarks          = EXCLUDED.remarks,
            updated_at       = NOW()
         RETURNING *`,
        [student_id, status, arrival, patron_fee_paid ?? false, amount_paid ?? 0, received_by || null, remarks || null]
    );
    return rows[0];
};

export const summary = async () => {
    const { rows } = await pool.query(
        `SELECT
            COUNT(*)                                          AS total_students,
            COUNT(a.id)                                       AS marked,
            COUNT(*) - COUNT(a.id)                           AS not_yet_marked,
            SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present,
            SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absent,
            SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) AS late,
            COALESCE(SUM(a.amount_paid), 0)                  AS total_fees_collected,
            COUNT(CASE WHEN a.patron_fee_paid THEN 1 END)    AS students_paid
         FROM students s
         LEFT JOIN attendance a ON a.student_id = s.id`
    );
    return rows[0];
};

export const arrivalsByHour = async () => {
    const { rows } = await pool.query(
        `SELECT
            DATE_TRUNC('hour', time_of_arrival) AS hour,
            COUNT(*) AS count
         FROM attendance
         WHERE time_of_arrival IS NOT NULL
         GROUP BY hour
         ORDER BY hour ASC`
    );
    return rows;
};
