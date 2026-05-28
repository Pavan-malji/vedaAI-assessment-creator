import express from 'express';
import cors from 'cors';
// cookie-parser is optional in containerized dev environments where node_modules
// can be provided by the image or host mount. Load it defensively.
let cookieParser: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  cookieParser = require('cookie-parser');
} catch (e) {
  cookieParser = null;
}
import { createServer } from 'http';
import { connectDB } from './lib/mongoose';
import { initSocket } from './socket';
import assignmentRoutes from './routes/assignment';
import authRoutes from './routes/auth';
import { authMiddleware } from './middleware/auth';

// Import aiWorker to start BullMQ worker
import './workers/aiWorker';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

// Provide a noop fallback middleware so the app continues even if
// cookie-parser isn't installed in the runtime environment.
if (!cookieParser) {
  cookieParser = () => (req: any, res: any, next: any) => next();
  console.warn('cookie-parser not available; using noop fallback');
}

app.use(cookieParser());

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/assignments', authMiddleware, assignmentRoutes);

const server = createServer(app);

initSocket(server);

const startServer = async () => {
  await connectDB();
  
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
