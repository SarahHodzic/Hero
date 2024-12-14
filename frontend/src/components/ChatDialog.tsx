'use client'

import { useState } from 'react';
import { Dialog, DialogContent, IconButton, Container } from '@mui/material';
import Chat from './Text&ImgChat';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';

export default function ChatDialog() {
    const [open, setOpen] = useState(false);
  
    const handleClickOpen = () => {
      setOpen(true);
    };
  
    const handleClose = () => {
      setOpen(false);
    };

    return (
      <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
              Chat 

          </Button>
          <Dialog
              open={open}
              onClose={handleClose}
              fullWidth
              maxWidth="lg"
              PaperProps={{ style: { height: '80vh', overflow: 'hidden' } }}
          >
              <DialogContent style={{ padding: 0, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <IconButton
                      edge="end"
                      color="inherit"
                      onClick={handleClose}
                      aria-label="close"
                      style={{ position: 'absolute', right: 10, top: 10 }}
                  >
                      <CloseIcon />
                  </IconButton>
                  <Container style={{ paddingTop: '40px', paddingBottom: '20px', height: '100%', overflow: 'hidden' }}>
                      <Chat setShowChat={setOpen} />
                  </Container>
              </DialogContent>
          </Dialog>
      </div>
  );
}
