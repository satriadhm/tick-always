import { OAuth2Client } from 'google-auth-library';
import { HydratedDocument } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { SimpleCache } from '@/lib/utils/cache';
import { IUser } from '@/types';

interface GoogleLoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  error?: string;
  message?: string;
}

class AuthService {
  private googleClient: OAuth2Client | null = null;
  private userCache: SimpleCache<HydratedDocument<IUser>>;

  constructor() {
    if (process.env.GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    this.userCache = new SimpleCache<HydratedDocument<IUser>>(300); // 5 minutes cache
  }

  /**
   * Login with Google ID token
   */
  async googleLogin(idToken: string): Promise<GoogleLoginResult> {
    try {
      if (!this.googleClient) {
        return {
          success: false,
          error: 'GOOGLE_CLIENT_ID_NOT_CONFIGURED',
          message: 'Google OAuth is not configured',
        };
      }

      await connectDB();

      // Verify the ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID!,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return {
          success: false,
          error: 'INVALID_TOKEN',
          message: 'Invalid Google ID token',
        };
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        return {
          success: false,
          error: 'NO_EMAIL',
          message: 'Google account does not have an email address',
        };
      }

      // Check cache first
      let user = this.userCache.get(email.toLowerCase());

      if (!user) {
        // Find or create user
        user = await User.findOne({ email: email.toLowerCase() });
      } else {
        console.log('Cache Hit for user:', email);
      }

      if (user) {
        // Update user with Google ID and avatar if not already set
        let hasUpdates = false;
        if (!user.googleId) {
          user.googleId = googleId;
          hasUpdates = true;
        }
        if (!user.avatar && picture) {
          user.avatar = picture;
          hasUpdates = true;
        }
        
        if (hasUpdates) {
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          googleId,
          avatar: picture,
          role: 'user',
        });
      }

      // Update cache
      if (!user) {
        return {
          success: false,
          error: 'USER_CREATION_FAILED',
          message: 'Failed to create or retrieve user',
        };
      }

      // Update cache
      this.userCache.set(email.toLowerCase(), user);

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role || 'user',
        },
      };
    } catch (error) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: 'GOOGLE_LOGIN_FAILED',
        message: error instanceof Error ? error.message : 'Failed to login with Google',
      };
    }
  }
}

export const authService = new AuthService();

