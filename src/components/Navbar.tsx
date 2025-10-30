// File: src/components/Navbar.tsx

'use client';

import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Navbar() {
  const { session, supabase, isSidebarOpen, toggleSidebar } = useAuth();
  const router = useRouter();

  // --- 1. State for the DESKTOP profile menu (already exists) ---
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // --- 2. State for the NEW MOBILE navigation menu ---
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);

  // --- Handlers for DESKTOP profile menu (already exists) ---
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // --- Handlers for NEW MOBILE navigation menu ---
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleClose(); // Closes desktop menu
    handleMobileMenuClose(); // Closes mobile menu
    router.push('/');
    router.refresh();
  };

  const navigateAndCloseMenus = (path: string) => {
    router.push(path);
    handleClose();
    handleMobileMenuClose();
  };

  return (
    <AppBar position="sticky" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', height: '65px' }}>
      <Toolbar>
        {session && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        )}
        <LocalHospitalIcon sx={{ mr: 2, color: 'action-green', fontSize: '2rem' }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          <NextLink href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            AI First-Aid
          </NextLink>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />

        {/* --- 3. DESKTOP Navigation Links (already exists, no change) --- */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
          <Button component={NextLink} href="/" color="inherit">Home</Button>
          <Button component={NextLink} href="/about" color="inherit">About</Button>
          <Button component={NextLink} href="/hospitals" variant="contained" sx={{ backgroundColor: 'action-green', '&:hover':{backgroundColor:'green.700'}, mx: 2 }}>
            Find Hospital
          </Button>
          {session ? (
            <div>
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar alt={session.user?.email || ''} src={session.user?.user_metadata?.avatar_url} />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => navigateAndCloseMenus('/profile')}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Button component={NextLink} href="/login" variant="outlined">Log In</Button>
          )}
        </Box>
        
        {/* --- 4. NEW Mobile Menu Icon (Hamburger) --- */}
        {/* This Box is visible ONLY on mobile screens */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
                size="large"
                aria-label="show more"
                aria-controls="mobile-menu"
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
            >
                <MenuIcon />
            </IconButton>
        </Box>
      </Toolbar>

      {/* --- 5. NEW Mobile Menu Dropdown --- */}
      <Menu
        id="mobile-menu"
        anchorEl={mobileMenuAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={handleMobileMenuClose}
        // Apply styling to make it look good on mobile
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <MenuItem onClick={() => navigateAndCloseMenus('/')}>Home</MenuItem>
        <MenuItem onClick={() => navigateAndCloseMenus('/about')}>About</MenuItem>
        <MenuItem onClick={() => navigateAndCloseMenus('/hospitals')}>Find Hospital</MenuItem>
        
        {/* Conditional rendering for login/logout just like on desktop */}
        {session ? (
          <div>
            <MenuItem onClick={() => navigateAndCloseMenus('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </div>
        ) : (
          <MenuItem onClick={() => navigateAndCloseMenus('/login')}>Log In</MenuItem>
        )}
      </Menu>
    </AppBar>
  );
}