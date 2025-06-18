import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Using declaration merging to extend the Request interface
declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: 'Token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      res.status(500).json({ message: 'Authentication error' });
    }
  }
};


export default authenticate;