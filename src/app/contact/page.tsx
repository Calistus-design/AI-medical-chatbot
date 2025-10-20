// File: src/app/contact/page.tsx
import { Container, Typography, Paper, Button } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

export default function ContactPage() {
  // IMPORTANT: Replace this with the actual URL of your project's GitHub repository
  const githubRepoUrl = 'https://github.com/your-username/your-repository-name';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact & Collaboration
        </Typography>
        <Typography variant="body1" paragraph>
          This project was developed by Calistus-design's Org. We believe in open-source collaboration and welcome feedback, bug reports, and contributions from the community.
        </Typography>
        <Typography variant="body1" paragraph>
          The best way to get in touch, view the source code, and see the list of contributors is through our official GitHub repository.
        </Typography>
        <Button
          variant="contained"
          startIcon={<GitHubIcon />}
          href={githubRepoUrl}
          target="_blank" // Opens in a new tab
          rel="noopener noreferrer"
          sx={{ mt: 2 }}
        >
          View Project on GitHub
        </Button>
      </Paper>
    </Container>
  );
}
