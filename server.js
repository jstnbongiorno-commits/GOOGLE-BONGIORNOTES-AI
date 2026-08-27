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
            console.error("CRITICAL: GEMINI_API_KEY is missing.");
            return res.status(500).json({ error: "Server API key configuration missing." });
        }

        // Using the stable v1 endpoint with gemini-2.5-flash
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: "You are Justin AI, an artist, musician, and web developer on bongiornotes.com. Talk casually and naturally like a human creator. User says: " + userMessage }
                        ]
                    }
                ]
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Google API HTTP Error:", JSON.stringify(data, null, 2));
            return res.status(500).json({ error: data.error?.message || "Google API rejected the request." });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!replyText) {
            console.error("Empty Candidates Payload:", JSON.stringify(data, null, 2));
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
