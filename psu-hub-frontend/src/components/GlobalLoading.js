// src/components/GlobalLoading.js
import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useLoading } from '../contexts/LoadingContext';

const GlobalLoading = () => {
  const { loading } = useLoading();

  return (
    <Backdrop
      open={loading}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 2 // slight bump
      }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoading;
