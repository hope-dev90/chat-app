import * as Attendance from '../models/attendanceModel.js';

export const getAll = async (req, res, next) => {
    try {
        const { status, section } = req.query;
        const data = await Attendance.findAll({ status, section });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const getSummary = async (req, res, next) => {
    try {
        const data = await Attendance.summary();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const getByTime = async (req, res, next) => {
    try {
        const data = await Attendance.arrivalsByHour();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const markAttendance = async (req, res, next) => {
    try {
        const { student_id, status, time_of_arrival, patron_fee_paid, amount_paid, received_by, remarks } = req.body;
        if (!student_id || !status)
            return res.status(400).json({ success: false, message: 'student_id and status are required' });
        const validStatuses = ['present', 'absent', 'late'];
        if (!validStatuses.includes(status))
            return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });
        const data = await Attendance.upsert({ student_id, status, time_of_arrival, patron_fee_paid, amount_paid, received_by, remarks });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};
