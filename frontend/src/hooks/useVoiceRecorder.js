import { useState, useRef, useCallback } from 'react';

/**
 * useVoiceRecorder
 * Wraps the browser MediaRecorder API.
 * Returns controls and state for hold-to-record voice notes.
 */
export default function useVoiceRecorder({ onRecorded }) {
    const [recording, setRecording] = useState(false);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef(null);
    const chunksRef        = useRef([]);
    const timerRef         = useRef(null);
    const streamRef        = useRef(null);

    // Start recording — call on mousedown / touchstart
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                onRecorded(blob);
                // Stop all mic tracks
                stream.getTracks().forEach(t => t.stop());
            };

            recorder.start();
            setRecording(true);
            setDuration(0);

            // Tick every second
            timerRef.current = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);

        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    }, [onRecorded]);

    // Stop recording — call on mouseup / touchend
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            clearInterval(timerRef.current);
            setRecording(false);
            setDuration(0);
        }
    }, [recording]);

    // Format seconds → "0:05"
    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${String(s).padStart(2, '0')}`;
    };

    return { recording, duration, formatDuration, startRecording, stopRecording };
}
