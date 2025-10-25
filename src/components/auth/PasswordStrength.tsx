// File: src/components/auth/PasswordStrength.tsx

import { Box, LinearProgress, Typography } from '@mui/material';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthProps {
  password?: string;
}

export default function PasswordStrength({ password = '' }: PasswordStrengthProps) {
  const result = zxcvbn(password);
  // The score ranges from 0 (terrible) to 4 (excellent)
  const score = result.score; 

  const getStrengthLabel = () => {
    switch (score) {
      case 0:
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getStrengthColor = () => {
    switch (score) {
      case 0:
      case 1:
        return 'error'; // Red
      case 2:
        return 'warning'; // Orange
      case 3:
        return 'info'; // Blue
      case 4:
        return 'success'; // Green
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(score / 4) * 100}
        color={getStrengthColor()}
      />
      <Typography variant="caption" sx={{ color: `${getStrengthColor()}.main` }}>
        {password && getStrengthLabel()}
      </Typography>
    </Box>
  );
}