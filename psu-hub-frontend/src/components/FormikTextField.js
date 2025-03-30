// src/components/FormikTextField.js
import React from 'react';
import { TextField } from '@mui/material';
import { useField } from 'formik';

const FormikTextField = ({
  name,
  label,
  variant = 'outlined',
  sx = {},
  ...props
}) => {
  const [field, meta] = useField(name);
  return (
    <TextField
      fullWidth
      label={label}
      variant={variant}
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      margin="normal"
      sx={{ ...sx }}
    />
  );
};

export default FormikTextField;
