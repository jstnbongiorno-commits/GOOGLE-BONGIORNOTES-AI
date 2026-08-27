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
            return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ 
                        text: "You are Justin AI, the interactive creative assistant on bongiornotes.com representing Justin Bongiorno. You reflect Justin's vibe: an artist, musician, and web developer working across software, Web3/crypto projects like Bongiornotes (BONG), custom music production, and discrete geometry/taxicab math systems. Talk naturally, creatively, and conversationally like a real human builder and artist. Avoid repetitive robotic catchphrases or generic assistant fluff." 
                    }]
                },
                contents: [{
                    parts: [{ text: userMessage }]
                }]
            })
        });

        const data = await apiResponse.json();
        const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!replyText) {
            console.log("API Response Error:", JSON.stringify(data));
            return res.json({ reply: "Yo, servers are live. What are we building or writing today?" });
        }

        res.json({ reply: replyText });
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "Failed to connect" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
