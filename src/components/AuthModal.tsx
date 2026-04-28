import { useEffect, useState } from 'react';
import { Compass, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    register,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open/close
  useEffect(() => {
    if (!authModalOpen) {
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      setError(null);
      setSubmitting(false);
    }
  }, [authModalOpen]);

  // Esc to close
  useEffect(() => {
    if (!authModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Welcome back!');
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          phone: phone || undefined,
        });
        toast.success('Account created. Welcome to Stay!');
      }
      closeAuthModal();
    } catch (err) {
      const detail =
        // axios error shape
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ??
        (err as Error)?.message ??
        'Something went wrong. Please try again.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={closeAuthModal}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-full p-1.5 text-ink-muted hover:bg-ink/[0.04]"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-8 pb-2 pt-8">
          <div className="mb-2 flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Stay</span>
          </div>
          <h2 className="text-2xl font-semibold text-ink">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {isLogin
              ? 'Sign in to book your next stay or list a place.'
              : 'Free to join. No card required to browse.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3 px-8 pb-8 pt-4">
          {!isLogin && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Full name
              </label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                required
                minLength={1}
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-muted">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
              required
              minLength={isLogin ? 1 : 8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-muted">
                Phone <span className="text-ink-subtle">(optional)</span>
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 0100"
                autoComplete="tel"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className={cn('w-full', submitting && 'opacity-80')}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>

          <p className="pt-2 text-center text-sm text-ink-muted">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => openAuthModal(isLogin ? 'register' : 'login')}
              className="font-medium text-primary hover:text-primary-hover"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
