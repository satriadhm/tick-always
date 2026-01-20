'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/tasks');
        router.refresh();
      } else {
        setError(data.error || 'Registration failed');
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
          <p className="mt-2 text-[#6b6b6b]">Create your account</p>
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
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />

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
              autoComplete="new-password"
              minLength={8}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign up
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b6b6b]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#6b8cce] hover:text-[#5a7ab8] font-medium">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
