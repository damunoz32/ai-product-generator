// api/airtable-descriptions.js
import fetch from 'node-fetch';

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
  const airtableTableName = 'Generated Descriptions'; // Your main table name

  if (!airtableApiToken || !airtableBaseId) {
    console.error('Missing Airtable API Token or Base ID environment variables.');
    res.status(500).json({ error: 'Server configuration error: Missing Airtable credentials.' });
    return;
  }

  // Capture the User-Agent from the incoming request for consistent logging
  const incomingUserAgent = req.headers['user-agent'] || 'Unknown-Client-Airtable-Proxy';

  try {
    // Destructure the fields expected from the frontend
    // productNamePrimary will hold the value of req.body["Product Name"]
    const {
      "Product Name": productNamePrimary, // This is the unique ID for the record, coming from frontend
      "Key Features": keyFeatures,
      "Target Audience": targetAudience,
      "Description Length": descriptionLength,
      "Generated Text": generatedText
    } = req.body;

    // Basic validation for required fields
    // Verify all fields that Airtable requires (especially the primary field) are present
    if (!productNamePrimary || !keyFeatures || !targetAudience || !descriptionLength || !generatedText) {
      console.error('Proxy validation failed. Missing fields:', {
        productNamePrimary: !!productNamePrimary,
        keyFeatures: !!keyFeatures,
        targetAudience: !!targetAudience,
        descriptionLength: !!descriptionLength,
        generatedText: !!generatedText
      });
      res.status(400).json({ error: 'Missing required fields for Airtable record. Please ensure all fields are being sent and are not empty.' });
      return;
    }

    // Construct the Airtable API URL for creating records
    const airtableApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(airtableTableName)}`;

    // Prepare the data payload for Airtable
    const airtablePayload = {
      fields: {
        // FIX: Use productNamePrimary here, which holds the clean product name
        "Product Name": productNamePrimary, // <--- CRITICAL FIX: Use the correctly destructured variable
        "Key Features": keyFeatures,
        "Target Audience": targetAudience,
        "Description Length": descriptionLength,
        "Generated Text": generatedText,
        // If you had a "Generated At" field (Created time type), Airtable handles it automatically
      }
    };

    const airtableResponse = await fetch(airtableApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableApiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': incomingUserAgent,
      },
      body: JSON.stringify(airtablePayload),
    });

    const airtableResponseText = await airtableResponse.text();

    if (!airtableResponse.ok) {
      console.error(`Error from Airtable API: Status ${airtableResponse.status}, Body: ${airtableResponseText}`);
      res.status(airtableResponse.status).json({
        error: `Failed to create record in Airtable. Status: ${airtableResponse.status}. Details: ${airtableResponseText.substring(0, 200)}...`
      });
      return;
    }

    const data = JSON.parse(airtableResponseText);

    res.status(200).json({ message: 'Record created successfully in Airtable!', record: data });

  } catch (error) {
    console.error('Proxy caught an error:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
