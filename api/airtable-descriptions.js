// api/airtable-descriptions.js
import fetch from 'node-fetch'; // Ensure node-fetch is installed in your Vercel project if not already

export default async function handler(req, res) {
  // Set CORS headers for all responses.
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allows requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Allow POST for creating records, OPTIONS for preflight
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent'); // Allow necessary headers

  // Handle preflight OPTIONS request for CORS.
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure it's a POST request for creating data
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. This endpoint only accepts POST requests.' });
    return;
  }

  // Retrieve Airtable API Token and Base ID from environment variables
  const airtableApiToken = process.env.AIRTABLE_API_TOKEN;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const airtableTableName = 'Generated Descriptions'; // Hardcode your table name

  if (!airtableApiToken || !airtableBaseId) {
    console.error('Missing Airtable API Token or Base ID environment variables.');
    res.status(500).json({ error: 'Server configuration error: Missing Airtable credentials.' });
    return;
  }

  // Capture the User-Agent from the incoming request for consistent logging
  const incomingUserAgent = req.headers['user-agent'] || 'Unknown-Client-Airtable-Proxy';

  try {
    // Parse the request body from your React app
    const { productName, keyFeatures, targetAudience, descriptionLength, generatedText } = req.body;

    // Basic validation for required fields
    if (!productName || !keyFeatures || !targetAudience || !descriptionLength || !generatedText) {
      res.status(400).json({ error: 'Missing required fields for Airtable record.' });
      return;
    }

    // Construct the Airtable API URL for creating records
    const airtableApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

    // Prepare the data payload for Airtable
    const airtablePayload = {
      fields: {
        "Product Name": productName,
        "Key Features": keyFeatures,
        "Target Audience": targetAudience,
        "Description Length": descriptionLength,
        "Generated Text": generatedText,
        // "Generated At" field is set automatically by Airtable's 'Created time' type
      }
    };

    // Make the request to Airtable
    const airtableResponse = await fetch(airtableApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': incomingUserAgent, // Forward the client's User-Agent
      },
      body: JSON.stringify(airtablePayload),
    });

    // Read the response from Airtable as text first for better error logging
    const airtableResponseText = await airtableResponse.text();

    if (!airtableResponse.ok) {
      console.error(`Error from Airtable API: Status ${airtableResponse.status}, Body: ${airtableResponseText}`);
      res.status(airtableResponse.status).json({
        error: `Failed to create record in Airtable. Status: ${airtableResponse.status}. Details: ${airtableResponseText.substring(0, 200)}...`,
        airtableStatus: airtableResponse.status
      });
      return;
    }

    // Parse the Airtable response as JSON
    const data = JSON.parse(airtableResponseText);

    res.status(200).json({ message: 'Record created successfully in Airtable!', record: data });

  } catch (error) {
    console.error('Proxy caught an error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
 
