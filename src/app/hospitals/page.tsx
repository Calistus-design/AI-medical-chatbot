// File: src/app/hospitals/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import HospitalCard, { Hospital } from '@/components/HospitalCard';
import { CircularProgress, Typography, Alert, Box, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

type Status = 'idle' | 'loading' | 'success' | 'error' | 'permission_denied';

export default function HospitalsPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // --- NEW UNIFIED FETCH FUNCTION ---
  // --- THIS IS THE NEW, STABLE FUNCTION WRAPPED IN useCallback ---
  const findHospitals = useCallback(async (term: string | null = null) => {
    if (!userCoords) {
      setError('Cannot search for hospitals without your location. Please allow location access and refresh.');
      setStatus('permission_denied');
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: userCoords.lat,
          longitude: userCoords.lon,
          searchTerm: term,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch hospitals.');
      }

      const data: Hospital[] = await response.json();
      setHospitals(data);
      setStatus('success');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setStatus('error');
    }
  }, [userCoords]); // <-- This dependency array tells useCallback when to recreate the function

  // This first useEffect runs only ONCE to get the user's location.
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('permission_denied');
      setError('Geolocation is not supported. Please use the search bar.');
      return;
    }
    
    setStatus('loading'); // Show loading while we ask for permission
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude }); // Just save the coordinates here
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus('permission_denied');
        setError('Location permission denied. Please use the search bar to find a hospital.');
      }
    );
  }, []);

  // This second useEffect triggers the actual API call *after* the coordinates have been successfully set.
  useEffect(() => {
    if (userCoords) {
      findHospitals(); // Call with no search term for the initial load of nearest hospitals
    }
  }, [userCoords, findHospitals]); // This dependency ensures it runs only when userCoords has a value

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      findHospitals(searchTerm.trim()); // Call with the search term
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
    if (userCoords) {
      findHospitals(); // Call with no search term to reset to nearest hospitals
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
      case 'error':
        return <Alert severity="error">{error}</Alert>;
      case 'permission_denied':
        return <Alert severity="warning">{error}</Alert>;
      case 'success':
        return hospitals.length > 0 ? (
          <div key={hospitals.length}>
            {hospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
              >
                <HospitalCard hospital={hospital} />
              </div>
            ))}
          </div>
        ) : (
          <Typography sx={{ mt: 4, textAlign: 'center' }}>
            No hospitals found matching your search.
          </Typography>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex flex-col items-center p-4 md:p-12">
      <div className="w-full max-w-2xl">
        <Typography variant="h4" gutterBottom>
          Hospital Finder
        </Typography>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 6, maxWidth: '1000px', mx: 'auto' }}>
          <TextField
            fullWidth
            size="small" 
            variant="outlined"
            placeholder="Search by hospital name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              sx: {
                borderRadius: '999px',
                paddingRight: '6px',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'action-green',
                },
              },
              endAdornment: (
                <InputAdornment position="end" sx={{ display: 'flex', gap: 0.5 }}>
                  {searchTerm && (
                    <IconButton aria-label="clear search" onClick={handleClearSearch} edge="end" size="small">
                      <ClearIcon />
                    </IconButton>
                  )}
                  <Button type="submit" aria-label="search" variant="contained" sx={{ borderRadius: '999px', minWidth: '36px', height: '36px', padding: 0, backgroundColor: 'action-green', '&:hover': { backgroundColor: 'green.700' }}}>
                    <SearchIcon />
                  </Button>
                </InputAdornment>
              ),
            }}
          />   
        </Box>

        <Typography variant="h4" sx={{ mb: 4 }}>
          Results
        </Typography>
        {renderContent()}
      </div>
    </main>
  );
}