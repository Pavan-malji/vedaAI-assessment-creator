import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: SocketIOServer;

const JWT_SECRET = process.env.JWT_SECRET || 'vedaai-jwt-secret-change-in-production';

const parseCookie = (cookieHeader: string | undefined) => {
  if (!cookieHeader) return {} as Record<string,string>;
  return cookieHeader.split(';').map(c => c.trim()).reduce((acc: any, pair) => {
    const [k, v] = pair.split('=');
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
};

export const initSocket = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, ''),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      let accessToken = token;

      if (!accessToken) {
        const cookies = parseCookie(socket.handshake.headers.cookie as string | undefined);
        accessToken = cookies?.accessToken;
      }

      if (!accessToken) return next();

      const payload = jwt.verify(accessToken, JWT_SECRET) as any;
      (socket as any).user = payload;
      return next();
    } catch (err) {
      console.warn('Socket auth failed', err);
      return next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    const user = (socket as any).user;
    if (user && user.userId) {
      socket.join(`user:${user.userId}`);
      console.log(`Socket ${socket.id} joined user:${user.userId}`);
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.error('Socket.io has not been initialized');
  }
  return io;
};
