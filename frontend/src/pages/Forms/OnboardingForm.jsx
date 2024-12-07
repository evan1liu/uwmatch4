import {
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Box,
    Autocomplete
} from '@mui/material';

export default function OnboardingForm({ formData, handleMajorChange, handleYearChange, handleOnboardingSubmit, error, loading, majors, years }) {
    return (
        <Box sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            pointerEvents: loading ? 'none' : 'auto'
        }}>
            <Card sx={{ maxWidth: 400, width: '100%' }}>
                <CardContent>
                    <Typography variant="h5" align="center" gutterBottom>
                        Additional Information
                    </Typography>
                    <form onSubmit={handleOnboardingSubmit}>
                        <Autocomplete
                            fullWidth
                            disablePortal
                            options={majors}
                            value={formData.major || ''}
                            onChange={handleMajorChange}
                            renderInput={(params) => <TextField {...params} label="Major" />}
                        />
                        <Autocomplete
                            fullWidth
                            disablePortal
                            options={years}
                            value={formData.year || ''}
                            onChange={handleYearChange}
                            renderInput={(params) => <TextField {...params} label="Year" />}
                        />
                        {error && (
                            <Typography color="error" align="center" sx={{ mt: 1 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            Confirm
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}
