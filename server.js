app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const replyText = response.text();
        
        res.json({ reply: replyText });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch from Gemini" });
    }
});
