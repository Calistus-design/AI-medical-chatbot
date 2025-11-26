# Setting up the AI First-Aid Assistant to run locally

This guide provides all the necessary steps to get the project running on your local machine.

## Setting Up Your Development Environment

### Prerequisites

Before you begin, ensure you have the following installed on your system:
-   [**Node.js**](https://nodejs.org/) (LTS version is recommended)
-   [**Git**](https://git-scm.com/)
-   A [**Supabase**](https://supabase.com/) account.
-   A [**Kaggle**](https://www.kaggle.com/) account (for running the GPU-powered backend).

### 1. Clone the Repository

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/Calistus-design/AI-medical-chatbot
cd ai-medical-chatbot
```

### 2. Install Frontend Dependencies

Navigate to the `ai-first-aid` directory and install all the required Node.js packages.

```bash
npm install
```

### 3. Set Up Supabase

Your Supabase project needs to be configured correctly.

1.  **Create a New Project**: Go to your Supabase dashboard and create a new project.
2.  **Run SQL Scripts**: Follow the detailed, step-by-step instructions in our database setup guide to create the tables, functions, and security policies.
    **[View the Database Setup Guide](./DATABASE_SETUP.md)**
3.  **Get Your API Keys**: In your Supabase project's `Project Settings` -> `API` section, find and copy your **Project URL**, your `anon` **public key**, and your `service_role` **secret key**. You will need these for the next step.

### 4. Set Up Environment Variables

In the root of the `ai-first-aid` folder, create a new file named `.env.local`. This file will hold all your secret keys. Add the following content, replacing the placeholders with your actual keys from Supabase and (later) from Kaggle.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# AI Backend (You will get this from Kaggle in the next step)
NEXT_PUBLIC_AI_API_ENDPOINT=
AI_API_SECRET_KEY=some_secret_password_of_your_choice
```

### 5. Run the AI Backend on Kaggle

1.  **Get Your ngrok Auth Token**:
    *   Log in to your [ngrok dashboard](https://dashboard.ngrok.com).
    *   On the left sidebar, go to `Your Authtoken`.
    *   Copy your authentication token. It will be a long string of characters.

2.  **Upload and Configure the Kaggle Notebook**:
    *   Upload the `medbotchatsmv.ipynb` notebook to your Kaggle account.
    *   In the Kaggle notebook editor, find the right-hand panel and go to `Settings` -> `Secrets`.
    *   Click **"Add a new secret"**.
    *   For the "Label", enter exactly `NGROK_AUTH_TOKEN`.
    *   For the "Value", paste the auth token you copied from your ngrok dashboard.

3.  **Run the Notebook**:
    *   In the notebook settings, make sure the **GPU accelerator** is turned on.
    *   Run all cells in the notebook from top to bottom (`Run` -> `Run All`).

4.  **Get the Public URL**:
    *   The last cell will start the server and print a public `ngrok` URL. It will look something like `https://random-words.ngrok-free.dev`.

5.  **Update Your `.env.local` File**:
    *   Copy this `ngrok` URL.
    *   Paste it as the value for `NEXT_PUBLIC_AI_API_ENDPOINT` in your `.env.local` file.
    *   **Important**: Make sure to add `/ask` to the end of the URL (e.g., `https://random-words.ngrok-free.dev/ask`).

### 6. Run the Frontend

You are now ready to start the frontend development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running. You're all set to start developing!