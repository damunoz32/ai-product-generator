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

To run this project on your local machine:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_GITHUB_USERNAME/ai-product-generator-vite-airtable.git](https://github.com/YOUR_GITHUB_USERNAME/ai-product-generator-vite-airtable.git)
    cd ai-product-generator-vite-airtable
    ```
    *(Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create Tailwind CSS config files (if not already present):**

    * Create `tailwind.config.js` in the project root:
        ```javascript
        /** @type {import('tailwindcss').Config} */
        export default {
          content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }
        ```

    * Create `postcss.config.cjs` in the project root:
        ```javascript
        module.exports = {
          plugins: {
            '@tailwindcss/postcss': {},
            autoprefixer: {},
          },
        };
        ```
        *(Note the `.cjs` extension for PostCSS config due to ES Module scope in Vite/Node.js)*

4.  **Update `src/index.css`:**

    * Open `src/index.css` and replace its entire content with:
        ```css
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
        ```

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will open in your browser, usually at `http://localhost:5173/`.

## ☁️ Deployment (Vercel)

This application is designed for seamless deployment on Vercel.

1.  **Connect to GitHub:** Link your GitHub repository (`ai-product-generator-vite-airtable`) to your Vercel account.

2.  **Environment Variables:** Crucially, set the following Environment Variables in your Vercel project settings (under "Settings" > "Environment Variables"):

    * `GEMINI_API_KEY`: Your Google Gemini API Key.

    * `AIRTABLE_API_TOKEN`: Your Airtable Personal Access Token (starts with `pat...`).

    * `AIRTABLE_BASE_ID`: Your Airtable Base ID (starts with `app...`).

3.  **Update Frontend URLs:** After deployment, copy your Vercel project's main domain (e.g., `https://ai-product-generator-sigma.vercel.app/`) and update `src/App.jsx` to use these live URLs for the API proxies:
    ```javascript
    const VERCEL_PRODUCTION_DOMAIN = '[https://ai-product-generator-sigma.vercel.app](https://ai-product-generator-sigma.vercel.app)'; // Your main Vercel domain
    const GEMINI_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/gemini-generate-description`;
    const AIRTABLE_PROXY_API_URL = `${VERCEL_PRODUCTION_DOMAIN}/api/airtable-descriptions`;
    ```
    Commit and push this change to trigger a Vercel redeployment.

## 🗄️ Airtable Configuration

To ensure the Airtable integration works, please set up your Airtable base as follows:

1.  **Base Name:** You can name your base anything (e.g., "AI Product Descriptions").

2.  **Table Name:** Create a table named **`Generated Descriptions`** (case-sensitive, must be exact).

3.  **Fields:** Within the `Generated Descriptions` table, create the following fields with their respective types:

    * `Product Name` (Single line text)

    * `Key Features` (Long text)

    * `Target Audience` (Single line text)

    * `Description Length` (Single select)
        * **Crucially, add the following options to this Single select field:** `short`, `medium`, `long` (exact spelling and casing).

    * `Generated Text` (Long text)

    * *(Optional: You can add a "Created time" field which Airtable will auto-populate).*

4.  **Personal Access Token:** Ensure your Airtable Personal Access Token has `data.records:read`, `data.records:write`, and `schema.bases:read` scopes, and access to your specific base.

## 🚧 Roadblocks & Debugging Journey

This project's development involved navigating several persistent and insightful technical challenges, which ultimately led to a more robust understanding of modern JavaScript build environments.

1.  **Initial `react-scripts` / `tailwindcss` Executable Not Found (Create React App):**
    * **Problem:** `npm start` and `npx tailwindcss init -p` failed with "command not recognized" or "could not determine executable to run" errors. This indicated that `npm` was not correctly linking or finding the executables in `node_modules/.bin`.
    * **Debugging:** Involved multiple aggressive `npm cache clean --force`, `rm -rf node_modules`, `rm package-lock.json` cycles, and even global `npm` reinstallation. The `npx cowsay` test was used to confirm `npx`'s basic functionality.
    * **Resolution:** While temporary fixes sometimes worked, the issue was highly persistent, suggesting a deeper environmental corruption with `create-react-app`'s internal setup on the development machine.

2.  **PostCSS Plugin Error (`tailwindcss` directly as plugin) in Create React App:**
    * **Problem:** Even when the app started, it threw an error stating `tailwindcss` was being used directly as a PostCSS plugin, recommending `@tailwindcss/postcss`. This occurred despite `postcss.config.js` being correctly configured with `@tailwindcss/postcss`.
    * **Debugging:** Added `console.log` to `postcss.config.js` which confirmed the file was *not* being loaded by `create-react-app`'s build process, indicating a severe internal caching or configuration issue within CRA.
    * **Resolution:** This unresolved issue ultimately led to the strategic decision to migrate to Vite.

3.  **Migration to Vite & `ReferenceError: module is not defined` in PostCSS Config:**
    * **Problem:** After migrating to Vite, a new error appeared: `ReferenceError: module is not defined in ES module scope` in `postcss.config.js`. Vite projects often use `"type": "module"` in `package.json`, treating `.js` files as ES Modules, but `postcss.config.js` used CommonJS `module.exports`.
    * **Debugging:** The error message itself provided the solution.
    * **Resolution:** Renamed `postcss.config.js` to `postcss.config.cjs`. This explicitly tells Node.js to treat the file as a CommonJS script, resolving the module type conflict.

4.  **Airtable `404 NOT_FOUND` Error:**
    * **Problem:** The application successfully generated descriptions but failed to save to Airtable, returning a `404` error from the Airtable API.
    * **Debugging:** Traced the error to incorrect Airtable API parameters.
    * **Resolution:** Discovered that the `AIRTABLE_BASE_ID` environment variable in Vercel incorrectly included URL query parameters (e.g., `?blocks=hide`) or part of the table/view ID. The Base ID must *only* be the `appXXXXXXXXXXXXXX` string. Also verified the `airtableTableName` in `api/airtable-descriptions.js` was an exact match.

5.  **Airtable `422 INVALID_MULTIPLE_CHOICE_OPTIONS` Error:**
    * **Problem:** After fixing the 404, a `422` error appeared, indicating "Insufficient permissions to create new select option 'medium'".
    * **Debugging:** The error message clearly pointed to a validation issue with a "Single select" field in Airtable.
    * **Resolution:** Manually added the expected options (`short`, `medium`, `long`) to the "Description Length" field in the Airtable table.

This highlights the importance of systematic debugging, understanding build tool intricacies, and the value of choosing the right tools for the job when faced with persistent environmental challenges.

## 🚀 Live Application

You can view and interact with the live application here:
[https://ai-product-generator-sigma.vercel.app/](https://ai-product-generator-sigma.vercel.app/)

## 📧 Contact

Dante Muñoz  
damunoz32@gmail.com  
https://dantemunoz.webflow.io  
https://github.com/damunoz32  
https://www.linkedin.com/in/dante-munoz-86433190/  
