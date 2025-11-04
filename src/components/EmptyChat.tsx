// File: src/components/EmptyChat.tsx

import { Box, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function EmptyChat() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        //justifyContent: 'flex-end',
        //height: '100%',
        textAlign: 'center',
        //pb: 4,
      }}
    >
      <LocalHospitalIcon
        sx={{
          fontSize: { xs: '2.5rem', sm: '6rem' }, // Large icon size
          color: 'action-green',
          opacity: 0.8, // Slightly transparent for a softer look
          mb: 2,
        }}
      />
      <Typography
        variant="h2"
        component="h1"
        sx={{
  fontWeight: 'bold',
  color: 'dark-text',
  // Add this line
  fontSize: { xs: '1.5rem', sm: '3.75rem' } // smaller on mobile, larger on desktop
}}
      >
        AI First-Aid Assistant
      </Typography>
      <Typography 
      variant="body1" 
      sx={{ color: 'grey.600',
        mt: 1, 
        fontSize: { xs: '1.0 rem', sm: '1.55rem' }
         }}
         >
        Describe the situation or ask a question to get started.
      </Typography>
    </Box>
  );
}