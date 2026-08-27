const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());
app.use(cors());

// Initialize Gemini using your Render environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            return res.status(400).json({ error: "Message is required" });
        }

        // Use the stable and fast flash model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const replyText = response.text();
        
        res.json({ reply: replyText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch from Gemini" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
