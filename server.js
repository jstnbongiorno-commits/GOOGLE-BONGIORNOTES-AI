const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Justin AI backend is running!');
});

app.get('/api/test', (req, res) => {
    res.json({ 
        ok: true,
        message: 'API is working!'
    });
});

app.post('/api/chat', async (req, res) => {
    console.log('--- CHAT REQUEST RECEIVED ---');
    console.log('Body:', req.body);

    try {
        const userMessage = req.body?.message;

        if (!userMessage || typeof userMessage !== 'string') {
            return res.status(400).json({
                error: 'Message is required'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error('GEMINI_API_KEY is missing!');
            return res.status(500).json({
                error: 'GEMINI_API_KEY is not configured on the server.'
            });
        }

        console.log('Gemini API key found.');
        console.log('Sending message to Gemini:', userMessage);

        const url =
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' +
            encodeURIComponent(apiKey);

        const apiResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text:
                                    'You are Justin AI, an artist, musician, and web developer on bongiornotes.com representing Justin Bongiorno. Talk naturally, casually, enthusiastically, and conversationally. User message: ' +
                                    userMessage
                            }
                        ]
                    }
                ]
            })
        });

        console.log('Gemini HTTP status:', apiResponse.status);

        const rawResponse = await apiResponse.text();

        console.log('Gemini raw response:', rawResponse);

        let data;

        try {
            data = JSON.parse(rawResponse);
        } catch (parseError) {
            console.error('Could not parse Gemini response as JSON.');
            return res.status(500).json({
                error: 'Gemini returned an invalid response.',
                raw: rawResponse
            });
        }

        if (!apiResponse.ok) {
            console.error('Gemini API ERROR:', data);

            return res.status(500).json({
                error: data?.error?.message || 'Gemini API request failed.',
                details: data
            });
        }

        const replyText =
            data?.candidates?.[0]?.content?.parts
                ?.map(part => part.text || '')
                .join('')
                .trim();

        if (!replyText) {
            console.error('NO REPLY TEXT FOUND');
            console.error(JSON.stringify(data, null, 2));

            return res.status(500).json({
                error: 'Gemini returned no text response.',
                details: data
            });
        }

        console.log('Justin AI reply:', replyText);

        return res.json({
            reply: replyText
        });

    } catch (error) {
        console.error('SERVER ERROR:', error);

        return res.status(500).json({
            error: error.message || 'Internal server error.'
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Justin AI backend running on port ${PORT}`);
    console.log(`Listening on port ${PORT}`);
});
