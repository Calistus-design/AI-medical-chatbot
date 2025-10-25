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
          fontSize: '6rem', // Large icon size
          color: 'action-green',
          opacity: 0.8, // Slightly transparent for a softer look
          mb: 2,
        }}
      />
      <Typography
        variant="h2"
        component="h1"
        sx={{ fontWeight: 'bold', color: 'dark-text' }}
      >
        AI First-Aid Assistant
      </Typography>
      <Typography variant="body1" sx={{ color: 'grey.600', mt: 1 }}>
        Describe the situation or ask a question to get started.
      </Typography>
    </Box>
  );
}