# AI-Powered First-Aid Assistant

![AI First-Aid Assistant Screenshot](https://user-images.githubusercontent.com/121543883/82a1796b-5975-4921-995a-c9d7249a04a5.png)

An intelligent, "Emergency-First" web application designed to provide immediate, reliable first-aid guidance and locate nearby medical facilities.

**[View the Live Demo Here](https://ai-medical-chatbot-one.vercel.app/chat)**

---

## Core Features

-   **Intelligent AI Chatbot**: Provides step-by-step first-aid guidance using a powerful, medical-specific language model (`microsoft/MediPhi-Clinical`).
-   **Multi-Stage AI Pipeline**: A sophisticated backend that uses a "Gatekeeper" to block off-topic questions and a "Safety Analyst" to detect serious emergencies and proactively recommend action.
-   **Persistent & Shareable Chats**: Conversations are tied to your account and saved in the URL, allowing you to refresh the page or share a link without losing your chat history.
-   **Full Chat History Management**: Logged-in users can view, **rename**, and **delete** their past conversations via a collapsible sidebar.
-   **High-Accuracy Hospital Finder**: Uses geolocation (via PostGIS) to find and display the nearest hospitals, sorted by true distance, and allows for searching by name.
-   **Secure & Private**: Built with a "privacy-first" mindset using Supabase's Row Level Security to guarantee that users can only ever access their own data.

## The Vision: "Emergency-First"

The core philosophy of this project is to prioritize speed, simplicity, and zero barriers to access for users in distress. The UI is clean and minimalist, guiding the user to get the help they need as quickly as possible. Every feature, from the AI's proactive emergency prompts to the one-click "Directions" button, is designed with this principle in mind.

##  A Look Inside: The AI Architecture

This project's backend is more than just a simple API call. It's a three-stage pipeline that ensures responses are safe, relevant, and intelligent.

1.  **Stage 1: The Gatekeeper (Intent Classification)**: Before anything else, a zero-shot classifier (`facebook/bart-large-mnli`) inspects the user's query. If it's not a medical question, it's politely rejected, preventing misuse and saving resources.
2.  **Stage 2: The Brain (RAG & Generation)**: For valid medical questions, we use Retrieval-Augmented Generation (RAG). A `Qwen` embedding model finds relevant first-aid context from a FAISS vector database. This context, along with the user's question and chat history, is then fed to the `microsoft/MediPhi-Clinical` model to generate a high-quality, step-by-step answer.
3.  **Stage 3: The Safety Analyst (Seriousness Classification)**: After the answer is generated, the classifier runs *again* on the AI's own response. If it detects language indicating a critical emergency (e.g., "stroke," "call emergency services"), it sends a flag to the frontend to proactively display a "Find Nearest Hospital" button.

## Tech Stack

-   **Frontend**: Next.js (App Router), React, TypeScript, Material-UI, Tailwind CSS
-   **Backend**: Python, FastAPI, running on a Kaggle Notebook with GPU acceleration.
-   **Database**: Supabase (PostgreSQL with PostGIS for geospatial queries).
-   **Authentication**: Supabase Auth (Email/Password + Google OAuth).
-   **Deployment**: Vercel (Frontend) and Ngrok (Backend Tunnel).

## Running Locally & Contributing

I welcome contributions! If you'd like to run the project locally, fix a bug, or add a feature, please see my detailed setup guide.

**[View the Setup Guide](./SETUP.md)**