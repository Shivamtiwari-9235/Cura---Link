# Curalink AI Medical Research Assistant

## Project Overview
Curalink is an AI-powered medical research assistant that helps users explore medical research data from PubMed, OpenAlex, and ClinicalTrials.gov. It provides personalized insights based on patient context using a local Ollama model.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **AI**: Ollama with Mistral model
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
Create a `.env` file at the project root or in the `server/` directory:
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
OLLAMA_URL=http://localhost:11434/api/generate
MODEL_NAME=mistral
```

### 5. Install Ollama
Download and install Ollama from [https://ollama.ai](https://ollama.ai).

### 6. Pull and Run Mistral Model
```bash
ollama pull mistral
ollama run mistral
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
- backend on `http://localhost:5000`
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
| GET | `/api/test` | Test backend availability |

## Notes

- The frontend uses `http://localhost:5000` as the backend base URL.
- The backend always returns JSON and includes robust error handling.
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