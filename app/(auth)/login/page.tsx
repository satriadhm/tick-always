'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const errorMessages: Record<string, string> = {
        oauth_error: 'Failed to initiate Google login',
        google_auth_failed: 'Google authentication failed',
        missing_code: 'Missing authentication code',
        token_exchange_failed: 'Failed to exchange token',
        google_login_failed: 'Failed to login with Google',
        user_not_found: 'User not found',
        callback_error: 'An error occurred during authentication',
      };
      setError(errorMessages[errorParam] || 'An error occurred');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/tasks');
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e0e0e0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#4a4a4a]">Tick Always</h1>
          <p className="mt-2 text-[#6b6b6b]">Sign in to your account</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="
                bg-[#e0e0e0] rounded-xl px-4 py-3 text-[#ce6b6b] text-sm
                shadow-[
                  inset_-2px_-2px_4px_rgba(255,255,255,0.8),
                  inset_2px_2px_4px_rgba(190,190,190,0.8)
                ]
              ">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#bebebe] to-transparent" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#e0e0e0] text-[#8a8a8a]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="secondary"
                className="w-full flex items-center justify-center gap-3"
                onClick={() => {
                  window.location.href = '/api/auth/google';
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#6b6b6b"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#6b6b6b"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#6b6b6b"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#6b6b6b"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[#6b6b6b]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#6b8cce] hover:text-[#5a7ab8] font-medium">
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#e0e0e0]">
        <div className="text-center">
          <div className="
            w-10 h-10 mx-auto rounded-xl
            bg-[#e0e0e0]
            shadow-[
              -3px_-3px_6px_rgba(255,255,255,0.9),
              3px_3px_6px_rgba(190,190,190,0.9)
            ]
            flex items-center justify-center
          ">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#6b8cce] border-t-transparent"></div>
          </div>
          <p className="mt-4 text-[#6b6b6b]">Loading...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
