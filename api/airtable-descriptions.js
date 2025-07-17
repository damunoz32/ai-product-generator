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

  let requestBody;
  try {
    if (typeof req.body === 'string') {
      requestBody = JSON.parse(req.body);
    } else if (typeof req.body === 'object' && req.body !== null) {
      requestBody = req.body;
    } else {
      console.error('Invalid req.body format:', req.body);
      res.status(400).json({ error: 'Invalid request body format.' });
      return;
    }

    // Destructure all fields from the parsed requestBody
    const {
      "Record ID": recordId,
      "Linked Product": linkedProductArray,
      "Key Features": keyFeatures,
      "Target Audience": targetAudience,
      "Description Length": descriptionLength,
      "Generated Text": generatedText
    } = requestBody;

    const productNameFromFrontend = linkedProductArray && linkedProductArray.length > 0
                                    ? linkedProductArray[0].name
                                    : null;

    let productRecordId = null; // This will hold the ID of the product from the Products table

    // --- DEBUGGING LOGS START ---
    console.log('--- Incoming Request Body (Proxy) ---');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log(`Product Name from Frontend for Linking: "${productNameFromFrontend}"`);
    console.log('-------------------------------------');
    // --- DEBUGGING LOGS END ---

    if (productNameFromFrontend) {
      // 1. Attempt to find the product by name in the Products table
      const productsLookupApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(productsTableName)}?filterByFormula=({Product Name}='${encodeURIComponent(productNameFromFrontend)}')`;

      console.log(`Attempting to lookup product: ${productNameFromFrontend} at URL: ${productsLookupApiUrl}`);
      const productsLookupResponse = await fetch(productsLookupApiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${airtableApiToken}`,
          'Content-Type': 'application/json',
          'User-Agent': incomingUserAgent,
        },
      });

      const productsLookupData = await productsLookupResponse.json();
      console.log('--- Products Lookup Response ---');
      console.log(`Status: ${productsLookupResponse.status}`);
      console.log('Body:', JSON.stringify(productsLookupData, null, 2));
      console.log('--------------------------------');

      if (productsLookupResponse.ok && productsLookupData.records && productsLookupData.records.length > 0) {
        // Product found, get its ID
        productRecordId = productsLookupData.records[0].id;
        console.log(`Found existing Product ID for "${productNameFromFrontend}": ${productRecordId}`);
      } else {
        // Product not found, create a new one in the Products table
        console.log(`Product "${productNameFromFrontend}" not found in Products table. Attempting to create new product...`);
        const createProductApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${encodeURIComponent(productsTableName)}`;
        const createProductPayload = {
          fields: {
            "Product Name": productNameFromFrontend // Use the product name as the primary field for the Products table
          }
        };

        console.log('--- Creating New Product Payload ---');
        console.log(JSON.stringify(createProductPayload, null, 2));
        console.log('------------------------------------');

        const createProductResponse = await fetch(createProductApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableApiToken}`,
            'Content-Type': 'application/json',
            'User-Agent': incomingUserAgent,
          },
          body: JSON.stringify(createProductPayload),
        });

        const createProductData = await createProductResponse.json();
        console.log('--- Create Product Response ---');
        console.log(`Status: ${createProductResponse.status}`);
        console.log('Body:', JSON.stringify(createProductData, null, 2));
        console.log('-------------------------------');


        if (createProductResponse.ok && createProductData.id) {
          productRecordId = createProductData.id;
          console.log(`Successfully created new Product "${productNameFromFrontend}" with ID: ${productRecordId}`);
        } else {
          console.error(`Failed to create new product "${productNameFromFrontend}" in Products table. Status: ${createProductResponse.status}, Body: ${JSON.stringify(createProductData)}`);
          res.status(500).json({ error: `Failed to prepare product link: Could not find or create product "${productNameFromFrontend}".` });
          return;
        }
      }
    } else {
        console.warn('productNameFromFrontend was null or empty. Cannot link product.');
    }

    // --- DEBUGGING LOGS START ---
    console.log(`Final productRecordId before sending to Generated Descriptions: ${productRecordId}`);
    // --- DEBUGGING LOGS END ---

    // Basic validation for required fields (including the primary field)
    if (!recordId || !keyFeatures || !targetAudience || !descriptionLength || !generatedText) {
      console.error('Proxy validation failed. Missing fields:', {
        recordId: !!recordId,
        keyFeatures: !!keyFeatures,
        targetAudience: !!targetAudience,
        descriptionLength: !!descriptionLength,
        generatedText: !!generatedText,
      });
      res.status(400).json({ error: 'Missing required fields for Airtable record. Please check all fields are being sent and are not empty.' });
      return;
    }

    // Prepare the data payload for Airtable
    const airtablePayload = {
      fields: {
        "Record ID": recordId,
        // Send the actual record ID for linking.
        "Linked Product": productRecordId ? [{ id: productRecordId }] : [], // Ensure it's an empty array if for some reason productRecordId is null
        "Key Features": keyFeatures,
        "Target Audience": targetAudience,
        "Description Length": descriptionLength,
        "Generated Text": generatedText,
      }
    };

    // --- DEBUGGING LOGS START ---
    console.log('--- Airtable Payload Being Sent to Generated Descriptions ---');
    console.log(JSON.stringify(airtablePayload, null, 2));
    console.log('-----------------------------------------------------------');
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
