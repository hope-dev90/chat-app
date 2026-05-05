import * as Config from '../models/configModel.js';

export const getConfig = async (req, res, next) => {
    try {
        const data = await Config.get();
        res.json({ success: true, data });
    } catch (err) { next(err); }
};

export const setConfig = async (req, res, next) => {
    try {
        const { event_name, event_date, venue, notes } = req.body;
        if (!event_date) return res.status(400).json({ success: false, message: 'event_date is required' });
        const data = await Config.set({ event_name, event_date, venue, notes });
        res.status(201).json({ success: true, data });
    } catch (err) { next(err); }
};

export const updateConfig = async (req, res, next) => {
    try {
        const { event_name, event_date, venue, notes } = req.body;
        const data = await Config.update({ event_name, event_date, venue, notes });
        if (!data) return res.status(404).json({ success: false, message: 'No config found to update' });
        res.json({ success: true, data });
    } catch (err) { next(err); }
};
