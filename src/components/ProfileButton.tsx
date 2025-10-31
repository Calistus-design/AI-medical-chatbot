// File: src/components/ProfileButton.tsx

'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, Box, Typography, IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface ProfileButtonProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function ProfileButton({ onClick }: ProfileButtonProps) {
  const { session } = useAuth();

  if (!session) return null;

  // Function to get initials from email
  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
        transition: 'background-color 0.2s',
      }}
    >
      <Avatar 
        src={session.user?.user_metadata?.avatar_url}
        sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'action-green' }}
      >
        {getInitials(session.user?.email)}
      </Avatar>
      <Typography 
        variant="body2" 
        sx={{
          flexGrow: 1,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {session.user?.email}
      </Typography>
      <IconButton size="small" sx={{ ml: 1 }}>
          <MoreHorizIcon />
      </IconButton>
    </Box>
  );
}