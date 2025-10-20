// File: src/app/login/page.tsx
import AuthForm from "@/components/auth/AuthForm";
import { Container, Typography } from "@mui/material";

export default function LoginPage() {
  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Log In
      </Typography>
      <AuthForm mode="login" /> {/* Pass the mode prop */}
    </Container>
  );
}