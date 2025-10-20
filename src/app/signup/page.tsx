// File: src/app/signup/page.tsx
import AuthForm from "@/components/auth/AuthForm";
import { Container, Typography } from "@mui/material";

export default function SignUpPage() {
  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Create an Account
      </Typography>
      <AuthForm mode="signup" /> {/* Pass the mode prop */}
    </Container>
  );
}