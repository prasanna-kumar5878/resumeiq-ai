import jwt from 'jsonwebtoken';
import { UserRole } from '../models/index.js'; // Clean tracking connection

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-fallback-access-secret-key';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-fallback-refresh-secret-key';

export const generateAccessToken = (payload: { id: string; role: UserRole; email: string }): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, REFRESH_SECRET) as { id: string };
};