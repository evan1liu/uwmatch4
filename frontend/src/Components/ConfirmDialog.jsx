import { 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography 
} from '@mui/material';

const ConfirmDialog = ({ open, onClose, onConfirm, title, content }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle id="confirm-dialog-title">
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    {content}
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
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog; 