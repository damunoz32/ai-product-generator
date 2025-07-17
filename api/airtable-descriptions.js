// api/airtable-descriptions.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed. This endpoint only accepts POST requests.' });
    return;
  }

  const airtableApiToken = process.env.AIRTABLE_API_TOKEN;
  const airtableBaseId = process.env.AIRTABLE_BASE_ID;
  const generatedDescriptionsTableName = 'Generated Descriptions'; // Your main table
  const productsTableName = 'Products'; // Your products table

  if (!airtableApiToken || !airtableBaseId) {
    console.error('Missing Airtable API Token or Base ID environment variables.');
    res.status(500).json({ error: 'Server configuration error: Missing Airtable credentials.' });
    return;
  }

  const incomingUserAgent = req.headers['user-agent'] || 'Unknown-Client-Airtable-Proxy';

  try {
    let requestBody;
    if (typeof req.body === 'string') {
      requestBody = JSON.parse(req.body);
    } else if (typeof req.body === 'object' && req.body !== null) {
      requestBody = req.body;
    } else {
      console.error('Invalid req.body format:', req.body);
      res.status(400).json({ error: 'Invalid request body format.' });
      return;
    }

    const {
      "Record ID": recordId, // Primary field for Generated Descriptions
      "Linked Product": linkedProductArray, // This is the array [{ name: "Product Name" }] from frontend
      "Key Features": keyFeatures,
      "Target Audience": targetAudience,
      "Description Length": descriptionLength,
      "Generated Text": generatedText
    } = requestBody;

    // Extract the product name from the linkedProductArray
    const productNameFromFrontend = linkedProductArray && linkedProductArray.length > 0
                                    ? linkedProductArray[0].name
                                    : null;

    // --- Start: Lookup Product ID from Products table ---
    let productRecordId = null;

    if (productNameFromFrontend) {
      const productsApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(productsTableName)}?filterByFormula=({Product Name}='${encodeURIComponent(productNameFromFrontend)}')`;

      const productsResponse = await fetch(productsApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${airtableApiToken}`,
          'Content-Type': 'application/json',
          'User-Agent': incomingUserAgent,
        },
      });

      const productsData = await productsResponse.json();

      if (productsResponse.ok && productsData.records && productsData.records.length > 0) {
        productRecordId = productsData.records[0].id;
        console.log(`Found Product ID for "${productNameFromFrontend}": ${productRecordId}`);
      } else {
        // If product not found, Airtable API might automatically create it when linking by name.
        // However, the error "Value [object Object] is not a valid record ID" suggests it expects an ID.
        // For now, we'll proceed assuming it needs an ID. If not found, it will be null.
        console.warn(`Product "${productNameFromFrontend}" not found in Products table. Attempting to link with name, or will fail if ID is strictly required.`);
        // Fallback to the original linkedProductArray if ID lookup fails, but expect potential error
        // If Airtable's API truly requires an ID here, we'd need to create the product first.
        // For now, let's keep it simple and rely on the ID if found.
      }
    }
    // --- End: Lookup Product ID from Products table ---

    // Basic validation for required fields (including the primary field)
    if (!recordId || !keyFeatures || !targetAudience || !descriptionLength || !generatedText) {
      console.error('Proxy validation failed. Missing fields:', {
        recordId: !!recordId,
        keyFeatures: !!keyFeatures,
        targetAudience: !!targetAudience,
        descriptionLength: !!descriptionLength,
        generatedText: !!generatedText,
        // linkedProduct is now handled by productRecordId or original array
      });
      res.status(400).json({ error: 'Missing required fields for Airtable record. Please check all fields are being sent and are not empty.' });
      return;
    }

    // Prepare the data payload for Airtable
    const airtablePayload = {
      fields: {
        "Record ID": recordId,
        // FIX: Send the actual record ID for linking, if found.
        // If productRecordId is null, it means the product wasn't found in the Products table.
        // In this case, Airtable's API might still accept the [{ name: "..." }] format
        // or it might require the product to exist first.
        // We'll send the ID if we have it, otherwise, we'll send the original array.
        "Linked Product": productRecordId ? [{ id: productRecordId }] : linkedProductArray,
        "Key Features": keyFeatures,
        "Target Audience": targetAudience,
        "Description Length": descriptionLength,
        "Generated Text": generatedText,
      }
    };

    // --- DEBUGGING LOGS START ---
    console.log('--- Airtable Payload Being Sent ---');
    console.log(JSON.stringify(airtablePayload, null, 2));
    console.log('-----------------------------------');
    // --- DEBUGGING LOGS END ---

    const airtableApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(generatedDescriptionsTableName)}`;
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
