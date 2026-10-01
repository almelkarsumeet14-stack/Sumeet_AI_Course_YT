# HireMeAI Frontend

React + Vite frontend for the HireMeAI FastAPI backend.

## Requirements

- Node.js 18+
- HireMeAI FastAPI backend running on `http://127.0.0.1:8000`

## Install

```bash
cd frontend
npm install
```

## Run

```bash
npm run dev
```

Open:

http://localhost:5173

## Backend API

The frontend sends:

POST `http://127.0.0.1:8000/chat`

Body:

```json
{
  "question": "What are the candidate's strongest skills?"
}
```

Expected response:

```json
{
  "answer": "..."
}
```

If you change the backend port or host, update `src/services/api.js`.
