import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { connectDB } from './lib/mongoose';
import { initSocket } from './socket';
import assignmentRoutes from './routes/assignment';

// Import aiWorker to start BullMQ worker
import './workers/aiWorker';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

app.use('/api/assignments', assignmentRoutes);

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
