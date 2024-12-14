import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

const QnaWelcomeDialog = () => {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Welcome to QnA Forum</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Welcome to our QnA Forum. This platform is designed for asking any
          questions related to first aid and receiving answers from medical
          professionals.
        </DialogContentText>
        <br></br>
        <DialogContentText>
          Please feel free to ask any questions about first aid procedures,
          medical emergencies, or any health-related issues. Doctors are
          available to provide answers to your questions.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QnaWelcomeDialog;
