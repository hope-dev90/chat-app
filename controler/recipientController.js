import * as Recipient from '../models/recipientModel.js';

export const getAll = async (req, res, next) => {
    try {
        const data = await Recipient.findAll();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const createRecipient = async (req, res, next) => {
    try {
        const { name, role, is_active } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'name is required' });
        const data = await Recipient.create({ name, role, is_active });
        res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateRecipient = async (req, res, next) => {
    try {
        const { name, role, is_active } = req.body;
        const data = await Recipient.update(req.params.id, { name, role, is_active });
        if (!data) return res.status(404).json({ success: false, message: 'Recipient not found' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const deleteRecipient = async (req, res, next) => {
    try {
        const deleted = await Recipient.remove(req.params.id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Recipient not found' });
        res.json({ success: true, message: 'Recipient deleted' });
    } catch (err) { next(err); }
};
