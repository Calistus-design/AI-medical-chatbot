// File: src/app/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

// This is now a simple component that redirects the user.
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // We use router.replace so that the user cannot click the "back" button
    // to get to this empty redirecting page.
    router.replace('/chat');
  }, [router]);

  // While the redirect is happening, we can show a simple loading state.
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 65px)',
      }}
    >
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>Loading Assistant...</Typography>
    </Box>
  );
}