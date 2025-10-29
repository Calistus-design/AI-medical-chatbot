// File: src/app/hospitals/page.tsx

'use client';

import { useState, useEffect } from 'react';
import HospitalCard, { Hospital } from '@/components/HospitalCard';
import { CircularProgress, Typography, Alert, Box, TextField, Button, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear'; 

type Status = 'idle' | 'loading' | 'success' | 'error' | 'permission_denied';

export default function HospitalsPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- NEW STATE FOR THE SEARCH BAR ---
  const [searchTerm, setSearchTerm] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Function to find hospitals by GEOLOCATION
  const findHospitalsByLocation = async (latitude: number, longitude: number) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!response.ok) throw new Error('Failed to fetch hospitals by location.');
      const data: Hospital[] = await response.json();
      setHospitals(data);
      setStatus('success');
    } catch (err: any) {
      setError(err.message);
      setStatus('error');
    }
  };

  // --- NEW FUNCTION TO FIND HOSPITALS BY NAME ---
  const findHospitalsByName = async (term: string) => {
    setStatus('loading');
    setError(null);
    try {
      const response = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchTerm: term }),
      });
      if (!response.ok) throw new Error('Failed to fetch hospitals by name.');
      const data: Hospital[] = await response.json();
      setHospitals(data);
      setStatus('success');
    } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
    setError(errorMessage);
    setStatus('error');
}
  };

  // This useEffect still runs on page load to get location
  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus('permission_denied');
      setError('Geolocation is not supported. Please use the search bar.');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
    const { latitude, longitude } = position.coords;
    setUserCoords({ lat: latitude, lon: longitude }); // <-- SAVE THE COORDS
    findHospitalsByLocation(latitude, longitude);
  },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus('permission_denied');
        setError('Location permission denied. Please use the search bar to find a hospital.');
      }
    );
  }, []);

  // --- NEW HANDLER FOR THE SEARCH FORM ---
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      findHospitalsByName(searchTerm.trim());
    }
  };

  const renderContent = () => {
    // We only show the loading spinner, error, or permission denied states
    // during the initial page load. After that, the search results will
    // either show hospitals or an empty state.
    switch (status) {
      case 'loading':
        return <CircularProgress sx={{ display: 'block', margin: 'auto', mt: 4 }} />;
      case 'error':
        return <Alert severity="error">{error}</Alert>;
      case 'permission_denied':
        return <Alert severity="warning">{error}</Alert>;
      case 'success':
        return hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <HospitalCard key={hospital.id} hospital={hospital} />
          ))
        ) : (
          <Typography sx={{ mt: 4, textAlign: 'center' }}>
            No hospitals found matching your search.
          </Typography>
        );
      default:
        return null;
    }
  };

  const handleClearSearch = () => {
  setSearchTerm(''); // Clear the input field
  if (userCoords) {
    // If we have the user's location, re-run the original search
    findHospitalsByLocation(userCoords.lat, userCoords.lon);
  } else {
    // If we never got their location, just clear the results
    setHospitals([]);
    // The 'permission_denied' status will show the original warning message
    setStatus('permission_denied'); 
    setError('Location permission denied. Please use the search bar to find a hospital.');
  }
};

  return (
    <main className="flex flex-col items-center p-4 md:p-12">
      <div className="w-full max-w-2xl">
        <Typography variant="h4" gutterBottom>
          Hospital Finder
        </Typography>

        {/* --- NEW SEARCH BAR FORM --- */}
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
  // We now have two adornments: a conditional clear button, and the search button.
  endAdornment: (
    <InputAdornment position="end" sx={{ display: 'flex', gap: 0.5 }}>
      {searchTerm && ( // <-- Only show the clear button if there is a search term
        <IconButton
          aria-label="clear search"
          onClick={handleClearSearch}
          edge="end"
          size="small"
        >
          <ClearIcon />
        </IconButton>
      )}
      <Button
        type="submit"
        aria-label="search"
        variant="contained"
        sx={{
          borderRadius: '999px',
          minWidth: '36px',
          height: '36px',
          padding: 0,
          backgroundColor: 'action-green',
          '&:hover': { backgroundColor: 'green.700' },
        }}
      >
        <SearchIcon />
      </Button>
    </InputAdornment>
  ),
}}
/>   
</Box>

        {/* --- DYNAMIC CONTENT AREA --- */}
        <Typography variant="h4" sx={{ mb: 4 }}>
          Results
        </Typography>
        {renderContent()}
      </div>
    </main>
  );
}