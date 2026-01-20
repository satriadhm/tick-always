import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Get user from request (from JWT token)
 */
export interface AuthUser {
  id: string;
  userId: string;
  email: string;
}

/**
 * Get user from request (from JWT token)
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (payload) {
    return {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
    };
  }
  return null;
}

/**
 * Get user from cookie (alternative method)
 */
export function getCurrentUserFromCookie(request: NextRequest): AuthUser | null {
  // Check for accessToken first (used by Google OAuth and login)
  let token = request.cookies.get('accessToken')?.value;
  
  // Fallback to auth-token for backwards compatibility
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }
  
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (payload) {
    return {
      id: payload.userId,
      userId: payload.userId,
      email: payload.email,
    };
  }
  return null;
}

/**
 * Authentication middleware for API routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser(request) || getCurrentUserFromCookie(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

