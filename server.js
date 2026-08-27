const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY is missing from environment variables.");
            return res.status(500).json({ error: "Server API key configuration missing." });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: "You are Justin AI, an artist, musician, and web developer on bongiornotes.com. Talk casually and naturally like a human creator. User says: " + userMessage }
                        ]
                    }
                ]
            })
        });

        const data = await apiResponse.json();

        // Log everything if Google returns an error object or empty candidates
        if (!data.candidates || data.candidates.length === 0) {
            console.error("Google API Error Payload:", JSON.stringify(data, null, 2));
            return res.status(500).json({ error: data.error?.message || "Received empty block from Google API." });
        }

        const replyText = data.candidates[0]?.content?.parts?.[0]?.text;
        
        if (!replyText) {
            return res.status(500).json({ error: "Model generated a blank response." });
        }

        res.json({ reply: replyText });

    } catch (error) {
        console.error("Fatal Server Crash:", error);
        res.status(500).json({ error: "Internal server error connecting to AI." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
