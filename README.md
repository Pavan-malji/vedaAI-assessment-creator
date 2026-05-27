# VedaAI — AI Assessment Creator

VedaAI is a full-stack web application that lets teachers generate structured question papers using Google Gemini AI. Teachers fill in a form, the backend queues an AI generation job, and the finished paper is pushed back to the browser in real time via WebSockets. The preview screen also exports the full paper to PDF directly in the browser.

---

## Architecture Overview

```
Browser (Next.js)
  │
  │  POST /api/assignments          ← create assignment + enqueue job
  │  GET  /api/assignments/:id/result ← poll for result (fallback)
  │  WebSocket (socket.io-client)   ← receive job:progress / job:done / job:failed
  ▼
Express Server (Node.js)
  │
  ├── MongoDB (Mongoose)            ← persist Assignment + Result documents
  ├── Redis (ioredis)               ← BullMQ job queue + result cache (TTL 1h)
  ├── BullMQ Queue                  ← assignment-generation queue
  ├── BullMQ Worker (aiWorker)      ← picks up jobs, calls Gemini, saves result
  └── Socket.io Server              ← broadcasts job events to connected clients

Google Gemini API (gemini-2.5-flash)
  ← called by the worker, returns structured JSON question paper
```

**Flow:**
1. Teacher submits the assignment form → `POST /api/assignments`
2. Backend saves the assignment to MongoDB with status `pending` and enqueues a BullMQ job
3. The worker picks up the job, updates status to `processing`, emits `job:progress` via Socket.io
4. Worker calls Gemini, validates the response with Zod, saves the `Result` to MongoDB and caches it in Redis
5. Worker emits `job:done` with the full paper via Socket.io
6. Frontend receives the event, updates Zustand store, renders the question paper, and can export the full paper to PDF
7. If the WebSocket event is missed, the frontend polls `GET /api/assignments/:id/result` every 3 seconds as a fallback

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Zustand, socket.io-client, axios |
| Backend | Node.js, Express 5, TypeScript, BullMQ, socket.io |
| Database | MongoDB 7 (Mongoose) |
| Cache / Queue | Redis 7 (ioredis + BullMQ) |
| AI | Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai` |
| Validation | Zod (backend AI response + request body) |
| Infrastructure | Docker Compose (MongoDB + Redis) |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repo-url>
cd vedaai-assessment-creator
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

**Frontend** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB and Redis via Docker

```bash
docker-compose up -d
```

### 5. Start the development servers

```bash
# Backend (from /backend)
npm run dev

# Frontend (from /frontend)
npm run dev
```

Frontend runs on http://localhost:3000  
Backend runs on http://localhost:5000

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/assignments` | Create assignment and start AI generation |
| `GET` | `/api/assignments/:id` | Get assignment metadata |
| `GET` | `/api/assignments/:id/result` | Get generated question paper (cache → DB → status) |

### POST /api/assignments — Request Body

```json
{
  "subject": "Science",
  "topic": "Electricity",
  "dueDate": "2025-07-01",
  "questionTypes": ["Short Questions", "Multiple Choice Questions"],
  "numberOfQuestions": 10,
  "marksPerQuestion": 2,
  "totalMarks": 20,
  "additionalInstructions": "Focus on electroplating and conductors"
}
```

### POST /api/assignments — Response

```json
{
  "assignmentId": "64f...",
  "jobId": "1",
  "message": "Generation started"
}
```

### GET /api/assignments/:id/result — Response (completed)

```json
{
  "source": "cache",
  "paper": {
    "sections": [
      {
        "title": "Section A",
        "instruction": "Attempt all questions",
        "questions": [
          { "id": "1", "text": "...", "difficulty": "easy", "marks": 2 }
        ]
      }
    ]
  }
}
```

### WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `job:progress` | Server → Client | `{ assignmentId, status: "processing", progress: 50 }` |
| `job:done` | Server → Client | `{ assignmentId, paper: QuestionPaper }` |
| `job:failed` | Server → Client | `{ assignmentId, error: string }` |

---

## Design Decisions

- **BullMQ over direct async calls** — AI generation can take 5–15 seconds. Offloading to a queue prevents HTTP timeouts and allows retries on failure.
- **Redis dual role** — Used both as the BullMQ job store and as a result cache (TTL 1 hour), so repeated `getResult` calls don't hit MongoDB.
- **Zod validation on AI output** — Gemini occasionally returns malformed JSON. Zod catches this and throws `AI_PARSE_ERROR` so the worker can mark the job as failed cleanly.
- **WebSocket + polling fallback** — WebSocket delivers results instantly, but if the client connects after the event fires, the 3-second polling loop catches up.
- **Separate Zustand stores** — `useVedaStore` manages the dashboard assignment list (with mock data for demo). `useAssignmentStore` manages the live AI generation state (jobStatus, paper, error). This keeps concerns separated without breaking existing UI.
