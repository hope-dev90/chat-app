import { useState, useEffect } from 'react';
import api from '../../api/axios';

// Cache so we don't re-fetch on every message render
let emojiCache = null;

const getEmojis = async () => {
    if (emojiCache) return emojiCache;
    try {
        const res = await api.get('/emoji/all');
        emojiCache = res.data.emojis; // [{ id, name, image_url }]
        return emojiCache;
    } catch {
        return [];
    }
};

// Invalidate cache when a new emoji is created
export const invalidateEmojiCache = () => {
    emojiCache = null;
};

/**
 * Renders a message string, replacing :emoji_name: tokens with <img> tags.
 */
export default function EmojiText({ text, className = '' }) {
    const [parts, setParts] = useState([{ type: 'text', value: text }]);

    useEffect(() => {
        if (!text || !text.includes(':')) {
            setParts([{ type: 'text', value: text }]);
            return;
        }

        let cancelled = false;

        getEmojis().then((emojis) => {
            if (cancelled) return;
            if (!emojis.length) {
                setParts([{ type: 'text', value: text }]);
                return;
            }

            // Build a map of name -> image_url
            const emojiMap = {};
            emojis.forEach(e => { emojiMap[e.name] = e.image_url; });

            // Split on :name: tokens
            const regex = /:([a-z0-9_]+):/g;
            const result = [];
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(text)) !== null) {
                const [full, name] = match;
                if (emojiMap[name]) {
                    // Text before this token
                    if (match.index > lastIndex) {
                        result.push({ type: 'text', value: text.slice(lastIndex, match.index) });
                    }
                    result.push({ type: 'emoji', name, url: emojiMap[name] });
                    lastIndex = match.index + full.length;
                }
            }

            // Remaining text
            if (lastIndex < text.length) {
                result.push({ type: 'text', value: text.slice(lastIndex) });
            }

            setParts(result.length ? result : [{ type: 'text', value: text }]);
        });

        return () => { cancelled = true; };
    }, [text]);

    return (
        <span className={className}>
            {parts.map((part, i) =>
                part.type === 'emoji' ? (
                    <img
                        key={i}
                        src={part.url}
                        alt={`:${part.name}:`}
                        title={`:${part.name}:`}
                        style={{
                            display: 'inline-block',
                            width: 22,
                            height: 22,
                            verticalAlign: 'middle',
                            objectFit: 'cover',
                            borderRadius: 4,
                            margin: '0 1px',
                        }}
                    />
                ) : (
                    <span key={i}>{part.value}</span>
                )
            )}
        </span>
    );
}
