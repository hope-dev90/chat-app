/**
 * IncomingCallModal
 * Shows when someone calls you via Socket.io call-invite.
 * Props:
 *   call      — { from, callType } from useCallSignaling
 *   onAccept  — callback
 *   onDecline — callback
 */
export default function IncomingCallModal({ call, onAccept, onDecline }) {
    if (!call) return null;

    const isVideo = call.callType === 'video';

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000,
        }}>
            <div style={{
                background: '#FFFFFF',
                borderRadius: 20,
                padding: '32px 40px',
                textAlign: 'center',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                minWidth: 280,
            }}>
                {/* Animated ring icon */}
                <div style={{ fontSize: 52, marginBottom: 12, animation: 'pulse 1s infinite' }}>
                    {isVideo ? '📹' : '📞'}
                </div>

                <p style={{ margin: '0 0 4px', fontSize: 13, color: '#8B80C8', fontWeight: 500 }}>
                    Incoming {isVideo ? 'video' : 'voice'} call
                </p>
                <p style={{ margin: '0 0 28px', fontSize: 18, fontWeight: 700, color: '#2E2270' }}>
                    {call.from}
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    {/* Decline */}
                    <button onClick={onDecline} style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#EF4444', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                    }}>
                        📵
                    </button>

                    {/* Accept */}
                    <button onClick={onAccept} style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#22C55E', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22,
                    }}>
                        {isVideo ? '📹' : '📞'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50%       { transform: scale(1.15); }
                }
            `}</style>
        </div>
    );
}
