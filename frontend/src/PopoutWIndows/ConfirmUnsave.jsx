import React from 'react';
import { 
    Typography, 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';

export default function ConfirmUnsave({ openDialog, onClose, onConfirm, courseTitle }) {
    return (
        <Dialog
            open={openDialog}
            onClose={onClose}
            aria-labelledby="unsave-dialog-title"
        >
            <DialogTitle id="unsave-dialog-title">
                Unsaving Course:
            </DialogTitle>
            <DialogContent>
                <Typography 
                    variant="subtitle1" 
                    sx={{ mt: 2, fontWeight: 'bold' }}
                >
                    {courseTitle}
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
                    onClick={onConfirm}
                    color="error"
                    variant="contained"
                    autoFocus
                >
                    Unsave
                </Button>
            </DialogActions>
        </Dialog>
    );
}
