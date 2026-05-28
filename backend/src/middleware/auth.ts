import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'vedaai-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vedaai-refresh-secret-change-in-production';
const cookieOptions = {
  httpOnly: true,
  sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export interface AuthedRequest extends Request {
  user?: AuthPayload;
}

export const authMiddleware = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies?.accessToken as string | undefined;
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!accessToken) {
      // try refresh path
      if (!refreshToken) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;
        // issue new access token cookie
        const newAccess = (jwt as any).sign({ userId: payload.userId, email: payload.email }, JWT_SECRET as any, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any);
        res.cookie('accessToken', newAccess, cookieOptions);
        req.user = payload;
        return next();
      } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }
    }

    try {
      const payload = jwt.verify(accessToken, JWT_SECRET) as AuthPayload;
      req.user = payload;
      return next();
    } catch (err) {
      // try refresh token
      if (!refreshToken) return res.status(401).json({ error: 'Invalid access token' });
      try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as AuthPayload;
        const newAccess = (jwt as any).sign({ userId: payload.userId, email: payload.email }, JWT_SECRET as any, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any);
        res.cookie('accessToken', newAccess, cookieOptions);
        req.user = payload;
        return next();
      } catch (e) {
        return res.status(401).json({ error: 'Invalid tokens' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};
