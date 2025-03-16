import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useLoading } from '../contexts/LoadingContext';

const GlobalLoading = () => {
  const { loading } = useLoading();
  return (
    <Backdrop
      open={loading}
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoading;
