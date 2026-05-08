/**
 * callController.js
 * Creates a Daily.co room for 1-on-1 voice/video calls.
 *
 * Requires in .env:
 *   DAILY_API_KEY=your_daily_api_key
 *
 * Get a free API key at https://www.daily.co
 */

export const createRoom = async (req, res) => {
    const apiKey = process.env.DAILY_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            success: false,
            message: 'DAILY_API_KEY is not set. Add it to chat/.env to enable calls.',
        });
    }

    try {
        // Create a short-lived room (expires in 1 hour)
        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                properties: {
                    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
                    enable_chat: false,
                    enable_knocking: false,
                    max_participants: 2,
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Daily.co error:', data);
            return res.status(500).json({ success: false, message: 'Failed to create call room' });
        }

        return res.json({ success: true, roomUrl: data.url });

    } catch (err) {
        console.error('createRoom error:', err);
        return res.status(500).json({ success: false, message: 'Failed to create call room' });
    }
};
