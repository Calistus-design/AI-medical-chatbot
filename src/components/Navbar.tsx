// File: src/components/Navbar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MenuIcon from '@mui/icons-material/Menu'; // The "hamburger" icon

export default function Navbar() {
  // State to manage whether the mobile drawer is open or closed
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  // This is the content of our slide-out drawer menu
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Menu
      </Typography>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/">
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="/about">
            <ListItemText primary="About" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <LocalHospitalIcon sx={{ mr: 2, color: 'action-green', fontSize: '2rem' }} /> {/* Increased size */}
          <Typography
            variant="h5" // Changed from h6 to h5
            component="div"
            sx={{ flexGrow: 1, color: 'dark-text', fontWeight: 'bold' }}
          >
            AI First-Aid
          </Typography>

          {/* This is the hamburger icon. It only appears on small screens ('xs') */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }} // Hide on medium screens and up
          >
            <MenuIcon />
          </IconButton>

          {/* This Box contains the links that appear on large screens */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}> {/* Hide on extra-small screens */}
            <Button color="inherit" component={Link} href="/">Home</Button>
            <Button color="inherit" component={Link} href="/about">About</Button>
            <Button
              variant="contained"
              color="success"
              component={Link}
              href="/hospitals"
              sx={{
                ml: 2,
                backgroundColor: 'action-green',
                '&:hover': { backgroundColor: 'green.700' },
              }}
            >
              Find Hospital
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* This is the Drawer component that slides out */}
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Better for mobile performance
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
}