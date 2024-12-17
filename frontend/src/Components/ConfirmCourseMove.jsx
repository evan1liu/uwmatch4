import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography 
} from '@mui/material';

const ConfirmCourseMove = ({ 
  open, 
  onClose, 
  onConfirm, 
  course, 
  existingTerm, 
  existingYear 
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Course Already in Roadmap</DialogTitle>
      <DialogContent>
        <Typography>
          {course?.code} - {course?.title} is already in {existingTerm} {existingYear}.
          Do you want to move it to the selected term?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained">
          Move Course
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmCourseMove; 