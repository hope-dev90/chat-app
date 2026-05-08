import { useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

/**
 * VideoCall
 * Embeds a Daily.co call iframe.
 * Props:
 *   roomUrl   — Daily.co room URL
 *   audioOnly — bool, hide camera if true (voice call)
 *   onLeave   — callback when the user leaves the call
 */
export default function VideoCall({ roomUrl, audioOnly = false, onLeave }) {
    const containerRef = useRef(null);
    const callRef      = useRef(null);

    useEffect(() => {
        if (!roomUrl || !containerRef.current) return;

        // Create the Daily iframe inside our container div
        const call = DailyIframe.createFrame(containerRef.current, {
            iframeStyle: {
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '12px',
            },
            showLeaveButton: true,
            showFullscreenButton: true,
        });

        callRef.current = call;

        // Join the room; disable camera for audio-only calls
        call.join({
            url: roomUrl,
            startVideoOff: audioOnly,
            startAudioOff: false,
        });

        // When the user clicks "Leave" inside the Daily UI
        call.on('left-meeting', () => {
            call.destroy();
            if (onLeave) onLeave();
        });

        return () => {
            // Cleanup on unmount
            call.destroy();
        };
    }, [roomUrl, audioOnly, onLeave]);

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 2000,
        }}>
            <div style={{ width: '90vw', maxWidth: 900, height: audioOnly ? 200 : '80vh', borderRadius: 12, overflow: 'hidden', background: '#1a1a2e' }} ref={containerRef} />
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 10 }}>
                {audioOnly ? '🎙 Voice call in progress' : '📹 Video call in progress'} — use the controls inside to mute or leave
            </p>
        </div>
    );
}
