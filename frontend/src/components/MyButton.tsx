'use client'

import { useState } from 'react';
import Button from '@mui/material/Button';
import Chat from './Text&ImgChat';

export default function MyButton() {

    const [showChat, setShowChat] = useState<boolean>(false);

    const handleOpenChat = () => {
      setShowChat(true);
    }

    return (
        <div>
          <Button variant="contained" color="primary" onClick={handleOpenChat}>
            Open Chat
          </Button>
          {showChat && <Chat setShowChat={setShowChat} />}
        </div>
      );
}