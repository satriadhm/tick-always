import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { IUser } from '@/types';

interface GoogleLoginResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role?: string;
    avatar?: string;
  };
  error?: string;
  message?: string;
}

class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor() {
    if (process.env.GOOGLE_CLIENT_ID) {
      this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
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



      // Find or create user
      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        // Update user with Google ID if not already set
        let updates = false;
        if (!user.googleId) {
          user.googleId = googleId;
          updates = true;
        }
        // Update avatar if available and different (or not set)
        if (picture && user.avatar !== picture) {
          user.avatar = picture;
          updates = true;
        }
        
        if (updates) {
          await user.save();
        }
      } else {
        // Create new user
        user = await User.create({
          email: email.toLowerCase(),
          name: name || email.split('@')[0],
          googleId,
          role: 'user',
          avatar: picture,
        });
      }

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'user',
          avatar: user.avatar,
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

