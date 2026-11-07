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
        prompt = `You are a strategic diplomat, leader, and expert communicator. The user received the following message in a strategy game. Generate a sophisticated, articulate, and authoritative response to it. Reply ONLY with the drafted response. Do not add conversational filler or quotes. Message received: ${text}`;
    } else {
        prompt = `You are an expert editor and diplomat. Correct the grammar and spelling of the following text, and elevate the vocabulary to sound highly sophisticated, articulate, and authoritative. Reply ONLY with the improved text. Do not add any conversational filler, explanations, or quotes. Text to correct: ${text}`;
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
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
