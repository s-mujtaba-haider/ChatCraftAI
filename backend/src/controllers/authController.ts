import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { config } from '../config';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName, avatarUrl } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName,
        avatarUrl,
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      config.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'Missing refresh token' });
      return;
    }

    const payload = jwt.verify(token, config.JWT_SECRET) as {
      userId: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
    };

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      config.JWT_SECRET,
      { expiresIn: '60m' }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error(err);
    res.clearCookie('refreshToken');

    if (err instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: 'Refresh token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid refresh token' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Add this to your existing authController.ts
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Add initial letter as a fallback
    const userWithInitial = {
      ...user,
      initial: user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'
    };

    res.json(userWithInitial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};