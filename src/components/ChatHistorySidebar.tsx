// File: src/components/ChatHistorySidebar.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Box, Button, List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress,
  IconButton, Menu, MenuItem, ListItemIcon, TextField, Divider
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import ProfileButton from './ProfileButton';
import LoginIcon from '@mui/icons-material/Login';

interface Conversation {
  id: string;
  title: string;
}

interface ChatHistorySidebarProps {
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  refreshConversations: (deletedId?: string) => void;
}

export default function ChatHistorySidebar({ onSelectChat, onNewChat, refreshConversations }: ChatHistorySidebarProps) {
  const { session, supabase, toggleSidebar } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [listMenuAnchorEl, setListMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConvoId, setSelectedConvoId] = useState<null | string>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingConvoId, setEditingConvoId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const chatToDeleteTitle = useMemo(() => {
    if (!selectedConvoId) return null;
    return conversations.find(c => c.id === selectedConvoId)?.title || null;
  }, [selectedConvoId, conversations]);

  const handleListMenuClick = (event: React.MouseEvent<HTMLElement>, convoId: string) => {
    event.stopPropagation();
    setListMenuAnchorEl(event.currentTarget);
    setSelectedConvoId(convoId);
  };
  const handleListMenuClose = () => setListMenuAnchorEl(null);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
    handleListMenuClose();
  };

  const handleConfirmDelete = async () => {
    if (!selectedConvoId) return;
    try {
      await fetch(`/api/conversations/${selectedConvoId}`, { method: 'DELETE' });
      refreshConversations(selectedConvoId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedConvoId(null);
    }
  };

  const handleRename = () => {
    if (!selectedConvoId) return;
    const convo = conversations.find(c => c.id === selectedConvoId);
    if (convo) {
      setEditingConvoId(selectedConvoId);
      setNewTitle(convo.title);
    }
    handleListMenuClose();
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => setNewTitle(event.target.value);
  const handleTitleBlur = () => setEditingConvoId(null);

  const handleTitleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!editingConvoId || !newTitle.trim()) return;
      try {
        await fetch(`/api/conversations/${editingConvoId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle.trim() }),
        });
        setConversations(prev =>
          prev.map(c => c.id === editingConvoId ? { ...c, title: newTitle.trim() } : c)
        );
      } catch (error) {
        console.error(error);
      } finally {
        setEditingConvoId(null);
      }
    } else if (event.key === 'Escape') {
      setEditingConvoId(null);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
    if (toggleSidebar) toggleSidebar();
  };

  const handleProfileMenuClick = (event: React.MouseEvent<HTMLElement>) => setProfileMenuAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileMenuAnchorEl(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    handleProfileMenuClose();
    router.push('/');
    router.refresh();
  };

  const navigateAndClose = (path: string) => {
    router.push(path);
    handleProfileMenuClose();
    if (toggleSidebar) toggleSidebar();
  };

  useEffect(() => {
    const fetchConversations = async () => {
      if (!session) {
        setConversations([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) throw new Error('Failed to fetch conversations');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [session, refreshConversations]);

  return (
    <>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
        {/* --- TOP SECTION (Always Visible) --- */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button variant="outlined" fullWidth startIcon={<AddCircleOutlineIcon />} onClick={onNewChat}>
            New Chat
          </Button>
        </Box>

        {/* --- MIDDLE SECTION (Conditional Content) --- */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {session ? (
            // Logged-in: Show chat history
            <>
              {isLoading ? (
                <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />
              ) : conversations.length === 0 ? (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>
                  No chat history.
                </Typography>
              ) : (
                <List>
                  {conversations.map((convo) => (
                    <ListItem key={convo.id} disablePadding sx={{ '&:hover .MuiIconButton-root': { opacity: 1 } }}
                      secondaryAction={editingConvoId !== convo.id ? (<IconButton edge="end" aria-label="options" onClick={(e) => handleListMenuClick(e, convo.id)} sx={{ opacity: 0, transition: 'opacity 0.2s' }}><MoreHorizIcon /></IconButton>) : null}
                    >
                      {editingConvoId === convo.id ? (
                        <TextField value={newTitle} onChange={handleTitleChange} onBlur={handleTitleBlur} onKeyDown={handleTitleKeyDown} autoFocus fullWidth variant="standard" sx={{ px: 2, py: 0.5 }} InputProps={{ disableUnderline: true, sx: { fontSize: '0.875rem' } }} />
                      ) : (
                        <ListItemButton onClick={() => onSelectChat(convo.id)}>
                          <ListItemText primary={convo.title} primaryTypographyProps={{ noWrap: true, sx: { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                        </ListItemButton>
                      )}
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          ) : (
            // Logged-out: Show "No History" message
            <Box sx={{ p: 2, textAlign: 'center', mt: 4 }}>
              <Typography sx={{ color: 'text.secondary' }}>
                No History
              </Typography>
            </Box>
          )}
        </Box>

        {/* --- BOTTOM SECTION (Conditional Button) --- */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          {session ? (
            <ProfileButton onClick={handleProfileMenuClick} />
          ) : (
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                startIcon={<LoginIcon />}
                onClick={handleLoginClick}
                fullWidth
              >
                Log In
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* --- MENUS & MODALS (for logged-in state) --- */}
      {session && (
        <>
          <Menu anchorEl={listMenuAnchorEl} open={Boolean(listMenuAnchorEl)} onClose={handleListMenuClose}>
            <MenuItem onClick={handleRename}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Rename</MenuItem>
            <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}><ListItemIcon sx={{ color: 'error.main' }}><DeleteForeverIcon fontSize="small" /></ListItemIcon>Delete</MenuItem>
          </Menu>

          <Menu anchorEl={profileMenuAnchorEl} open={Boolean(profileMenuAnchorEl)} onClose={handleProfileMenuClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} transformOrigin={{ vertical: 'bottom', horizontal: 'center' }} PaperProps={{ sx: { mb: 1, width: 240 } }}>
            <MenuItem onClick={() => navigateAndClose('/about')}><ListItemIcon><InfoOutlinedIcon fontSize="small" /></ListItemIcon>About</MenuItem>
            <MenuItem onClick={() => navigateAndClose('/hospitals')}><ListItemIcon><LocalHospitalOutlinedIcon fontSize="small" /></ListItemIcon>Find Hospital</MenuItem>
            <MenuItem onClick={() => navigateAndClose('/profile')}><ListItemIcon><AccountCircleOutlinedIcon fontSize="small" /></ListItemIcon>Profile</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" /></ListItemIcon>Log out</MenuItem>
          </Menu>

          <ConfirmDeleteModal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} chatTitle={chatToDeleteTitle} />
        </>
      )}
    </>
  );
}