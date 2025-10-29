// File: src/components/ConfirmDeleteModal.tsx

'use client';

import { Modal, Box, Typography, Button } from '@mui/material';

// Define the props our component accepts
interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle: string | null;
}

// Standard style object for an MUI modal
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 5, // Softer corners
  boxShadow: 24,
  p: 4,
} as const;

export default function ConfirmDeleteModal({ open, onClose, onConfirm, chatTitle }: ConfirmDeleteModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Delete chat?
        </Typography>
        <Typography sx={{ mt: 2 }}>
          This will delete{' '}
          <Typography component="span" fontWeight="bold">
            {chatTitle || 'this chat'}
          </Typography>
          .
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: '999px', px: 2 }}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={onConfirm} sx={{ borderRadius: '999px', px: 2 }}>
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}