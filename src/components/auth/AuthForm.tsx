// File: src/components/auth/AuthForm.tsx

'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation'; // NEW: For redirecting
import { useAuth } from '@/context/AuthContext'; // NEW: Our auth "brain"
import { Button, TextField, Box, Typography, Divider, IconButton, InputAdornment, FormControlLabel, Checkbox, Link, Alert } from '@mui/material';
import GoogleLogo from './GoogleLogo';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PasswordStrength from './PasswordStrength';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  // NEW: State for form fields, errors, and loading status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false); // For the checkbox

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // NEW: Get Supabase client and router
  const { supabase } = useAuth();
  const router = useRouter();

  // NEW: Function to handle Email/Password login and sign-up
  // Inside src/components/auth/AuthForm.tsx

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !agreedToTerms) {
      setError("You must agree to the Terms of Use and Privacy Policy.");
      return;
    }
    setError(null);
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      // --- THIS IS THE CORRECTED LOGIC ---
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // This tells Supabase where to send the user after they click the confirmation link.
           emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      
      if (error) {
        setError(error.message);
      } else {
        // We DO NOT redirect. Instead, we show the success message.
        setShowSuccessMessage(true);
      }
      // --- END OF CORRECTED LOGIC ---

    } else { // Login mode remains the same
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
        router.refresh();
      }
    }
    setLoading(false);
  };

  // NEW: Function to handle Google login
  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // PASTE THIS ENTIRE BLOCK into AuthForm.tsx

  return (
    <Box
      component="form"
      onSubmit={handleEmailAuth}
      sx={{
        width: '100%',
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
      }}
    >
      {error && <Alert severity="error">{error}</Alert>}
      
      {/* --- THIS IS THE CORRECTED LOGIC --- */}
      {showSuccessMessage ? (
        <Alert severity="success">
          Account created! Please check your email for a confirmation link to complete your registration.
        </Alert>
      ) : (
        // This fragment <>...</> wraps the entire form.
        <>
          {/* Your "Please fill in" message can go here if you still want it */}
          {!error && mode === 'signup' && (
             <Alert severity="info" sx={{ mb: 1 }}>
               Please fill in the form to create an account.
             </Alert>
          )}

          <TextField
            label="Email address"
            placeholder="Enter your email"
            type="email"
            variant="outlined"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: ( <InputAdornment position="start"> <EmailOutlinedIcon /> </InputAdornment> ),
            }}
          />
          
          {/* This logic correctly handles showing password field for both modes */}
          {mode === 'signup' ? (
            <>
              <TextField
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: ( <InputAdornment position="start"> <LockOutlinedIcon /> </InputAdornment> ),
                  endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
                }}
                sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
              />
              {password && <PasswordStrength password={password} />}
            </>
          ) : (
            <TextField
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: ( <InputAdornment position="start"> <LockOutlinedIcon /> </InputAdornment> ),
                endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
              }}
              sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
            />
          )}

          {mode === 'signup' && (
            <>
              <TextField
                label="Confirm password"
                placeholder="Confirm your password"
                type={showConfirmPassword ? 'text' : 'password'}
                variant="outlined"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: ( <InputAdornment position="start"> <LockOutlinedIcon /> </InputAdornment> ),
                  endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end"> {showConfirmPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
                }}
                sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
              />
              <FormControlLabel
                control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required />}
                label={
                  <Typography variant="body2">
                    I agree to the 
                    <Link component={NextLink} href="/terms" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {' '}Terms of Use
                    </Link> and
                    <Link component={NextLink} href="/privacy" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                      {' '}Privacy Policy
                    </Link>.
                  </Typography>
                }
                sx={{ mt: 1 }}
              />
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.5,
              backgroundColor: 'action-green',
              '&:hover': { backgroundColor: 'green.700' }
            }}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </Button>
          
          {mode === 'login' ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1 }}>
              <Typography variant="body2">
                <Link component={NextLink} href="/forgot-password" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Forgot password?
                </Link>
              </Typography>
              <Typography variant="body2">
                <Link component={NextLink} href="/signup" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Sign up
                </Link>
              </Typography>
            </Box>
          ) : (
            <Typography align="center" variant="body2" sx={{ mt: 1 }}>
              Already have an account? <Link component={NextLink} href="/login" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                  Log in
                </Link>
            </Typography>
          )}

          <Divider sx={{ my: 1 }}>OR</Divider>

          <Button
            variant="outlined"
            startIcon={<GoogleLogo />}
            size="large"
            onClick={handleGoogleAuth}
            disabled={loading}
            sx={{ py: 1.5, color: 'action-green', borderColor: 'action-green' }}
          >
            Continue with Google
          </Button>
        </>
      )}
    </Box>
  );
}