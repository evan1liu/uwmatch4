import React from 'react';
import { 
  Typography, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

export default function ConfirmLogout({ openDialog, handleLogout, onClose }) {
    return (
        <Dialog
        open={openDialog}
        onClose={onClose}
        aria-labelledby="logout-dialog-title"
      >
        <DialogTitle id="logout-dialog-title">
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={onClose}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout} 
            color="error"
            variant="contained"
            autoFocus
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    );
}
