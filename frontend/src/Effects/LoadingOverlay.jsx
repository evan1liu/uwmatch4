import { Box, CircularProgress } from '@mui/material';

export default function LoadingOverlay() {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.1)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <CircularProgress sx={{ color: '#fff' }} />
        </Box>
    );
}
