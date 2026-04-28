import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search as SearchIcon, Compass, ChevronDown } from 'lucide-react';

import { Button } from './ui/Button';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'Stays', end: true },
    { to: '/search', label: 'Explore', end: false },
  ];

  const handleHostClick = () => {
    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }
    navigate('/host');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink-line bg-white/95 backdrop-blur shadow-header">
      <div className="container-page relative flex h-16 items-center justify-between gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-ink"
        >
          <Compass className="h-6 w-6 text-primary" />
          <span className="tracking-tight">Stay</span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="hidden h-10 w-10 items-center justify-center rounded-full text-ink-muted hover:bg-ink/[0.04] hover:text-ink md:inline-flex"
            aria-label="Search"
          >
            <SearchIcon className="h-4 w-4" />
          </button>

          <button
            onClick={handleHostClick}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink md:inline-block"
          >
            List your place
          </button>

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                onBlur={() => setTimeout(() => setAccountOpen(false), 150)}
                className="flex items-center gap-2 rounded-full border border-ink-line bg-white py-1 pl-3 pr-1 text-sm hover:shadow-card"
              >
                <span className="text-ink-muted">
                  {user?.full_name.split(' ')[0]}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {user?.full_name
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('')}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
              </button>
              {accountOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-ink-line bg-white py-1.5 shadow-cardHover">
                  <DropdownItem onClick={() => navigate('/bookings')}>
                    My bookings
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate('/host')}>
                    Host dashboard
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => navigate('/host/properties/new')}
                  >
                    List a new place
                  </DropdownItem>
                  <hr className="my-1 border-ink-line" />
                  <DropdownItem onClick={logout}>Sign out</DropdownItem>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
              >
                Sign in
              </Button>
              <Button size="sm" onClick={() => openAuthModal('register')}>
                Sign up
              </Button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/[0.04] md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

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
            {isAuthenticated && (
              <>
                <Link
                  to="/bookings"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
                >
                  My bookings
                </Link>
                <Link
                  to="/host"
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
                >
                  Host dashboard
                </Link>
              </>
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleHostClick();
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal('login');
                    }}
                  >
                    Sign in
                  </Button>
                  <Button
                    onClick={() => {
                      setMenuOpen(false);
                      openAuthModal('register');
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="block w-full px-4 py-2 text-left text-sm text-ink-muted hover:bg-ink/[0.04] hover:text-ink"
    >
      {children}
    </button>
  );
}
