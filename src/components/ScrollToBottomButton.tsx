// File: src/components/ScrollToBottomButton.tsx

'use client';

import { IconButton, Fade } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ScrollToBottomButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function ScrollToBottomButton({ isVisible, onClick }: ScrollToBottomButtonProps) {
  return (
    <Fade in={isVisible}>
      <IconButton
        onClick={onClick}
        sx={{
          position: 'absolute',
          bottom: '16px', // Position it just above the input area
          right: '50%',   // Start at the center
          transform: 'translateX(50%)', // Exactly center it
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: 'grey.100',
          },
        }}
        aria-label="scroll to bottom"
      >
        <KeyboardArrowDownIcon />
      </IconButton>
    </Fade>
  );
}