import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './authContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    useEffect(() => {
        if (!token) return;

        // Connect to socket with JWT
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
            auth: { token }
        });

        newSocket.on('connect', () => {
            console.log('Socket connected ✅');
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket error:', err.message);
        });

        // Track online users
        newSocket.on('userOnline', ({ userId }) => {
            setOnlineUsers(prev => [...new Set([...prev, userId])]);
        });

        newSocket.on('userOffline', ({ userId }) => {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
