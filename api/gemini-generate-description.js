// api/gemini-generate-description.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, User-Agent');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const geminiApiKey = process.env.GEMINI_API_KEY; // Get API key from environment variables

  if (!geminiApiKey) {
    console.error('Missing GEMINI_API_KEY environment variable.');
    res.status(500).json({ error: 'Server configuration error: Missing Gemini API key.' });
    return;
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "text/plain",
      }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers['user-agent'] || 'AI-Product-Generator-Proxy',
      },
      body: JSON.stringify(payload),
    });

    const geminiResult = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API Error:', geminiResult);
      res.status(geminiResponse.status).json({
        error: `Gemini API error: ${geminiResult.error ? geminiResult.error.message : 'Unknown error'}`,
        details: geminiResult
      });
      return;
    }

    res.status(200).json(geminiResult);

  } catch (error) {
    console.error('Proxy caught an error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
 
