import { useState, useRef } from 'react';

/**
 * VoiceNotePlayer
 * Renders a compact audio player inside a chat bubble.
 * Props:
 *   src     — public URL of the audio file
 *   isOwn   — bool, controls bubble colour
 */
export default function VoiceNotePlayer({ src, isOwn }) {
    const audioRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const toggle = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) { audio.pause(); setPlaying(false); }
        else         { audio.play();  setPlaying(true);  }
    };

    const onTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        setProgress((audio.currentTime / audio.duration) * 100);
    };

    const onLoadedMetadata = () => {
        setDuration(Math.round(audioRef.current?.duration || 0));
    };

    const onEnded = () => { setPlaying(false); setProgress(0); };

    const seek = (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct  = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    };

    const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const bg    = isOwn ? '#4B3FA0' : '#FFFFFF';
    const color = isOwn ? '#FFFFFF' : '#2E2270';
    const track = isOwn ? 'rgba(255,255,255,0.3)' : '#E4DEFF';
    const fill  = isOwn ? '#FFFFFF' : '#4B3FA0';

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: bg, borderRadius: 20, padding: '8px 14px', minWidth: 180, maxWidth: 260 }}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={onEnded}
                style={{ display: 'none' }}
            />

            {/* Play / Pause button */}
            <button onClick={toggle} style={{ width: 32, height: 32, borderRadius: '50%', background: fill, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="14" viewBox="0 0 12 14" fill={bg}>
                    {playing
                        ? <><rect x="0" y="0" width="4" height="14" /><rect x="8" y="0" width="4" height="14" /></>
                        : <path d="M0 0 L12 7 L0 14 Z" />
                    }
                </svg>
            </button>

            {/* Progress bar */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div onClick={seek} style={{ height: 4, background: track, borderRadius: 2, cursor: 'pointer', position: 'relative' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: fill, borderRadius: 2, transition: 'width 0.1s' }} />
                </div>
                <span style={{ fontSize: 10, color, opacity: 0.75 }}>{fmt(duration)}</span>
            </div>
        </div>
    );
}
