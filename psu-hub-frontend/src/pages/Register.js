// src/pages/Register.js
import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import FormikTextField from '../components/FormikTextField';

const Register = () => {
  return (
    <>
      <Helmet>
        <title>PSU Hub - Register</title>
      </Helmet>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create an Account
          </Typography>
          <Formik
            initialValues={{ name: '', email: '', password: '', role: 'faculty' }}
            validationSchema={Yup.object({
              name: Yup.string().required('Name is required'),
              email: Yup.string().email('Invalid email').required('Email is required'),
              password: Yup.string().min(6).required('Password is required'),
              role: Yup.string().oneOf(['faculty', 'admin', 'psu_admin']).required('Role required')
            })}
            onSubmit={async (values) => {
              try {
                const res = await axiosInstance.post('/users/register', values);
                toast.success(res.data.message || 'Registration successful');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Registration failed');
              }
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <FormikTextField name="name" label="Name" />
                <FormikTextField name="email" label="Email" />
                <FormikTextField name="password" label="Password" type="password" />
                <FormControl>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={values.role}
                    label="Role"
                    onChange={handleChange}
                  >
                    <MenuItem value="faculty">Faculty</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="psu_admin">PSU Admin</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" fullWidth type="submit">
                  Register
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default Register;
