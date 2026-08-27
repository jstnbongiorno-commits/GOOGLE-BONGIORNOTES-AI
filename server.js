const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize the official Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: "GEMINI_API_KEY is missing on server." });
        }

        // Using the official client SDK for gemini-2.0-flash
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: userMessage,
            config: {
                systemInstruction: "You are Justin AI, an artist, musician, and web developer on bongiornotes.com. Talk casually, creatively, and naturally like a human creator."
            }
        });

        const replyText = response.text();

        if (!replyText) {
            return res.status(500).json({ error: "Model returned an empty text block." });
        }

        res.json({ reply: replyText });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message || "Failed to generate content." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
