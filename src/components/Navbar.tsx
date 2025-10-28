// File: src/components/Navbar.tsx
'use client';

import { useState } from 'react'; // <-- ADDED 'useState' HERE
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close'; 

export default function Navbar() {
  const { session, supabase, isSidebarOpen, toggleSidebar } = useAuth(); // Removed isSidebarOpen, not needed here
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleClose();
    router.push('/');
    router.refresh();
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
                open={Boolean(anchorEl)} // <-- ADDED THIS 'open' PROP
                onClose={handleClose}
              >
                <MenuItem component={NextLink} href="/profile" onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          ) : (
            <Button component={NextLink} href="/login" variant="outlined">Log In</Button>
          )}
        </Box>
        {/* You may want to add a mobile menu here for non-auth pages if needed */}
      </Toolbar>
    </AppBar>
  );
}