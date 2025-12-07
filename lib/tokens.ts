import jwt from 'jsonwebtoken';
import { IUser } from '@/types';
import connectDB from '@/lib/mongodb';
import { RefreshToken } from '@/lib/models/RefreshToken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Get access token max age in seconds
 */
export function getAccessTokenMaxAgeSeconds(): number {
  return ACCESS_TOKEN_EXPIRY;
}

/**
 * Get refresh token max age in seconds
 */
export function getRefreshTokenMaxAgeSeconds(): number {
  return REFRESH_TOKEN_EXPIRY;
}

/**
 * Sign access token
 */
export function signAccessToken(user: { id: string; email: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Sign and store refresh token
 */
export async function signAndStoreRefreshToken(user: { id: string; email: string }): Promise<string> {
  await connectDB();

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const refreshToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  // Store refresh token in database
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000),
  });

  return refreshToken;
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    await connectDB();
    
    // Check if token exists in database
    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      return null;
    }

    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Revoke refresh token
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  await connectDB();
  await RefreshToken.deleteOne({ token });
}

