// File: src/components/Footer.tsx

'use client';

import { Box, Typography, Container, Link } from '@mui/material';

// We need to use the Next.js Link component for client-side navigation
// and pass it to MUI's Link component for styling.
import NextLink from 'next/link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // Increased padding for a better look
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          {'© '}
          {new Date().getFullYear()}
          {' Calistus-design\'s Org. All rights reserved.'}
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link component={NextLink} href="/privacy" color="inherit" sx={{ mx: 1.5 }}>
            Privacy Policy
          </Link>
          |
          <Link component={NextLink} href="/terms" color="inherit" sx={{ mx: 1.5 }}>
            Terms of Service
          </Link>
          |
          <Link component={NextLink} href="/contact" color="inherit" sx={{ mx: 1.5 }}>
            Contact Us
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}