// File: src/components/ChatHistorySidebar.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Button, List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, 
    IconButton, Menu, MenuItem, ListItemIcon, TextField } from '@mui/material';
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

  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
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
    console.log('DEBUG: Step 1 - handleDeleteClick triggered. Opening modal for convo:', selectedConvoId); 
    setIsDeleteModalOpen(true); // This opens the confirmation modal
    setAnchorEl(null);         // This closes the small popover menu
  };

  // In src/components/ChatHistorySidebar.tsx

const handleConfirmDelete = async () => {
  console.log('DEBUG: Step 2 - handleConfirmDelete triggered for convo:', selectedConvoId); // <-- ADD THIS LINE
  if (!selectedConvoId) return;

  try {
    console.log('DEBUG: Step 3 - Calling fetch DELETE to /api/conversations/' + selectedConvoId); // <-- ADD THIS LINE
    const response = await fetch(`/api/conversations/${selectedConvoId}`, { method: 'DELETE' });

    console.log('DEBUG: Step 4 - API Response Status:', response.status); // <-- ADD THIS LINE

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DEBUG: API Error Response:', errorData); // <-- ADD THIS LINE
      throw new Error('Failed to delete.');
    }

    refreshConversations(selectedConvoId);
  } catch (error) {
    console.error('DEBUG: Error in handleConfirmDelete catch block:', error); // <-- ADD THIS LINE
  } finally {
    setIsDeleteModalOpen(false);
    setSelectedConvoId(null);
  }
};

  // FIND and REPLACE the existing handleRename function:
  const handleRename = () => {
   if (!selectedConvoId) return;
    const conversationToEdit = conversations.find(c => c.id === selectedConvoId);
    if (conversationToEdit) {
      setEditingConvoId(selectedConvoId);
      setNewTitle(conversationToEdit.title); // Pre-fill the input with the current title
    }
    handleMenuClose();
  };

  // ADD these new functions anywhere inside the ChatHistorySidebar component

const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  setNewTitle(event.target.value);
};

const handleTitleBlur = () => {
  // When the input field loses focus (user clicks away), cancel the edit.
  setEditingConvoId(null);
  setNewTitle('');
};

const handleTitleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Enter') {
    if (!editingConvoId || !newTitle.trim()) return;

    try {
      const response = await fetch(`/api/conversations/${editingConvoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!response.ok) throw new Error('Failed to rename conversation.');
      
      // Update the title in our local state for an instant UI update
      setConversations(prev => 
        prev.map(c => c.id === editingConvoId ? { ...c, title: newTitle.trim() } : c)
      );

    } catch (error) {
      console.error(error);
    } finally {
      setEditingConvoId(null); // Exit editing mode
      setNewTitle('');
    }
  } else if (event.key === 'Escape') {
    // Also allow canceling with the Escape key
    setEditingConvoId(null);
    setNewTitle('');
  }
};
  
  // This useEffect fetches the conversations from the API
  useEffect(() => {
  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) {
        // Log the actual error from the server
        const errorText = await response.text();
        console.error("Failed to fetch conversations:", response.status, errorText);
        throw new Error(`Failed to fetch. Status: ${response.status}`);
      }
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
}, [session]); // <-- REMOVE refreshConversations

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
      // Prevent showing menu for the item currently being edited
      editingConvoId !== convo.id ? (
        <IconButton
          edge="end"
          aria-label="options"
          onClick={(e) => handleMenuClick(e, convo.id)}
          sx={{ opacity: 0, transition: 'opacity 0.2s ease-in-out' }}
        >
          <MoreHorizIcon />
        </IconButton>
      ) : null
    }
  >
    {/* --- THIS IS THE CONDITIONAL LOGIC --- */}
    {editingConvoId === convo.id ? (
      // If this item is being edited, show the input field
      <TextField
        value={newTitle}
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        onKeyDown={handleTitleKeyDown}
        autoFocus
        fullWidth
        variant="standard"
        sx={{ px: 2, py: 0.5 }} // Padding to align with ListItemButton
        InputProps={{ disableUnderline: true, sx: { fontSize: '0.875rem' } }} // Cleaner look & matches text size
      />
    ) : (
      // Otherwise, show the normal button with the title
      <ListItemButton onClick={() => onSelectChat(convo.id)}>
        <ListItemText
          primary={convo.title}
          primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }}
        />
      </ListItemButton>
    )}
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