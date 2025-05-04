 // src/components/AdminHelperChatbot.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  Paper,
  Typography,
  TextField,
  Button,
  Stack
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import axios from '../api/axiosInstance';

export default function AdminHelperChatbot({
  openOnMount = false,
  proactiveMessage = ''
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // { sender, text }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-open on mount if requested
  useEffect(() => {
    if (openOnMount) {
      setOpen(true);
      if (proactiveMessage) {
        sendMessage(proactiveMessage, 'bot');
      }
    }
  }, [openOnMount, proactiveMessage]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const toggleOpen = () => setOpen((o) => !o);

  // sendMessage: add to UI and optionally call backend
  const sendMessage = async (text, initialSender = 'admin') => {
    setMessages((prev) => [...prev, { sender: initialSender, text }]);
    if (initialSender === 'admin') {
      // only call backend for admin-typed messages
      setLoading(true);
      try {
        const res = await axios.post('/admin/chatbot', { prompt: text });
        const botText = res.data.response;
        setMessages((prev) => [...prev, { sender: 'bot', text: botText }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Oops, could not fetch a response.' }
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input, 'admin');
      setInput('');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1300
      }}
    >
      {open ? (
        <Paper
          elevation={4}
          sx={{
            width: 300,
            height: 400,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText'
            }}
          >
            <Typography variant="subtitle1">Admin Assistant</Typography>
            <IconButton size="small" onClick={toggleOpen} sx={{ color: 'inherit' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flexGrow: 1,
              p: 1,
              overflowY: 'auto',
              backgroundColor: 'grey.50'
            }}
          >
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor:
                      msg.sender === 'admin' ? 'secondary.main' : 'grey.200',
                    color:
                      msg.sender === 'admin'
                        ? 'secondary.contrastText'
                        : 'text.primary'
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                fullWidth
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !input.trim()}
                sx={{ minWidth: 'auto', p: '8px' }}
              >
                <SendIcon />
              </Button>
            </Stack>
          </Box>
        </Paper>
      ) : (
        <IconButton
          onClick={toggleOpen}
          color="primary"
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          <ChatIcon />
        </IconButton>
      )}
    </Box>
  );
}
