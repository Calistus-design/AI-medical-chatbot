// File: src/components/EmergencyButton.tsx

'use client';

import { Button } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useRouter } from 'next/navigation'; // 1. Import the router

export default function EmergencyButton() {
  const router = useRouter(); // 2. Initialize the router

  const handleClick = () => {
    // 3. Use the router to navigate to the /hospitals page
    router.push('/hospitals');
  };

  return (
    <div className="mt-4">
      <p className="font-bold text-red-600">
        This sounds like a critical emergency. You should seek professional medical help immediately.
      </p>
      <Button
        variant="contained"
        color="error"
        startIcon={<LocalHospitalIcon />}
        onClick={handleClick}
        fullWidth
        sx={{ mt: 2 }}
      >
        Find Nearest Emergency Room Now
      </Button>
    </div>
  );
}