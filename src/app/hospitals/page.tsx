// File: src/app/hospitals/page.tsx

'use client';

import { useState, useEffect } from 'react';
import HospitalCard, { Hospital } from '@/components/HospitalCard';
import { CircularProgress, Typography, Alert, Box, TextField, Button } from '@mui/material';

// Define the possible states our page can be in
type Status = 'idle' | 'loading' | 'success' | 'error' | 'permission_denied';

export default function HospitalsPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);

  // This function fetches hospitals from our backend API
  const findHospitals = async (latitude: number, longitude: number) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals.');
      }

      const data: Hospital[] = await response.json();
      setHospitals(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };
  
  // This useEffect hook runs automatically when the page loads
  useEffect(() => {
    // Check if the browser supports Geolocation
    if (!navigator.geolocation) {
      setStatus('permission_denied');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    
    // Request the user's current position
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        findHospitals(position.coords.latitude, position.coords.longitude);
      },
      // Error callback
      (error) => {
        console.error("Geolocation error:", error);
        setStatus('permission_denied');
        setError('Location permission denied. Please enter your address manually.');
      }
    );
  }, []); // The empty array ensures this runs only once on page load

  // --- UI RENDERING LOGIC ---
  // We render different content based on the current 'status'
  
  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Finding your location and searching for hospitals...</Typography>
          </Box>
        );

      case 'success':
        return (
          <div>
            <Typography variant="h5" sx={{ mb: 2 }}>Nearest Hospitals</Typography>
            {hospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))}
          </div>
        );

      case 'error':
        return <Alert severity="error">{error}</Alert>;

      case 'permission_denied':
        return (
          <Alert severity="warning">
            {error}
            {/* We will add the manual input form here in a future step if needed */}
          </Alert>
        );
        
      default:
        return null; // Don't show anything for 'idle'
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="w-full max-w-2xl">
        <Typography variant="h4" gutterBottom>Hospital Finder</Typography>
        {renderContent()}
      </div>
    </main>
  );
}
