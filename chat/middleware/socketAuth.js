import jwt from 'jsonwebtoken';
import { findUserById } from '../models/userModel.js';

export const socketAuth = async (socket, next) => {
    let token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Not authorized'));
    }

    // Remove Bearer prefix if sent
    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await findUserById(decoded.id);

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.user = user;
        next();

    } catch (err) {
        return next(new Error('Token invalid'));
    }
};