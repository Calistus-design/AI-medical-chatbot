// File: src/components/Navbar.tsx

'use client';

import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AppBar, Toolbar, Typography, Box, IconButton, Button } from '@mui/material'; // <-- Step 1 Change
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Navbar() {
  const { session, isSidebarOpen, toggleSidebar } = useAuth();

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', height: '65px' }}>
      <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        
        
        <LocalHospitalIcon sx={{ mr: 2, color: 'action-green', fontSize: '2rem' }} />
        
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          <NextLink href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            AI First-Aid
          </NextLink>
        </Typography>

        {/* --- Step 2 Change --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* This button is always visible */}
          <Button
            component={NextLink}
            href="/hospitals"
            variant="contained"
            sx={{
              backgroundColor: 'action-green',
              '&:hover': { backgroundColor: 'green.700' },
              minWidth: { xs: 40, sm: 120 }, // optional: compact on mobile
              px: { xs: 1.5, sm: 2 },       // adjust padding
            }}
          >
            {/* Desktop text */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Find Hospital</Box>

            {/* Mobile icon */}
            {/*<LocalHospitalIcon sx={{ display: { xs: 'block', sm: 'none' } }} />*/}
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Hospital</Box>
          </Button>

          {/* This button only appears if the user is NOT logged in */}
          {!session && (
            <Button component={NextLink} href="/login" variant="outlined">
              Log In
            </Button>
          )}
        </Box>
        
      </Toolbar>
    </AppBar>
  );
}