// File: src/app/about/page.tsx

import { Container, Typography, Paper, Box } from '@mui/material';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About This Application
        </Typography>
        
        <Typography variant="body1" paragraph>
          This AI First-Aid Assistant is a proof-of-concept application designed to provide immediate, context-aware first-aid guidance in potential medical situations. Our goal is to empower users with quick, reliable information when they need it most.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3 }}>
          Our Core Features
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Intelligent Chat Assistant:</strong> Our AI-powered chatbot provides step-by-step first-aid guidance. It is designed to recognize high-severity queries and proactively guide users toward emergency services.
        </Typography>

        <Typography variant="body1" paragraph>
          <strong>Emergency Hospital Finder:</strong> The application includes a fast, high-accuracy tool to help you find the nearest hospitals to your current location, providing critical details like address and directions.
        </Typography>

        <Box sx={{ borderLeft: 4, borderColor: 'error.main', pl: 2, mt: 3, backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
          <Typography variant="h6" component="h3" color="error.dark" gutterBottom>
            Important Limitation
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            This application is an informational tool only and is NOT a substitute for professional medical advice, diagnosis, or treatment. The AI can make mistakes. Always seek the advice of a qualified physician with any questions you may have regarding a medical condition.
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontWeight: 'bold' }}>
            For all medical emergencies, you must call your local emergency number immediately.
          </Typography>
        </Box>

      </Paper>
    </Container>
  );
}