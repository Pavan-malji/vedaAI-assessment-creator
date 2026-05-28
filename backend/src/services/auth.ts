import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthPayload, RegisterInput, LoginInput } from '../types';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'vedaai-jwt-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'vedaai-refresh-secret-change-in-production';

export const generateAccessToken = (payload: AuthPayload) => {
  return (jwt as any).sign(payload, JWT_SECRET as any, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as any);
};

export const generateRefreshToken = (payload: AuthPayload) => {
  return (jwt as any).sign(payload, JWT_REFRESH_SECRET as any, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as any);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as AuthPayload;
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) throw new Error('Email already in use');

  const user = new User({ name: input.name, email: input.email, passwordHash: input.password });
  await user.save();

  const payload: AuthPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const payload: AuthPayload = { userId: user._id.toString(), email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { user, accessToken, refreshToken };
};
