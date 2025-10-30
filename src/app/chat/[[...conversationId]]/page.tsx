// File: src/app/chat/page.tsx
'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Box, Drawer } from '@mui/material';

// Custom components
import ChatInput from '@/components/ChatInput';
import MessageBubble, { Message } from '@/components/MessageBubble';
import DisclaimerModal from '@/components/DisclaimerModal';
import TypingIndicator from '@/components/TypingIndicator';
import EmptyChat from '@/components/EmptyChat';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import EmergencyButton from '@/components/EmergencyButton';

const DRAWER_WIDTH = 280;

export default function ChatPage() {
  const { session, isSidebarOpen, toggleSidebar } = useAuth();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isManuallyUpdating, setIsManuallyUpdating] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const userMessagesCount = messages.filter((m) => m.role === 'user').length;

  // ─── Auto-scroll on new user message ─────────────────────────────
  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [userMessagesCount]);

  // ─── Smooth scroll when typing ──────────────────────────────────
  useEffect(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    if (scrollHeight - scrollTop - clientHeight < 20)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages, isTyping]);

  // ─── Disclaimer modal once per session ───────────────────────────
  useEffect(() => {
    const seen = sessionStorage.getItem('disclaimerAcknowledged');
    if (!seen) setModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    sessionStorage.setItem('disclaimerAcknowledged', 'true');
    setModalOpen(false);
  };

  // ─── Send message handler ────────────────────────────────────────
  const handleSendMessage = async (text: string) => {
    const newUserMessage: Message = { id: Date.now(), content: text, role: 'user' };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsTyping(true);
    setIsManuallyUpdating(true);

    let conversationIdToUpdate = activeConversationId;

    try {
      // 1️⃣ Create conversation if none
      if (!conversationIdToUpdate) {
        const title = text.split(' ').slice(0, 5).join(' ') + '...';
        const convRes = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        });
        if (!convRes.ok) throw new Error('Failed to create conversation.');
        const newConv = await convRes.json();
        conversationIdToUpdate = newConv.id;
        setActiveConversationId(conversationIdToUpdate);
      }

      // 2️⃣ Save user message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationIdToUpdate,
          content: text,
          role: 'user',
        }),
      });

      // 3️⃣ Prepare message history
      const history = [...messages, newUserMessage].slice(-6).map((m) => ({
        role: m.role,
        content: typeof m.content === 'string' ? m.content : 'UI element',
      }));

      // 4️⃣ Ask AI
      const aiRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      if (!aiRes.ok) throw new Error('AI failed');
      const aiData = await aiRes.json();
      const fullText = aiData.answer || '';
      const showModal = aiData.show_hospital_modal;
      setIsTyping(false);

      // 5️⃣ Save AI message
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationIdToUpdate,
          content: fullText,
          role: 'assistant',
        }),
      });

      // 6️⃣ Stream animation
      const assistantId = Date.now() + 1;
      setMessages((prev) => [...prev, { id: assistantId, content: '', role: 'assistant' }]);
      if (streamRef.current) clearInterval(streamRef.current);
      let idx = 0;
      streamRef.current = setInterval(() => {
        if (idx >= fullText.length) {
          clearInterval(streamRef.current!);

          if (showModal)
            setMessages((prev) => [
              ...prev,
              { id: Date.now() + 2, content: <EmergencyButton />, role: 'assistant' },
            ]);

          handleRefreshConversations();
          setIsManuallyUpdating(false);
          return;
        }
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fullText.substring(0, idx + 1) }
              : m
          )
        );
        idx++;
      }, 5);
    } catch (err) {
      console.error('SendMessage error:', err);
      setIsTyping(false);
      setIsManuallyUpdating(false);
    }
  };

  // ─── Select chat from sidebar ────────────────────────────────────
  const handleSelectChat = async (id: string) => {
    setIsTyping(true);
    setIsManuallyUpdating(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      const formatted = data.map((m: any, i: number) => ({
        id: Date.now() + i,
        role: m.role,
        content: m.content,
      }));
      setMessages(formatted);
      setActiveConversationId(id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
      setIsManuallyUpdating(false);
      if (isSidebarOpen) toggleSidebar();
    }
  };

  // ─── New chat ───────────────────────────────────────────────────
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setIsTyping(false);
    if (isSidebarOpen) toggleSidebar();
  };

  // ─── Refresh sidebar ────────────────────────────────────────────
  const handleRefreshConversations = (deletedId?: string) => {
    setRefreshKey((p) => p + 1);
    if (activeConversationId === deletedId) setActiveConversationId(null);
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
      <DisclaimerModal open={modalOpen} onClose={handleCloseModal} />

      {session && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={isSidebarOpen}
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: '65px',
              height: 'calc(100% - 65px)',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
        >
          <ChatHistorySidebar
            key={refreshKey}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            refreshConversations={handleRefreshConversations}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: `-${DRAWER_WIDTH}px`,
          ...(isSidebarOpen &&
            session && {
              marginLeft: 0,
            }),
        }}
      >
        <div className="flex flex-col h-full max-w-4xl mx-auto flex-1 w-full">
          {messages.length === 0 && !isTyping ? (
            <div className="flex-1 flex flex-col justify-center items-center p-4">
              <EmptyChat />
              <div className="mt-8 w-full">
                <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
              </div>
            </div>
          ) : (
            <>
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isTyping && <TypingIndicator />}
              </div>
              <div className="p-4 bg-white border-t">
                <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
              </div>
            </>
          )}
        </div>
      </Box>
    </Box>
  );
}
