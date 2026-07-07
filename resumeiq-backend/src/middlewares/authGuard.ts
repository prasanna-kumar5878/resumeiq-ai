import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { UserRole } from '../models/User.js';

interface JwtPayloadData {
  id: string;
  role: UserRole;
  email: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to get access.', 401));
    }

    const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback-super-secret-key';
    
    // Verify token validity
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadData;

    // Attach verified user payload directly to request context
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    return next(new AppError('Invalid token or session expired. Please log in again.', 401));
  }
};

// Role Restricter Middleware Factory
export const restrictTo = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have administrative permission to perform this action.', 403));
    }
    return next();
  };
};