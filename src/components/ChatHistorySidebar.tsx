// File: src/components/ChatHistorySidebar.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, IconButton, Menu, MenuItem, ListItemIcon } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import ConfirmDeleteModal from './ConfirmDeleteModal'; // Import the modal

interface Conversation {
  id: string;
  title: string;
}

interface ChatHistorySidebarProps {
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  refreshConversations: (deletedId?: string) => void; // <-- Note the change here
}

export default function ChatHistorySidebar({ onSelectChat, onNewChat, refreshConversations }: ChatHistorySidebarProps) {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<null | string>(null);
  const isMenuOpen = Boolean(anchorEl);

  // --- State for the Confirmation Modal ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const chatToDeleteTitle = useMemo(() => {
    if (!selectedConvoId) return null;
    return conversations.find(c => c.id === selectedConvoId)?.title || null;
  }, [selectedConvoId, conversations]);

  // --- Menu Handlers ---
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, convoId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedConvoId(convoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null); 
  };

  // --- Action Handlers ---
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true); // This opens the confirmation modal
    setAnchorEl(null);         // This closes the small popover menu
  };

  const handleConfirmDelete = async () => {
  if (!selectedConvoId) return;
  try {
    await fetch(`/api/conversations/${selectedConvoId}`, { method: 'DELETE' });
    refreshConversations(selectedConvoId); // <-- PASS THE DELETED ID HERE
  } catch (error) {
    console.error(error);
  } finally {
    setIsDeleteModalOpen(false);
    setSelectedConvoId(null);
  }
};
  
  const handleRename = () => {
    console.log("Renaming conversation:", selectedConvoId);
    handleMenuClose();
  };
  
  // This useEffect fetches the conversations from the API
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations.');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [session, refreshConversations]);

  if (!session) return null;

  return (
    <>
      <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" fullWidth startIcon={<AddCircleOutlineIcon />} onClick={onNewChat}>
            New Chat
          </Button>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />
          ) : conversations.length === 0 ? (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
              No chat history.
            </Typography>
          ) : (
            <List>
              {conversations.map((convo) => (
                <ListItem
                  key={convo.id}
                  disablePadding
                  sx={{ '&:hover .MuiIconButton-root': { opacity: 1 } }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="options"
                      onClick={(e) => handleMenuClick(e, convo.id)}
                      sx={{ opacity: 0, transition: 'opacity 0.2s ease-in-out' }}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                  }
                >
                  <ListItemButton onClick={() => onSelectChat(convo.id)}>
                    <ListItemText primary={convo.title} primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
          <MenuItem onClick={handleRename}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Rename
          </MenuItem>
          <MenuItem 
            onClick={handleDeleteClick} // This now opens the modal
            sx={{ color: 'error.main', '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.08)' } }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <DeleteForeverIcon fontSize="small" />
            </ListItemIcon>
            Delete
          </MenuItem>
        </Menu>
      </Box>

      <ConfirmDeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        chatTitle={chatToDeleteTitle}
      />
    </>
  );
}