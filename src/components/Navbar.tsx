// File: src/components/Navbar.tsx
'use client';

import NextLink from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { AppBar, Toolbar, Typography, Box, IconButton, Button } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Navbar() {
  const {isSidebarOpen, toggleSidebar } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        height: '65px',
        // ✅ Proper frosted-glass effect
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)', // Safari support
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.drawer + 1, // ensure it's above sidebar
        isolation: 'isolate', // ✅ ensures the blur applies properly
      }}
    >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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

          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            <NextLink href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              AI First-Aid
            </NextLink>
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            component={NextLink}
            href="/hospitals"
            variant="contained"
            sx={{
              backgroundColor: 'action-green',
              '&:hover': { backgroundColor: 'green.700' },
              minWidth: { xs: 40, sm: 120 },
              px: { xs: 1.5, sm: 2 },
            }}
          >
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Find Hospital</Box>
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Hospital</Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
