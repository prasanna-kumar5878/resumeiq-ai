import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';
import { AppError } from '../utils/appError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokenUtil.js';

// Cookie options for secure deployment
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'none' as const, // Essential for cross-site cookie handling on Render/Vercel
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('An account with this email address already exists.', 400));
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      isVerified: false, // Default state before verification flow
    });

    res.status(201).json({
      status: 'success',
      message: 'Account provisioned successfully.',
      data: {
        userId: newUser._id,
        email: newUser.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      return next(new AppError('Invalid credentials. Please try again.', 401));
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatch) {
      return next(new AppError('Invalid credentials. Please try again.', 401));
    }

    const accessToken = generateAccessToken({ id: user.id as string, role: user.role, email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user.id as string });

    // Append token to user document array (supports multi-device login states)
    user.refreshToken = user.refreshToken ? [...user.refreshToken, newRefreshToken] : [newRefreshToken];
    await user.save();

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cookies = req.cookies || {};
    const oldRefreshToken = cookies.refreshToken;

    if (!oldRefreshToken) {
      return next(new AppError('Session token absent. Access Denied.', 401));
    }

    // Clear stale cookie immediately to run rotation step
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    const user = await User.findOne({ refreshToken: oldRefreshToken });

    // REUSE DETECTION: If token isn't attached to a user, it might be compromised
    if (!user) {
      try {
        const decoded = verifyRefreshToken(oldRefreshToken);
        // Clear all active tokens for the compromised account as a security measure
        await User.findByIdAndUpdate(decoded.id, { $set: { refreshToken: [] } });
      } catch {
        // Token was invalid anyway, fail gracefully
      }
      return next(new AppError('Compromised session context discovered. Re-authentication forced.', 403));
    }

    // Filter out the old refresh token from the database array
    user.refreshToken = user.refreshToken ? user.refreshToken.filter((t: string) => t !== oldRefreshToken) : [];

    try {
      const decoded = verifyRefreshToken(oldRefreshToken);
      
      const newAccessToken = generateAccessToken({ id: user.id as string, role: user.role, email: user.email });
      const newRefreshToken = generateRefreshToken({ id: user.id as string });

      user.refreshToken.push(newRefreshToken);
      await user.save();

      res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
      res.status(200).json({
        status: 'success',
        data: { accessToken: newAccessToken },
      });
    } catch (err) {
      // Token expired or invalid, persist the updated array without the dead token
      await user.save();
      return next(new AppError('Session expired. Please log in again.', 401));
    }
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    if (oldRefreshToken) {
      await User.findOneAndUpdate(
        { refreshToken: oldRefreshToken },
        { $pull: { refreshToken: oldRefreshToken } }
      );
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(200).json({ status: 'success', message: 'Logged out successfully.' });
  } catch (error) {
    return next(error);
  }
};