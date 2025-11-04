// File: src/app/login/page.tsx
import AuthForm from "@/components/auth/AuthForm";
import { Container, Typography } from "@mui/material";

export default function LoginPage() {
  return (
    <Container component="main" maxWidth="xs" sx={{ mt: 8, mb: 8 }}>
      <Typography component="h1" variant="h5" align="center" gutterBottom>
        Log In
      </Typography>
      {/* --- ADD THIS TEMPORARY DEBUGGING BLOCK --- */}
      <Typography 
        variant="caption" 
        align="center" 
        sx={{ 
          display: 'block', 
          p: 2, 
          border: '1px dashed red', 
          mb: 2, 
          wordBreak: 'break-all' 
        }}
      >
        DEBUG: NEXT_PUBLIC_SUPABASE_URL is: 
        <br />
        <strong>{process.env.NEXT_PUBLIC_SUPABASE_URL || "VALUE IS NOT SET"}</strong>
      </Typography>
      {/* --- END OF DEBUGGING BLOCK --- */}
      <AuthForm mode="login" /> {/* Pass the mode prop */}
    </Container>
  );
}