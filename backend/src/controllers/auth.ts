import { Request, Response } from 'express';
import { z } from 'zod';
import { registerUser, loginUser, generateAccessToken, generateRefreshToken } from '../services/auth';
import { User } from '../models/User';

const cookieOptions = {
  httpOnly: true,
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await registerUser(parsed);

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.status(201).json({ user: safeUser });
  } catch (error) {
    console.error('Register error', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginUser(parsed as any);

    res.cookie('accessToken', accessToken, cookieOptions);
    res.cookie('refreshToken', refreshToken, cookieOptions);

    const safeUser = await User.findById(user._id).select('-passwordHash');
    res.status(200).json({ user: safeUser });
  } catch (error) {
    console.error('Login error', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ ok: true });
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    const user = await User.findById(userId).select('-passwordHash');
    res.status(200).json({ user });
  } catch (error) {
    console.error('Me error', error);
    res.status(500).json({ error: 'Server error' });
  }
};
