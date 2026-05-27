import { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

/**
 * useCallSignaling
 * Handles Socket.io events for 1-on-1 voice/video call signaling.
 *
 * Events emitted:   call-invite, call-declined, call-ended
 * Events listened:  call-invite, call-declined, call-ended
 */
export default function useCallSignaling({ socket, currentUser }) {
    const [incomingCall, setIncomingCall] = useState(null);  // { from, roomUrl, callType }
    const [activeCall,   setActiveCall]   = useState(null);  // { roomUrl, callType, with }

    useEffect(() => {
        if (!socket) return;

        // Someone is calling us
        const onInvite = ({ from, roomUrl, callType }) => {
            setIncomingCall({ from, roomUrl, callType });
        };

        // The person we called declined
        const onDeclined = () => {
            setActiveCall(null);
            setIncomingCall(null);
        };

        // Either side ended the call
        const onEnded = () => {
            setActiveCall(null);
            setIncomingCall(null);
        };

        socket.on('call-invite',   onInvite);
        socket.on('call-declined', onDeclined);
        socket.on('call-ended',    onEnded);

        return () => {
            socket.off('call-invite',   onInvite);
            socket.off('call-declined', onDeclined);
            socket.off('call-ended',    onEnded);
        };
    }, [socket]);

    // Initiate a call to another user
    const startCall = useCallback(async ({ toUserId, toUserName, callType }) => {
        if (!socket) return;
        try {
            // Ask backend to create a Daily.co room
            const { data } = await api.post('/calls/create-room');
            if (!data.roomUrl) throw new Error('No room URL returned');

            // Signal the recipient
            socket.emit('call-invite', {
                toUserId,
                from: currentUser.name,
                fromId: currentUser.id,
                roomUrl: data.roomUrl,
                callType,
            });

            setActiveCall({ roomUrl: data.roomUrl, callType, with: toUserName });
        } catch (err) {
            console.error('Failed to start call:', err);
        }
    }, [socket, currentUser]);

    // Accept an incoming call
    const acceptCall = useCallback(() => {
        if (!incomingCall) return;
        setActiveCall({
            roomUrl: incomingCall.roomUrl,
            callType: incomingCall.callType,
            with: incomingCall.from,
        });
        setIncomingCall(null);
    }, [incomingCall]);

    // Decline an incoming call
    const declineCall = useCallback(() => {
        if (!incomingCall || !socket) return;
        socket.emit('call-declined', { toUserId: incomingCall.fromId });
        setIncomingCall(null);
    }, [incomingCall, socket]);

    // End an active call
    const endCall = useCallback(() => {
        if (!socket || !activeCall) return;
        socket.emit('call-ended', {});
        setActiveCall(null);
    }, [socket, activeCall]);

    return { incomingCall, activeCall, startCall, acceptCall, declineCall, endCall };
}
