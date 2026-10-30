export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
    
    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = `You are a grammar and spelling corrector. Reply ONLY with the corrected, natural-sounding text. Do not add any conversational filler, explanations, or quotes. Text to correct: ${req.body.text}`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });
        
        const data = await response.json();
        const correctedText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: correctedText });
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect to Gemini API' });
    }
}