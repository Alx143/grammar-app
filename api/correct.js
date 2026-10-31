export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ result: 'Method Not Allowed' });
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ result: 'Error: API key is missing. Check Vercel Environment Variables and Redeploy.' });
    }

    const prompt = `You are an expert editor and diplomat. Correct the grammar and spelling of the following text, and elevate the vocabulary to sound highly sophisticated, articulate, and authoritative. Reply ONLY with the improved text. Do not add any conversational filler, explanations, or quotes. Text to correct: ${req.body.text}`;

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

        const correctedText = data.candidates[0].content.parts[0].text;
        res.status(200).json({ result: correctedText });
    } catch (error) {
        res.status(500).json({ result: `Code Error: ${error.message}` });
    }
}
