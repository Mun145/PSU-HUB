// src/components/FormikTextField.js
import React from 'react';
import { TextField } from '@mui/material';
import { useField } from 'formik';

const FormikTextField = ({ name, label, ...props }) => {
  const [field, meta] = useField(name);
  return (
    <TextField
      fullWidth
      label={label}
      {...field}
      {...props}
      error={meta.touched && Boolean(meta.error)}
      helperText={meta.touched && meta.error}
      margin="normal"
    />
  );
};

export default FormikTextField;
