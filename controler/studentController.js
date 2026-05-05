import * as Student from '../models/studentModel.js';

export const getAll = async (req, res, next) => {
    try {
        const data = await Student.findAll();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const data = await Student.findById(req.params.id);
        if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const createStudent = async (req, res, next) => {
    try {
        const { full_name, student_number, section } = req.body;
        if (!full_name || !student_number)
            return res.status(400).json({ success: false, message: 'full_name and student_number are required' });
        const data = await Student.create({ full_name, student_number, section });
        res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateStudent = async (req, res, next) => {
    try {
        const { full_name, student_number, section } = req.body;
        const data = await Student.update(req.params.id, { full_name, student_number, section });
        if (!data) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const deleteStudent = async (req, res, next) => {
    try {
        const deleted = await Student.remove(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Student not found' });
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) { next(err); }
};
