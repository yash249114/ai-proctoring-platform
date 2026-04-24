# AI Interview Platform MVP

## Stack
- **Backend**: FastAPI (Python) + MongoDB (Motor/Beanie)
- **Frontend**: React (Vite) + Monaco Editor + TailwindCSS
- **Real-time**: WebSockets

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
