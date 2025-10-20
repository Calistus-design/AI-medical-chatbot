// File: src/app/terms/page.tsx
import { Container, Typography, Paper } from '@mui/material';

export default function TermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Terms of Service
        </Typography>
        <Typography variant="body1" paragraph>
          This is a placeholder for the Terms of Service. In a real application, this page would outline the user's rights and responsibilities when using this service. By using this application, you agree that it is an informational tool and not a substitute for professional medical advice, and you agree to hold the creators harmless from any outcomes resulting from its use.
        </Typography>
        {/* Add more placeholder sections as needed */}
      </Paper>
    </Container>
  );
}