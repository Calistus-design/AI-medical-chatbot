// File: src/app/reset-password/page.tsx

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button, TextField, Container, Typography, Box, Alert, IconButton, InputAdornment } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function ResetPasswordPage() {
  const supabase = createClient();  
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for eye icon
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for second eye icon

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    // You could add password strength validation here as well
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/'), 3000);
    }
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Create a New Password
      </Typography>
      {success ? (
        <Alert severity="success">Password updated successfully! Redirecting...</Alert>
      ) : (
        <Box component="form" onSubmit={handlePasswordUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            variant="outlined" // Use outlined variant
            required
            fullWidth
            name="password"
            label="New Password"
            placeholder="Enter your new password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: ( <InputAdornment position="start"> <LockOutlinedIcon /> </InputAdornment> ),
              endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => setShowPassword(!showPassword)} edge="end"> {showPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
            }}
            sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
          />
          <TextField
            variant="outlined" // Use outlined variant
            required
            fullWidth
            name="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: ( <InputAdornment position="start"> <LockOutlinedIcon /> </InputAdornment> ),
              endAdornment: ( <InputAdornment position="end"> <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end"> {showConfirmPassword ? <VisibilityOff /> : <Visibility />} </IconButton> </InputAdornment> ),
            }}
            sx={{ '& input::-ms-reveal': { display: 'none' }, '& input::-webkit-reveal': { display: 'none' } }}
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, py: 1.5, backgroundColor: 'action-green' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      )}
    </Container>
  );
}