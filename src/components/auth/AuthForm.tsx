// File: src/components/auth/AuthForm.tsx

'use client';
import NextLink from 'next/link';
import { useState } from 'react';
//import Link from 'next/link';
import { Button, TextField, Box, Typography, Divider, IconButton, InputAdornment, FormControlLabel, Checkbox, Link } from '@mui/material';
import GoogleLogo from './GoogleLogo'; // We need this new component
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <Box
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
      <TextField
        label="Email address"
        placeholder="Enter your email"
        type="email"
        variant="outlined"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon />
            </InputAdornment>
          ),
        }}
      />
      <TextField
        label="Password"
        placeholder="Enter your password"
        type={showPassword ? 'text' : 'password'}
        variant="outlined"
        required
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
      />
      
      {mode === 'signup' && (
        <>
          <TextField
            label="Confirm password"
            placeholder="Confirm your password"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
          />
          <FormControlLabel
            control={<Checkbox value="agree" color="primary" />}
            label={
              <Typography variant="body2">
                I agree to the 
                <Link component={NextLink} href="/forgot-password" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Terms of Use
            </Link> and
                <Link component={NextLink} href="/forgot-password" sx={{ color: 'action-green', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Privacy Policy
            </Link>.
              </Typography>
            }
            sx={{ mt: 1 }}
          />
        </>
      )}

      <Button
        variant="contained"
        size="large"
        sx={{
          mt: 1,
          py: 1.5,
          backgroundColor: 'action-green',
          '&:hover': { backgroundColor: 'green.700' }
        }}
      >
        {mode === 'login' ? 'Log In' : 'Sign Up'}
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
        sx={{ py: 1.5, color: 'action-green', borderColor: 'action-green' }}
      >
        Continue with Google
      </Button>
    </Box>
  );
}

