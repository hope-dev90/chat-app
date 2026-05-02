import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './authContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.warn('⚠️ Socket disconnected:', reason);
            setConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('❌ Socket connect_error:', err.message);
            setConnected(false);
        });

        newSocket.on('userOnline', ({ userId }) => {
            setOnlineUsers(prev => [...new Set([...prev, userId])]);
        });

        newSocket.on('userOffline', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setConnected(false);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, connected }}>
            {children}
        </SocketContext.Provider>
    );
};
