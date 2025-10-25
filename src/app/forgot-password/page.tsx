// File: src/app/forgot-password/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';

export default function ForgotPasswordPage() {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Forgot Password
      </Typography>
      
      {success ? (
        <Alert severity="success">
          Password reset link has been sent! Please check your email.
        </Alert>
      ) : (
        <Box component="form" onSubmit={handlePasswordReset}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" align="center" sx={{ mb: 2 }}>
            Enter your email address and we will send you a link to reset your password.
          </Typography>
          <TextField
            variant ="outlined"
            required
            fullWidth
            id="email"
            label="Email Address"
            placeholder="Enter your email address" 
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </Box>
      )}
    </Container>
  );
}