export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ result: 'Method Not Allowed' });
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ result: 'Error: API key is missing. Check Vercel Environment Variables.' });
    }

    const text = req.body.text;
    const action = req.body.action || 'correct';
    
    let prompt = "";
    if (action === 'reply') {
        prompt = `The user received the following message. Generate a clear, natural, and friendly response in everyday English. It should sound like a normal person having a regular conversation. Do not sound formal, diplomatic, or use gamer slang. Keep it straightforward and polite. Reply ONLY with the drafted response. Do not add conversational filler or quotes. Message received: ${text}`;
    } else {
        prompt = `Correct the grammar and spelling of the following text. Make it sound natural, clear, and conversational in everyday English, like a normal person speaking. Do NOT use overly formal vocabulary, diplomatic phrasing, or gamer slang. Reply ONLY with the improved text. Do not add conversational filler, explanations, or quotes. Text to correct: ${text}`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(500).json({ result: `Gemini API Error: ${data.error?.message}` });
        }

        const outputText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: outputText });
    } catch (error) {
        res.status(500).json({ result: `Code Error: ${error.message}` });
    }
}
