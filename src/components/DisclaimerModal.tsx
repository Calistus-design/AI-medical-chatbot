// File: src/components/DisclaimerModal.tsx

'use client';

import { Modal, Box, Typography, Button } from '@mui/material';

// Define the props our component accepts
interface DisclaimerModalProps {
  open: boolean;
  onClose: () => void;
}

// This is the standard style object for an MUI modal
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
} as const;

export default function DisclaimerModal({ open, onClose }: DisclaimerModalProps) {
  return (
    <Modal
      open={open}
      aria-labelledby="disclaimer-title"
      aria-describedby="disclaimer-description"
    >
      <Box sx={style}>
        <Typography id="disclaimer-title" variant="h6" component="h2">
          Medical Disclaimer
        </Typography>
        <Typography id="disclaimer-description" sx={{ mt: 2 }}>
          This is an AI assistant. The information provided is for educational
          purposes only and is not a substitute for professional medical advice,
          diagnosis, or treatment. Always seek the advice of your physician.
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <b>For medical emergencies, call your local emergency number immediately.</b>
        </Typography>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button variant="contained" onClick={onClose}>
            I Understand
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

