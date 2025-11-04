// File: src/components/HospitalCard.tsx

'use client';

import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import DirectionsIcon from '@mui/icons-material/Directions';

// Define the shape of the hospital data we expect to receive
export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  website: string;
  distance_meters: number;
}

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  // Convert distance from meters to kilometers and format it
  const distanceInKm = (hospital.distance_meters / 1000).toFixed(1);

  return (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 2,
        // --- THIS IS THE CORRECTED & IMPROVED HOVER EFFECT ---
        // 1. Explicitly add 'border-color' to the transition property
        transition: 'transform 0.2s ease-in-out, box-shadow 0.9s ease-in-out, border-color 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', // A slightly stronger shadow
          // 2. Change the border color to our primary 'action-green' color on hover
          borderColor: 'primary.main', 
        }

      }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {hospital.name}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 1.5 }}>
          {hospital.address}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          <strong>Approx. {distanceInKm} km away</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* "Call" button - uses a 'tel:' link to open the phone dialer */}
          <Button
            variant="outlined"
            startIcon={<PhoneIcon />}
            href={`tel:${hospital.phone}`}
            sx={{ flex: 1 }}
          >
            Call
          </Button>
          {/* "Directions" button - will open Google Maps */}
          <Button
            variant="contained"
            startIcon={<DirectionsIcon />}
            // We encode the address to make it URL-safe for Google Maps
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`}
            target="_blank" // Opens the link in a new tab
            rel="noopener noreferrer"
            sx={{ flex: 1 }}
          >
            Directions
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}