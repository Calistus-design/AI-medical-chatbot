// src/app/auth/auth-code-error/page.tsx
import { Container, Typography, Paper } from '@mui/material';

export default function AuthErrorPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="error">Authentication Error</Typography>
        <Typography>
          The confirmation link is invalid or has expired. Please try signing up again.
        </Typography>
      </Paper>
    </Container>
  );
}