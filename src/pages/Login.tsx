import { useState } from 'react';
import { Layers, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccessMessage('');

    // Validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (mode === 'signup' && !name) {
      setError('Please enter your name');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUp(email, password, name);
        setSuccessMessage('Account created! Check your email to confirm, then sign in.');
        setMode('login');
      } else {
        await signIn(email, password);
        // Auth state change will automatically redirect via App.tsx
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-accent-mid bg-accent-dim shadow-lg shadow-accent/10">
          <Layers size={32} className="text-accent" strokeWidth={1.6} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Apex Finance</h1>
        <p className="mt-1 text-[13px] text-muted-dark">Your money, in one view</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-[340px]">
        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-[13px] font-semibold text-white transition-colors hover:border-accent hover:bg-card-hover"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] uppercase tracking-wider text-muted-dark">or {mode === 'login' ? 'sign in' : 'sign up'} with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Form */}
        <div className="space-y-0">
          {mode === 'signup' && (
            <Input
              label="Full Name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[34px] text-muted-dark hover:text-muted"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-2 rounded-lg bg-red-dim p-2.5 text-[11px] text-red">{error}</p>
        )}

        {/* Success */}
        {successMessage && (
          <p className="mt-2 rounded-lg bg-green-dim p-2.5 text-[11px] text-green">{successMessage}</p>
        )}

        {/* Submit */}
        <Button fullWidth size="lg" onClick={handleSubmit} disabled={loading} className="mt-4">
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>

        {/* Toggle mode */}
        <p className="mt-4 text-center text-xs text-muted-dark">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMessage(''); }}
            className="font-semibold text-accent hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

        {/* Privacy note */}
        <p className="mt-6 text-center text-[10px] text-muted-dark">
          Your data is encrypted and stored securely via Supabase.
        </p>
      </div>
    </div>
  );
}
