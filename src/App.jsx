import React, { useState, useEffect } from 'react';

// Main App component for the AI Product Description Generator
const App = () => {
    // State variables for inputs and output
    const [productName, setProductName] = React.useState('');
    const [keyFeatures, setKeyFeatures] = React.useState('');
    const [targetAudience, setTargetAudience] = React.useState('');
    const [descriptionLength, setDescriptionLength] = React.useState('medium'); // Default to medium
    const [generatedDescription, setGeneratedDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [generationError, setGenerationError] = React.useState(null);
    const [saveToAirtableStatus, setSaveToAirtableStatus] = React.useState(''); // New state for Airtable save status

    // State for the iframe's source URL to bust cache
    const [iframeSrc, setIframeSrc] = React.useState('');

    // --- IMPORTANT: REPLACE WITH YOUR ACTUAL VERCEL SERVERLESS FUNCTION URLS AFTER DEPLOYMENT ---
    // For local testing, if you run Vercel dev server (vercel dev), these might be http://localhost:3000/api/...
    // For deployed app, use your Vercel project's domain.
    const VERCEL_PRODUCTION_DOMAIN = 'https://ai-product-generator-sigma.vercel.app';
    const GEMINI_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/gemini-generate-description`;
    const AIRTABLE_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/airtable-descriptions`;

    // Base URL for the Airtable embed (without query parameters)
    const AIRTABLE_EMBED_BASE_URL = "https://airtable.com/embed/appmbVTcI3TqH3nxS/shrxArbpZEQj41Y1s?layout=card";

    // Effect to initialize iframeSrc with a cache-busting timestamp on initial load
    React.useEffect(() => {
        setIframeSrc(`${AIRTABLE_EMBED_BASE_URL}&_t=${new Date().getTime()}`);
    }, []); // Run only once on mount

    // Effect to clear error messages after a delay
    React.useEffect(() => {
        if (generationError) {
            const timer = setTimeout(() => {
                setGenerationError(null);
            }, 5000); // Clear error after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [generationError]);

    // Effect to clear Airtable save status messages after a delay
    React.useEffect(() => {
        if (saveToAirtableStatus) {
            const timer = setTimeout(() => {
                setSaveToAirtableStatus('');
            }, 5000); // Clear status after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [saveToAirtableStatus]);


    const handleGenerateDescription = async () => {
        if (!productName || !keyFeatures || !targetAudience || !descriptionLength) {
            setGenerationError("Please fill in all required fields.");
            return;
        }

        setGeneratedDescription('');
        setGenerationError(null);
        setLoading(true);
        setSaveToAirtableStatus(''); // Clear previous save status

        const prompt = `Generate a ${descriptionLength} product description for "${productName}". Key features: ${keyFeatures}. Target audience: ${targetAudience}.`;

        try {
            // 1. Call Gemini Proxy to generate description
            const response = await fetch(GEMINI_PROXY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AI-Product-Generator-Frontend/1.0', // Your frontend's User-Agent
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();
            const text = result.candidates && result.candidates.length > 0 &&
                         result.candidates[0].content && result.candidates[0].content.parts &&
                         result.candidates[0].content.parts.length > 0
                         ? result.candidates[0].content.parts[0].text
                         : 'No description generated.';

            setGeneratedDescription(text);

            // Construct the payload for Airtable
            const airtablePayload = {
                "Product Name": productName, 
                "Key Features": keyFeatures,
                "Target Audience": targetAudience,
                "Description Length": descriptionLength,
                "Generated Text": text,
            };


            // Save the generated description to Airtable via proxy
            setSaveToAirtableStatus('Saving to Airtable...');
            const airtableSaveResponse = await fetch(AIRTABLE_PROXY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AI-Product-Generator-Frontend/1.0', // Consistent User-Agent
                },
                body: JSON.stringify(airtablePayload),
            });

            if (!airtableSaveResponse.ok) {
                const airtableErrorData = await airtableSaveResponse.json();
                throw new Error(`Airtable save error: ${airtableErrorData.error || airtableSaveResponse.statusText}`);
            }

            setSaveToAirtableStatus('Description saved to Airtable successfully!');

        } catch (err) {
            console.error("Generation or Save Error:", err);
            setGenerationError(`Error: ${err.message}`);
            setSaveToAirtableStatus(`Failed to save to Airtable: ${err.message}`); // Show Airtable specific error
        } finally {
            setLoading(false);
        }
    };

    // Function to handle page refresh (now updates iframe src)
    const handleRefreshAirtableView = () => {
        // Update the iframe src with a new timestamp to force a reload
        setIframeSrc(`${AIRTABLE_EMBED_BASE_URL}&_t=${new Date().getTime()}`);
        setSaveToAirtableStatus('Airtable view refreshed!'); // Provide feedback
    };

    return (
        <div className="p-4 sm:p-8 font-inter bg-[#3C4B3B] rounded-lg shadow-xl max-w-4xl mx-auto border border-[#748873]">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#D1A980] mb-6 text-center">
                AI Product Description Generator
            </h1>

            <div className="space-y-6 mb-8">
                <div>
                    <label htmlFor="productName" className="block text-[#F8F8F8] text-sm font-bold mb-2">Product Name:</label>
                    <input
                        type="text"
                        id="productName"
                        className="form-input block w-full rounded-md border-gray-600 shadow-sm bg-[#5A6B59] text-[#F8F8F8] placeholder-[#B0B0B0] focus:border-[#D1A980] focus:ring focus:ring-[#D1A980] focus:ring-opacity-50"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="e.g., Smartwatch, Organic Coffee Beans"
                    />
                </div>
                <div>
                    <label htmlFor="keyFeatures" className="block text-[#F8F8F8] text-sm font-bold mb-2">Key Features:</label>
                    <textarea
                        id="keyFeatures"
                        rows="3"
                        className="form-textarea block w-full rounded-md border-gray-600 shadow-sm bg-[#5A6B59] text-[#F8F8F8] placeholder-[#B0B0B0] focus:border-[#D1A980] focus:ring focus:ring-[#D1A980] focus:ring-opacity-50 resize-y"
                        value={keyFeatures}
                        onChange={(e) => setKeyFeatures(e.target.value)}
                        placeholder="e.g., GPS tracking, Heart rate monitor, Waterproof; ethically sourced, rich aroma"
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="targetAudience" className="block text-[#F8F8F8] text-sm font-bold mb-2">Target Audience:</label>
                    <input
                        type="text"
                        id="targetAudience"
                        className="form-input block w-full rounded-md border-gray-600 shadow-sm bg-[#5A6B59] text-[#F8F8F8] placeholder-[#B0B0B0] focus:border-[#D1A980] focus:ring focus:ring-[#D1A980] focus:ring-opacity-50"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Fitness enthusiasts, Busy professionals, Coffee connoisseurs"
                    />
                </div>
                <div>
                    <label htmlFor="descriptionLength" className="block text-[#F8F8F8] text-sm font-bold mb-2">Description Length:</label>
                    <select
                        id="descriptionLength"
                        className="form-select block w-full rounded-md border-gray-600 shadow-sm bg-[#5A6B59] text-[#F8F8F8] focus:border-[#D1A980] focus:ring focus:ring-[#D1A980] focus:ring-opacity-50"
                        value={descriptionLength}
                        onChange={(e) => setDescriptionLength(e.target.value)}
                    >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <button
                    onClick={handleGenerateDescription}
                    className="bg-[#D1A980] hover:bg-[#B89470] text-[#3C4B3B] font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D1A980] focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Description'}
                </button>
            </div>

            {generationError && (
                <div className="mt-6 p-4 bg-red-700 text-red-100 rounded-lg shadow-md text-center flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold">Error:</p>
                    <p>{generationError}</p>
                </div>
            )}

            {generatedDescription && (
                <div className="mt-8 p-6 bg-[#5A6B59] rounded-lg shadow-inner border border-[#748873]">
                    <h3 className="text-xl font-semibold text-[#D1A980] mb-4">Generated Description:</h3>
                    <p className="text-[#F8F8F8] whitespace-pre-wrap">{generatedDescription}</p>
                    {saveToAirtableStatus && ( // Display Airtable save status
                        <p className={`mt-4 text-sm font-medium flex items-center space-x-2 ${saveToAirtableStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                            {saveToAirtableStatus.includes('Failed') ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span>{saveToAirtableStatus}</span>
                        </p>
                    )}
                </div>
            )}

            {/* Airtable Iframe Section */}
            <div className="mt-12 p-6 bg-[#5A6B59] rounded-lg shadow-inner border border-[#748873]">
                <h3 className="text-xl font-semibold text-[#D1A980] mb-4 text-center">View Generated Descriptions in Airtable</h3>
                {/* Refresh Button */}
                <div className="flex justify-center mb-4">
                    <button
                        onClick={handleRefreshAirtableView}
                        className="bg-[#90A08F] hover:bg-[#D1A980] text-[#3C4B3B] font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D1A980] focus:ring-opacity-75"
                    >
                        Refresh Airtable View
                    </button>
                </div>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}> {/* 16:9 aspect ratio container */}
                    <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-md" // Tailwind classes for full size and rounded corners
                        src={iframeSrc}
                        frameBorder="0"
                        onLoad={() => console.log('Airtable iframe loaded')} // Optional: for debugging
                        style={{ background: 'transparent' }} // Keep transparent background if needed
                        allowFullScreen // Allow fullscreen
                    ></iframe>
                </div>
                <p className="text-[#F8F8F8] text-sm mt-4 text-center">
                    *Note: This embedded view may not update in real-time. Click "Refresh Airtable View" to see new entries.
                </p>
            </div>
        </div>
    );
};

export default App;
