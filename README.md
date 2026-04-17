# Curalink AI Medical Research Assistant

## Project Overview
Curalink is an AI-powered medical research assistant that helps users explore medical research data from PubMed, OpenAlex, and ClinicalTrials.gov. It provides personalized insights using a secure backend and managed AI completion service.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI**: Groq API chat completions
- **APIs**: PubMed E-utilities, OpenAlex, ClinicalTrials.gov

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd Medical-AI
```

### 2. Backend Setup
```bash
cd server
npm install
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

### 4. Environment Configuration
Create a `.env` file in the `server/` directory and `client/.env` from the examples:
```
# server/.env
PORT=5001
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
CORS_ORIGINS=https://cura-link-69v1.vercel.app,http://localhost:5173,http://127.0.0.1:5173

# client/.env
VITE_API_BASE_URL=http://localhost:5001
```

### 7. Root-Level Install and Start (Optional)
After the root `package.json` is added, you can install and run both services together from the project root:

```bash
cd Medical-AI
npm install
npm run install-all
npm start
```

This will start:
- backend on `http://localhost:5001`
- frontend on `http://localhost:5173`

### 8. Start the Application Manually
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:5173` and the backend should listen on `http://localhost:5000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/query` | Submit a new research query |
| POST | `/api/chat/followup` | Send a follow-up question |
| GET | `/api/health` | Health check endpoint |

## Notes

- The frontend uses `VITE_API_BASE_URL` to configure backend API access.
- The backend uses Helmet, compression, CORS restrictions, and rate limiting.
- Required request body for `/api/chat/query`:
  - `patientName`
  - `disease`
  - `query`
  - `location`

## Debugging

- Verify MongoDB is reachable via `MONGO_URI`.
- Confirm Ollama is running locally and accessible at `OLLAMA_URL`.
- Use `http://localhost:5000/api/health` to confirm backend availability.
- Check browser console for frontend errors and server console for backend logs.

## Safety Disclaimer
This tool is for research purposes only and does not provide medical diagnosis or treatment advice. Always consult qualified healthcare professionals for medical decisions.