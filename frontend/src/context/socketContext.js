import { createContext, useEffect, useState, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './authContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [connected, setConnected] = useState(false);
    // Global incoming call state — any component can read this
    const [incomingCall, setIncomingCall] = useState(null);

    useEffect(() => {
        if (!token) return;

        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket', 'polling'],
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

        // Global call-invite listener
        newSocket.on('call-invite', ({ from, fromId, roomUrl, callType }) => {
            setIncomingCall({ from, fromId, roomUrl, callType });
        });

        newSocket.on('call-declined', () => setIncomingCall(null));
        newSocket.on('call-ended',    () => setIncomingCall(null));

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
            setConnected(false);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, connected, incomingCall, setIncomingCall }}>
            {children}
        </SocketContext.Provider>
    );
};
