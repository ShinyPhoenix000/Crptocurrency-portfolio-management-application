import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

// Map Firebase Auth error codes to user-friendly messages
const getAuthErrorMessage = (code: string, mode: 'login' | 'signup') => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in or use another email.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter a password.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/invalid-login-credentials':
      return mode === 'login' ? 'Invalid email or password.' : 'Invalid credentials.';
    default:
      return 'Authentication error. Please try again.';
  }
};

const AuthForm: React.FC = () => {
  const { user, loading, signup, login, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Display Name is required.');
          return;
        }
        const cred = await signup(email, password);
        if (cred && cred.user) {
          await updateProfile(cred.user, { displayName });
          await setDoc(doc(db, 'users', cred.user.uid), {
            displayName,
            email: cred.user.email,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch (err: any) {
      // Firebase error codes are in err.code or err.message
      let code = err.code || '';
      if (!code && typeof err.message === 'string') {
        // Try to extract code from message
        const match = err.message.match(/\(auth\/(.*?)\)/);
        if (match) code = `auth/${match[2]}`;
        // Handle REST API error codes
        if (err.message.includes('INVALID_LOGIN_CREDENTIALS')) code = 'auth/invalid-login-credentials';
        if (err.message.includes('EMAIL_NOT_FOUND')) code = 'auth/user-not-found';
        if (err.message.includes('INVALID_PASSWORD')) code = 'auth/wrong-password';
        if (err.message.includes('EMAIL_EXISTS')) code = 'auth/email-already-in-use';
        if (err.message.includes('WEAK_PASSWORD')) code = 'auth/weak-password';
      }
      setError(getAuthErrorMessage(code, mode));
    }
  };

  if (user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">Logged in as <span className="font-semibold">{user.displayName || user.email}</span></div>
        <Button onClick={logout} disabled={loading}>Logout</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
      <h2 className="text-xl font-bold text-center mb-2">{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="text-destructive text-sm text-center" data-testid="auth-error">{error}</div>}
      {mode === 'signup' && (
        <Input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          autoComplete="name"
        />
      )}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
      </Button>
      <div className="text-center text-xs text-muted-foreground">
        {mode === 'login' ? (
          <>
            Don't have an account?{' '}
            <button type="button" className="underline" onClick={() => { setMode('signup'); setError(null); }}>Sign Up</button>
            <div className="mt-2">
              <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password?</Link>
            </div>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" className="underline" onClick={() => { setMode('login'); setError(null); }}>Login</button>
          </>
        )}
      </div>
    </form>
  );
};

export default AuthForm;