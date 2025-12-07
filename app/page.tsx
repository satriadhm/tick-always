import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-semibold tracking-tight text-gray-900">
              Tick Always
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-sm hover:shadow-md">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
            Your Productivity Companion
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10">
            Stay on top of your tasks, build powerful habits, and organize your daily life
            effortlessly—anywhere, anytime.
          </p>

          {/* Call-to-actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="px-8 py-3 shadow-md hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
                className="px-8 py-3 border hover:bg-gray-50 transition-all"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tick Always. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
