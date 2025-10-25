// File: src/app/profile/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Container, Typography, Paper, Box, CircularProgress } from '@mui/material';

export default function ProfilePage() {
  const { session } = useAuth();
  const router = useRouter();

  // This effect will run when the session state changes.
  useEffect(() => {
    // If the session is loaded and is null, it means the user is not logged in.
    // Redirect them to the login page.
    if (session === null) {
      router.push('/login');
    }
  }, [session, router]);

  // While the session is loading, show a spinner.
  if (session === undefined || session === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If the session is loaded and the user is logged in, show their info.
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Profile
        </Typography>
        <Typography variant="body1">
          <strong>Email:</strong> {session.user?.email}
        </Typography>
        <Typography variant="body1">
          <strong>User ID:</strong> {session.user?.id}
        </Typography>
        {/* We can add more profile information here in the future */}
      </Paper>
    </Container>
  );
}