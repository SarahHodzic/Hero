import React, { useState } from 'react';
import axios from 'axios';
import { Button, Container, Paper, Grid, TextField, InputAdornment, IconButton, Typography, CircularProgress } from '@mui/material';
import { Send as SendIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

interface ChatProps {
    setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Chat({ setShowChat }: ChatProps) {
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [fileURL, setFileURL] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendMessage = async () => {
        if (message.trim() || file) {
            const query = message.trim() || 'What is in this image?'; // Use hardcoded question if message is empty
            if (message.trim()) {
                setMessages([...messages, `User: ${message}`]);
            }

            if (file) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('query', query);
                setLoading(true);

                try {
                    const res = await axios.post('http://localhost:8000/analyze-image/', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    setMessages(prevMessages => [...prevMessages, `AI: ${res.data}`]);

                } catch (error) {
                    console.error('Error:', error);
                    setMessages(prevMessages => [...prevMessages, 'AI: Error analyzing image.']);

                } finally {
                    setLoading(false);
                    if (fileURL) {
                        URL.revokeObjectURL(fileURL);
                    }
                    setFile(null);
                    setFileURL(null);
                }
            } else {
                try {
                    const res = await axios.post('http://localhost:8000/first-aid/search', { query });

                    if (res.data && res.data.response) {
                        setMessages(prevMessages => [...prevMessages, `AI: ${res.data.response}`]);
                    } else {
                        console.error('Unexpected response format:', res.data);
                    }

                } catch (error) {
                    console.error('Error:', error);
                    setMessages(prevMessages => [...prevMessages, 'AI: Error fetching response.']);
                }
            }

            setMessage('');
        }
    };

    const handleCloseChat = () => {
        setShowChat(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            const previewURL = URL.createObjectURL(selectedFile);
            setFileURL(previewURL);
            setMessages(prevMessages => [...prevMessages, `User uploaded an image: ${previewURL}`]);
        } else {
            setFile(null);
            setFileURL(null);
        }
    };

    return (
        <Container maxWidth="md" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper elevation={24} square={false} style={{ flexGrow: 1, padding: '16px', overflowY: 'auto', borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', scrollbarWidth: 'thin', scrollbarColor: '#d3d3d3 transparent' }}>
                {messages.map((msg, index) => (
                    <Typography key={index} style={{ margin: '10px 0' }}>
                        {msg.startsWith('User uploaded an image:') ? <img src={msg.split(': ')[1]} alt="Uploaded" style={{ maxWidth: '100%' }} /> : msg}
                    </Typography>
                ))}
            </Paper>

            <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ marginTop: '20px' }}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        variant="outlined"
                        placeholder="Type a message..."
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        color="primary"
                                        onClick={handleSendMessage}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                </Grid>
                <Grid item>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="icon-button-file"
                        type="file"
                        onChange={handleFileChange}
                    />
                    <label htmlFor="icon-button-file">
                        <IconButton color="primary" aria-label="upload picture" component="span">
                            <PhotoCameraIcon />
                        </IconButton>
                    </label>
                </Grid>
                <Grid item>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={loading && (!message.trim() && !file)}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Send'}
                    </Button>
                </Grid>
            </Grid>
        </Container>
    );
}
