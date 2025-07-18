# AI Product Description Generator

## 🚀 Project Overview

This project is an **AI-powered Product Description Generator** designed to streamline the creation of compelling product descriptions. It leverages the power of the **Gemini API** for intelligent text generation and seamlessly integrates with **Airtable** to store all generated descriptions, providing a centralized and organized database for your product content.

This application was developed as part of **project work for an Airtable job application**, demonstrating proficiency in modern web development, API integration, and problem-solving.

## ✨ Features

* **Intelligent Description Generation:** Utilizes the Gemini API to create unique and tailored product descriptions based on user input (Product Name, Key Features, Target Audience, and desired length).

* **Airtable Integration:** Automatically saves every generated product description, along with its input parameters, to a designated Airtable base for easy management, review, and export.

* **Responsive User Interface:** Built with React and styled using Tailwind CSS for a clean, modern, and mobile-friendly user experience.

* **Secure API Handling:** Employs Vercel Serverless Functions as API proxies to securely handle API keys for both Gemini and Airtable, preventing exposure in the client-side code.

## 🛠️ Technologies Used

* **Frontend:**

    * [React](https://react.dev/) (JavaScript library for building user interfaces)

    * [Vite](https://vitejs.dev/) (Fast build tool for modern web projects)

    * [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS framework for rapid styling)

* **Backend (Serverless Functions):**

    * [Vercel Serverless Functions](https://vercel.com/docs/functions) (Node.js environment for API proxies)

    * `node-fetch` (Used in serverless functions for making HTTP requests)

* **APIs:**

    * [Google Gemini API](https://ai.google.dev/models/gemini) (For AI-powered text generation)

    * [Airtable API](https://airtable.com/developers/web/api/introduction) (For database interaction)

* **Deployment:**

    * [Vercel](https://vercel.com/) (Platform for frontend frameworks and static sites)

    * [GitHub](https://github.com/) (Version control and code hosting)

## ⚙️ Setup & Installation (Local Development)

To run this project on your local machine, ensuring all dependencies and styling are correctly set up for Tailwind CSS v4+:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/damunoz32/ai-product-generator-vite-airtable.git](https://github.com/damunoz32/ai-product-generator-vite-airtable.git)
    cd ai-product-generator-vite-airtable
    ```

2.  **Install all project dependencies (including Tailwind CSS v4 and its PostCSS plugin):**
    ```bash
    npm install -D react@latest react-dom@latest node-fetch@latest @vitejs/plugin-react@latest tailwindcss@latest postcss@latest autoprefixer@latest @tailwindcss/forms@latest @tailwindcss/postcss@latest
    ```
    * **Explanation:** This command explicitly installs all necessary development dependencies at their latest compatible versions, including the core `tailwindcss` v4, `postcss`, `autoprefixer`, the `@tailwindcss/forms` plugin, and critically, the `@tailwindcss/postcss` plugin which is required for Tailwind v4's integration with PostCSS.

3.  **Generate Tailwind CSS configuration files:**
    ```bash
    npx tailwindcss init -p
    ```
    * **Explanation:** This command creates `tailwind.config.js` and `postcss.config.cjs` in your project root with initial configurations.

4.  **Update `tailwind.config.js`:**
    * Open the newly generated `tailwind.config.js` file.
    * Ensure the `content` array correctly points to your source files:
        ```javascript
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        ```
    * Add the `@tailwindcss/forms` plugin to the `plugins` array:
        ```javascript
        plugins: [
          require('@tailwindcss/forms'),
        ],
        ```
    * Save the file.

5.  **Update `postcss.config.cjs`:**
    * Open the newly generated `postcss.config.cjs` file.
    * Ensure its content uses the `@tailwindcss/postcss` plugin for Tailwind v4 integration:
        ```javascript
        module.exports = {
          plugins: {
            '@tailwindcss/postcss': {}, // This is the correct plugin for Tailwind CSS v4+
            autoprefixer: {},
          },
        };
        ```
    * Save the file.

6.  **Update `src/index.css` for Tailwind CSS v4+:**
    * Open `src/index.css` and replace its entire content with the new v4 import syntax:
        ```css
        @import "tailwindcss";

        /* You can add your own custom CSS below this line if needed */
        ```
    * Save the file.

7.  **Ensure `src/App.jsx` has the correct styling classes and API URLs:**
    * Verify `src/App.jsx` includes the enhanced Tailwind CSS classes for form elements (e.g., `form-input`, `form-textarea`, `form-select`) and the correct Vercel production URLs for API calls.

8.  **Optional (Recommended) - Update Airtable Iframe URL in `src/App.jsx`:**
    * If you want the embedded Airtable view to display data from *your own* Airtable base, you'll need to update the iframe's source URL.
    * Go to your Airtable base, open the `Generated Descriptions` table, create a shareable view (e.g., a Grid view), and get the embed code.
    * Open `src/App.jsx` and locate the `AIRTABLE_EMBED_BASE_URL` constant.
    * **Replace the existing URL** with the embed URL from *your* Airtable view:
        ```javascript
        const AIRTABLE_EMBED_BASE_URL = "[https://airtable.com/embed/YOUR_AIRTABLE_BASE_ID/YOUR_AIRTABLE_VIEW_ID?layout=card](https://airtable.com/embed/YOUR_AIRTABLE_BASE_ID/YOUR_AIRTABLE_VIEW_ID?layout=card)";
        ```
        *(Example: `https://airtable.com/embed/appXXXXXXXXXXXXXX/shrXXXXXXXXXXXXXX?layout=card`)*
    * Save the file.

9.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will open in your browser, usually at `http://localhost:5173/`. Perform a hard refresh (`Ctrl + Shift + R` on Windows/Linux, `Cmd + Shift + R` on Mac) to ensure the latest CSS is loaded.

## ☁️ Deployment (Vercel)

This application is designed for seamless deployment on Vercel.

1.  **Connect to GitHub:** Link your GitHub repository (`ai-product-generator-vite-airtable`) to your Vercel account.

2.  **Environment Variables:** Crucially, set the following Environment Variables in your Vercel project settings (under "Settings" > "Environment Variables"):

    * `GEMINI_API_KEY`: Your Google Gemini API Key.

    * `AIRTABLE_API_TOKEN`: Your Airtable Personal Access Token (starts with `pat...`). Ensure it has `data.records:read` and `data.records:write` scopes for your base.

    * `AIRTABLE_BASE_ID`: Your Airtable Base ID (starts with `app...`).

3.  **Update Frontend URLs:** After deployment, copy your Vercel project's main domain (e.g., `https://{{example}}.vercel.app/`) and update `src/App.jsx` to use these live URLs for the API proxies:
    ```javascript
    const VERCEL_PRODUCTION_DOMAIN = 'https://{{example}}.vercel.app';
    const GEMINI_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/gemini-generate-description`;
    const AIRTABLE_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/airtable-descriptions`;
    ```
    Commit and push this change to trigger a Vercel redeployment.

## 🗄️ Airtable Configuration

To ensure the Airtable integration works, please set up your Airtable base as follows:

1.  **Base Name:** You can name your base anything (e.g., "AI Product Descriptions").

2.  **Table Name:** Create a table named **`Generated Descriptions`** (case-sensitive, must be exact).

3.  **Fields:** Within the `Generated Descriptions` table, create the following fields with their respective types:

    * `Product Name` (Single line text) - **This must be your Primary Field (the first column).**

    * `Key Features` (Long text)

    * `Target Audience` (Single line text)

    * `Description Length` (Single select)
        * **Crucially, add the following options to this Single select field:** `short`, `medium`, `long` (exact spelling and casing).

    * `Generated Text` (Long text)

    * *(Optional: You can add a "Created time" field which Airtable will auto-populate).*

4.  **Personal Access Token:** Ensure your Airtable Personal Access Token has `data.records:read`, `data.records:write`, and `schema.bases:read` scopes, and access to your specific base.

## 🚧 Roadblocks & Debugging Journey

This project's development involved navigating several persistent and insightful technical challenges, which ultimately led to a more robust understanding of modern JavaScript build environments and API integrations.

1.  **Initial `react-scripts` / `tailwindcss` Executable Not Found (Create React App):**
    * **Problem:** `npm start` and `npx tailwindcss init -p` failed with "command not recognized" or "could not determine executable to run" errors. This indicated that `npm` was not correctly linking or finding the executables in `node_modules/.bin`.
    * **Debugging:** Involved multiple aggressive `npm cache clean --force`, `rm -rf node_modules`, `rm package-lock.json` cycles, and even global `npm` reinstallation. The `npx cowsay` test was used to confirm `npx`'s basic functionality.
    * **Resolution:** While temporary fixes sometimes worked, the issue was highly persistent, suggesting a deeper environmental corruption with `create-react-app`'s internal setup on the development machine. This unresolved issue ultimately led to the strategic decision to migrate to Vite.

2.  **Migration to Vite & `ReferenceError: module is not defined` in PostCSS Config:**
    * **Problem:** After migrating to Vite, a new error appeared: `ReferenceError: module is not defined in ES module scope` in `postcss.config.js`. Vite projects often use `"type": "module"` in `package.json`, treating `.js` files as ES Modules, but `postcss.config.js` used CommonJS `module.exports`.
    * **Debugging:** The error message itself provided the solution.
    * **Resolution:** Renamed `postcss.config.js` to `postcss.config.cjs`. This explicitly tells Node.js to treat the file as a CommonJS script, resolving the module type conflict.

3.  **Airtable `404 NOT_FOUND` Error:**
    * **Problem:** The application successfully generated descriptions but failed to save to Airtable, returning a `404` error from the Airtable API.
    * **Debugging:** Traced the error to incorrect Airtable API parameters.
    * **Resolution:** Discovered that the `AIRTABLE_BASE_ID` environment variable in Vercel incorrectly included URL query parameters (e.g., `?blocks=hide`) or part of the table/view ID. The Base ID must *only* be the `appXXXXXXXXXXXXXX` string. Also verified the `airtableTableName` in `api/airtable-descriptions.js` was an exact match.

4.  **Airtable `422 INVALID_MULTIPLE_CHOICE_OPTIONS` Error:**
    * **Problem:** After fixing the 404, a `422` error appeared, indicating "Insufficient permissions to create new select option 'medium'".
    * **Debugging:** The error message clearly pointed to a validation issue with a "Single select" field in Airtable.
    * **Resolution:** Manually added the expected options (`short`, `medium`, `long`) to the "Description Length" field in the Airtable table.

5.  **Airtable `422 UNKNOWN_FIELD_NAME: "Record ID"` Error:**
    * **Problem:** After simplifying the Airtable integration (to populate flat fields without linked records), the app failed with `UNKNOWN_FIELD_NAME: "Record ID"`. The code was attempting to send a unique identifier to a field named "Record ID".
    * **Debugging:** Confirmed that the primary field (the first column) in the `Generated Descriptions` table was actually named `"Product Name"`, not `"Record ID"`.
    * **Resolution:** Modified `src/App.jsx` and `api/airtable-descriptions.js` to send the unique record identifier (e.g., "Product Name - 7/17/2025, 7:04:00 PM") directly to the primary field, which was correctly identified as `"Product Name"`. This allowed records to be created.

6.  **Airtable `422 INVALID_RECORD_ID: Value "[object Object]" is not a valid record ID` (Linked Records Attempt):**
    * **Problem:** When attempting to implement a "Linked Product" field to connect `Generated Descriptions` to a separate `Products` table, Airtable consistently returned `INVALID_RECORD_ID: Value "[object Object]" is not a valid record ID`. This occurred despite the serverless function correctly looking up/creating product IDs and sending the payload in the format `[{ "id": "recXXXXXXXXXXXXXX" }]`, which is specified in Airtable's API documentation. `curl` tests with the exact payload also failed.
    * **Debugging:** Extensive logging in the serverless function confirmed the correct payload was being generated and sent. Meticulous verification of Airtable field type ("Link to another record"), linked table ("Products"), and permissions (Personal Access Token with `data.records:read`, `data.records:write` scopes) showed no apparent misconfiguration. Even creating new linked fields in Airtable did not resolve the issue, suggesting a very subtle, base-specific anomaly.
    * **Resolution:** This specific issue remained unresolved as a direct API fix for the linked field proved elusive. For the immediate goal of a functional app for the job application, the linked record feature was temporarily de-prioritized, and the app was reverted to populate flat fields (as described in point 5 above). This decision was made to ensure core functionality for the demonstration.

7.  **Tailwind CSS v4 Styling Not Applying:**
    * **Problem:** After various setup attempts, Tailwind CSS styling was not applying in the browser, despite classes being present in `App.jsx`.
    * **Debugging:**
        * Initial attempts to use verbose logging (`TAILWIND_LOG_LEVEL=verbose npm run dev` on Windows) failed due to incorrect command syntax.
        * Even with correct syntax, logs did not appear, indicating PostCSS/Tailwind was not being invoked by Vite.
        * The core issue was identified as a misunderstanding of Tailwind CSS v4's new integration method. V4 no longer uses `@tailwind` directives in CSS and requires specific PostCSS plugin configuration.
        * Subsequent errors (`It looks like you're trying to use tailwindcss directly as a PostCSS plugin... install @tailwindcss/postcss` and `Cannot find module '@tailwindcss/postcss'`) pinpointed the exact missing package and incorrect `postcss.config.cjs` configuration.
    * **Resolution:**
        1.  Updated `src/index.css` to use `@import "tailwindcss";` (Tailwind v4 syntax).
        2.  Corrected `postcss.config.cjs` to use `'@tailwindcss/postcss': {}`.
        3.  Ensured `@tailwindcss/postcss` package was explicitly installed via `npm install -D @tailwindcss/postcss@latest`.
        4.  Performed a full `node_modules` and `package-lock.json` clean-up, followed by `npm install` and `npm run dev` with a hard browser refresh. This comprehensive alignment with Tailwind CSS v4's requirements finally enabled the styling.

This highlights the importance of systematic debugging, understanding build tool intricacies, and the value of choosing the right tools for the job when faced with persistent environmental challenges.

## 🚀 Live Application

You can view and interact with the live application here:
https://ai-product-generator-sigma.vercel.app/

## 📧 Contact

Dante Muñoz  
damunoz32@gmail.com  
https://dantemunoz.webflow.io  
https://github.com/damunoz32  
https://www.linkedin.com/in/dante-munoz-86433190/