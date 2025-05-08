import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
  tenantId: string;
  role: string;
}

export const protect = async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as JwtPayload;

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ message: 'Not authorized' });
        return;
      }

      // Add user to request
      (req as any).user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    if (!roles.includes((req as any).user.role)) {
      res.status(403).json({
        message: `User role ${(req as any).user.role} is not authorized to access this route`,
      });
      return;
    }
    next();
  };
}; 