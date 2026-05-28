import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

export default router;
