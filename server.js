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
            console.error("CRITICAL: GEMINI_API_KEY is missing on server.");
            return res.status(500).json({ error: "API key not configured." });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { 
                                text: "You are Justin AI, an artist, musician, and web developer on bongiornotes.com representing Justin Bongiorno. Talk naturally and conversationally like a human creator. User message: " + userMessage 
                            }
                        ]
                    }
                ]
            })
        });

        const data = await apiResponse.json();

        if (data.error) {
            console.error("Google API Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
            console.error("Empty Response Structure:", JSON.stringify(data));
            return res.json({ reply: "Yo! Loud and clear. What are we building next?" });
        }

        res.json({ reply: replyText });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
