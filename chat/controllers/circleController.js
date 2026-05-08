import { createCircle, getAllCircles, getCircleById, joinCircle, leaveCircle, getMentorCircles } from '../models/circleModel.js';

export const create = async (req, res) => {
    const { name, description, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, message: 'Circle name is required' });
    try {
        const circle = await createCircle({ name: name.trim(), description, color, createdBy: req.user.id });
        res.status(201).json({ success: true, circle });
    } catch (err) {
        console.error('create circle error:', err);
        res.status(500).json({ success: false, message: 'Failed to create circle' });
    }
};

export const list = async (req, res) => {
    try {
        const circles = await getAllCircles(req.user.id);
        res.json({ success: true, circles });
    } catch (err) {
        console.error('list circles error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch circles' });
    }
};

export const myCircles = async (req, res) => {
    try {
        const circles = await getMentorCircles(req.user.id);
        res.json({ success: true, circles });
    } catch (err) {
        console.error('myCircles error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch circles' });
    }
};

export const join = async (req, res) => {
    try {
        await joinCircle(req.params.id, req.user.id);
        res.json({ success: true, message: 'Joined circle' });
    } catch (err) {
        console.error('join circle error:', err);
        res.status(500).json({ success: false, message: 'Failed to join circle' });
    }
};

export const leave = async (req, res) => {
    try {
        await leaveCircle(req.params.id, req.user.id);
        res.json({ success: true, message: 'Left circle' });
    } catch (err) {
        console.error('leave circle error:', err);
        res.status(500).json({ success: false, message: 'Failed to leave circle' });
    }
};
