import express from 'express';
import cors from 'cors';

import studentRoutes    from './routes/students.js';
import attendanceRoutes from './routes/attendance.js';
import recipientRoutes  from './routes/recipients.js';
import configRoutes     from './routes/config.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Routes
app.use('/api/students',    studentRoutes);
app.use('/api/attendance',  attendanceRoutes);
app.use('/api/recipients',  recipientRoutes);
app.use('/api/config',      configRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

export default app;
