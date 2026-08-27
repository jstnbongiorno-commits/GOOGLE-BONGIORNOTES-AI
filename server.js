const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(userMessage);

        let replyText = "";
        try {
            replyText = result.response.text();
        } catch (e) {
            if (result.response && result.response.candidates && result.response.candidates[0].content.parts[0].text) {
                replyText = result.response.candidates[0].content.parts[0].text;
            }
        }

        if (!replyText || replyText.trim() === "") {
            return res.json({ reply: "Yo, I'm here! (Received an empty text block from AI)." });
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch from Gemini" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
