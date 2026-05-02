import dotenv from 'dotenv';
dotenv.config({ override: true });

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

import { connectDB } from './config/db.js';
import { socketAuth } from './middleware/socketAuth.js';
import chatSocket from './socket/chat.js';

import authRoutes from './routes/authRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import emojiRoutes from './routes/emojiRoute.js';
import uploadRoutes from './routes/uploadRoute.js';
// ─── App setup ─────────────────────────────────────────────────
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// ─── Middlewares ───────────────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/mentor', mentorRoutes);
app.use('/emoji', emojiRoutes);
app.use('/upload', uploadRoutes);

// ─── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running ✅'
    });
});

// ─── 404 handler ──────────────────────────────────────────────
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// ─── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'MulterError' || err.message?.startsWith('Only ')) {
        return res.status(400).json({
            success: false,
            message: err.code === 'LIMIT_FILE_SIZE'
                ? 'The selected file is too large'
                : err.message
        });
    }

    if (req.originalUrl?.startsWith('/upload') || req.originalUrl?.startsWith('/emoji')) {
        return res.status(500).json({
            success: false,
            message: err.message || 'Upload failed'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Something went wrong'
    });
});

io.use(socketAuth);
chatSocket(io);

httpServer.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the existing server or change PORT in .env.`);
        process.exit(1);
    }

    console.error('HTTP server error:', error);
    process.exit(1);
});

const start = async () => {
    try {
        await connectDB();
        httpServer.listen(port, host, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

start();

export { io };
