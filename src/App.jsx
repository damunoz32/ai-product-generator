import React, { useState, useEffect } from 'react';

// Main App component for the AI Product Description Generator
const App = () => {
    // State variables for inputs and output
    const [productName, setProductName] = useState('');
    const [keyFeatures, setKeyFeatures] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [descriptionLength, setDescriptionLength] = useState('medium'); // Default to medium
    const [generatedDescription, setGeneratedDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [generationError, setGenerationError] = useState(null);
    const [saveToAirtableStatus, setSaveToAirtableStatus] = useState(''); // New state for Airtable save status

    // --- IMPORTANT: REPLACE WITH YOUR ACTUAL VERCEL SERVERLESS FUNCTION URLS AFTER DEPLOYMENT ---
    // For local testing, if you run Vercel dev server (vercel dev), these might be http://localhost:3000/api/...
    // For deployed app, use your Vercel project's domain.
    const VERCEL_PRODUCTION_DOMAIN = 'https://ai-product-generator-sigma.vercel.app';
    const GEMINI_PROXY_API_URL = '${VERCEL_PRODUCTION_DOMAIN}/api/gemini-generate-description';
    const AIRTABLE_PROXY_API_URL = '$(VERCEL_PRODUCTION_DOMAIN}/api/airtable-descriptions';

    // Effect to clear error messages after a delay
    useEffect(() => {
        if (generationError) {
            const timer = setTimeout(() => {
                setGenerationError(null);
            }, 5000); // Clear error after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [generationError]);

    // Effect to clear Airtable save status messages after a delay
    useEffect(() => {
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

            // 2. Save the generated description to Airtable via proxy
            setSaveToAirtableStatus('Saving to Airtable...');
            const airtableSaveResponse = await fetch(AIRTABLE_PROXY_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'AI-Product-Generator-Frontend/1.0', // Consistent User-Agent
                },
                body: JSON.stringify({
                    productName: productName,
                    keyFeatures: keyFeatures,
                    targetAudience: targetAudience,
                    descriptionLength: descriptionLength,
                    generatedText: text,
                }),
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

    return (
        <div className="p-4 sm:p-8 font-inter bg-[#3C4B3B] rounded-lg shadow-xl max-w-4xl mx-auto border border-[#748873]">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#D1A980] mb-6 text-center">
                AI Product Description Generator
            </h1>

            <div className="space-y-4 mb-6">
                <div>
                    <label htmlFor="productName" className="block text-[#F8F8F8] text-sm font-bold mb-2">Product Name:</label>
                    <input
                        type="text"
                        id="productName"
                        className="shadow appearance-none border border-[#748873] rounded w-full py-2 px-3 text-[#F8F8F8] leading-tight focus:outline-none focus:shadow-outline bg-[#5A6B59]"
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
                        className="shadow appearance-none border border-[#748873] rounded w-full py-2 px-3 text-[#F8F8F8] leading-tight focus:outline-none focus:shadow-outline bg-[#5A6B59]"
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
                        className="shadow appearance-none border border-[#748873] rounded w-full py-2 px-3 text-[#F8F8F8] leading-tight focus:outline-none focus:shadow-outline bg-[#5A6B59]"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="e.g., Fitness enthusiasts, Busy professionals, Coffee connoisseurs"
                    />
                </div>
                <div>
                    <label htmlFor="descriptionLength" className="block text-[#F8F8F8] text-sm font-bold mb-2">Description Length:</label>
                    <select
                        id="descriptionLength"
                        className="shadow border border-[#748873] rounded w-full py-2 px-3 text-[#F8F8F8] leading-tight focus:outline-none focus:shadow-outline bg-[#5A6B59]"
                        value={descriptionLength}
                        onChange={(e) => setDescriptionLength(e.target.value)}
                    >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleGenerateDescription}
                    className="bg-[#D1A980] hover:bg-[#B89470] text-[#3C4B3B] font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D1A980] focus:ring-opacity-75"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Description'}
                </button>
            </div>

            {generationError && (
                <div className="mt-6 p-4 bg-red-800 text-red-100 rounded-lg shadow-md text-center">
                    <p className="font-semibold">Error:</p>
                    <p>{generationError}</p>
                </div>
            )}

            {generatedDescription && (
                <div className="mt-8 p-6 bg-[#5A6B59] rounded-lg shadow-inner border border-[#748873]">
                    <h3 className="text-xl font-semibold text-[#D1A980] mb-4">Generated Description:</h3>
                    <p className="text-[#F8F8F8] whitespace-pre-wrap">{generatedDescription}</p>
                    {saveToAirtableStatus && ( // Display Airtable save status
                        <p className={`mt-4 text-sm font-medium ${saveToAirtableStatus.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                            {saveToAirtableStatus}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default App;
