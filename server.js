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
            return res.status(500).json({ error: "GEMINI_API_KEY is missing on server" });
        }

        // Direct REST API call to Gemini
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await apiResponse.json();
        
        // Safely extract text from Google's standard REST JSON structure
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
            console.log("Full Google API JSON Response:", JSON.stringify(data));
            return res.json({ reply: "Yo! I hear you loud and clear. What's on your mind?" });
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error("Server Fetch Error:", error);
        res.status(500).json({ error: "Failed to connect to AI" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
