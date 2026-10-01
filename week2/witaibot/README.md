# WIT AI Bot

AI chatbot for Walchand Institute of Technology, Solapur.

## Structure
- `backend/` FastAPI + Groq backend
- `frontend/` React + Vite frontend

## Run backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Run frontend
```bash
cd frontend
npm install
npm run dev
```

Open the frontend URL shown by Vite, normally `http://localhost:5173`.

## Environment
Your existing `.env` should be placed inside `backend/`.

Required:
```env
GROQ_API_KEY=your_key_here
```

Optional:
```env
GROQ_MODEL=openai/gpt-oss-20b
```
