// File: src/app/privacy/page.tsx
import { Container, Typography, Paper } from '@mui/material';

export default function PrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body1" paragraph>
          This is a placeholder for the Privacy Policy. In a real application, this page would detail how user data is collected, stored, and used. For this proof-of-concept, we affirm that no chat data is stored, and location data is used only for the single, immediate purpose of finding nearby hospitals and is not stored.
        </Typography>
        {/* Add more placeholder sections as needed */}
      </Paper>
    </Container>
  );
}