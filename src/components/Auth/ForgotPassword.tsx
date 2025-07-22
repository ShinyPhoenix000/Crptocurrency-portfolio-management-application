import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      await resetPassword(email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for further instructions.',
      });
      setMessage('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      // Handle specific Firebase error codes
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      
      setMessage(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-card rounded-lg shadow-md border border-border">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-sm text-center text-muted-foreground mb-4">
          Enter your email address and we'll send you instructions to reset your password.
        </div>
        
        {message && (
          <div className={`text-sm text-center ${message.includes('sent') ? 'text-green-500' : 'text-destructive'}`}>
            {message}
          </div>
        )}
        
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Reset Password'}
        </Button>
        
        <div className="text-center text-sm mt-4">
          <a href="#" onClick={() => window.history.back()} className="text-primary hover:underline">
            Back to Login
          </a>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;