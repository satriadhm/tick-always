import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#e0e0e0] flex flex-col">
      {/* Header */}
      <header className="bg-[#e0e0e0]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-semibold tracking-tight text-[#4a4a4a]">
              Tick Always
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Hero Card */}
          <div className="
            bg-[#e0e0e0] rounded-3xl p-12
            shadow-[
              -12px_-12px_24px_rgba(255,255,255,0.9),
              12px_12px_24px_rgba(190,190,190,0.9)
            ]
          ">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#4a4a4a] mb-6">
              Your Productivity Companion
            </h1>
            <p className="text-lg md:text-xl text-[#6b6b6b] max-w-2xl mx-auto leading-relaxed mb-10">
              Stay on top of your tasks, build powerful habits, and organize your daily life
              effortlessly—anywhere, anytime.
            </p>

            {/* Call-to-actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="px-10 py-4">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="px-10 py-4">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '✓', title: 'Tasks', desc: 'Organize your to-dos' },
              { icon: '📅', title: 'Calendar', desc: 'Plan your schedule' },
              { icon: '🎯', title: 'Habits', desc: 'Build daily routines' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="
                  bg-[#e0e0e0] rounded-2xl p-6
                  shadow-[
                    -6px_-6px_12px_rgba(255,255,255,0.8),
                    6px_6px_12px_rgba(190,190,190,0.8)
                  ]
                  hover:shadow-[
                    -8px_-8px_16px_rgba(255,255,255,0.9),
                    8px_8px_16px_rgba(190,190,190,0.9)
                  ]
                  transition-all duration-300
                "
              >
                <div className="
                  w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center text-2xl
                  bg-[#e0e0e0]
                  shadow-[
                    inset_-3px_-3px_6px_rgba(255,255,255,0.9),
                    inset_3px_3px_6px_rgba(190,190,190,0.9)
                  ]
                ">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#4a4a4a] mb-1">{feature.title}</h3>
                <p className="text-sm text-[#6b6b6b]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#e0e0e0] py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-[#8a8a8a]">
          <p>&copy; {new Date().getFullYear()} Tick Always. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
