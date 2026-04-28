import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search as SearchIcon, Compass } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './ui/Button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    toast.info('Sign in flow coming next phase. For now you can browse freely.');
  };

  const navLinks = [
    { to: '/', label: 'Stays' },
    { to: '/search', label: 'Explore' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-white/95 backdrop-blur shadow-header">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-ink"
        >
          <Compass className="h-6 w-6 text-primary" />
          <span className="tracking-tight">Stay</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-ink bg-ink/[0.04]'
                    : 'text-ink-muted hover:text-ink hover:bg-ink/[0.03]'
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-ink/[0.04] hover:text-ink md:inline-flex"
            aria-label="Search"
          >
            <SearchIcon className="h-4.5 w-4.5" />
          </button>

          <button
            onClick={() => toast.info('Become a host — coming in a later phase.')}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink md:inline-block"
          >
            List your place
          </button>

          {isAuthenticated ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-ink-muted">
                Hi, {user?.full_name.split(' ')[0]}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="hidden md:inline-flex"
              onClick={handleSignIn}
            >
              Sign in
            </Button>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/[0.04] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-ink-line bg-white md:hidden">
          <div className="container-page space-y-1 py-3">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                toast.info('Become a host — coming in a later phase.');
              }}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
            >
              List your place
            </button>
            <div className="pt-2">
              {isAuthenticated ? (
                <Button variant="outline" className="w-full" onClick={logout}>
                  Sign out
                </Button>
              ) : (
                <Button className="w-full" onClick={handleSignIn}>
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
