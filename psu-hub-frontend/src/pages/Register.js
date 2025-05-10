// src/pages/Register.js
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  Container,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Stack,
  IconButton,
  InputAdornment,
  Link,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import FormikTextField from '../components/FormikTextField';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Register</title>
      </Helmet>
      <Container 
  maxWidth="sm" 
  sx={{ 
    height: '100vh',         
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 0                    
  }}
>

        <Paper 
          elevation={3} 
          sx={{ 
            p: 4,
            width: '100%',
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                Create Account
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Join PSU Hub to manage your events
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ mb: 3 }}>
            Please fill in your details to create an account
          </Alert>

          <Formik
            initialValues={{ name: '', email: '', password: '', role: 'faculty' }}
            validationSchema={Yup.object({
              name: Yup.string()
                .required('Name is required')
                .min(2, 'Name must be at least 2 characters'),
              email: Yup.string()
                .email('Please enter a valid email address')
                .required('Email is required'),
              password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters'),
              role: Yup.string()
                .oneOf(['faculty', 'admin', 'psu_admin'], 'Please select a valid role')
                .required('Role is required')
            })}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              try {
                const res = await axiosInstance.post('/users/register', values);
                toast.success('Registration successful! Please log in.');
                navigate('/login');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Registration failed');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ values, handleChange, handleSubmit }) => (
              <Form>
                <Stack spacing={3}>
                  <FormikTextField 
                    name="name" 
                    label="Full Name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormikTextField 
                    name="email" 
                    label="Email Address"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormikTextField 
                    name="password" 
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                      labelId="role-label"
                      id="role"
                      name="role"
                      value={values.role}
                      label="Role"
                      onChange={handleChange}
                      startAdornment={
                        <PersonAddIcon color="action" sx={{ mr: 1 }} />
                      }
                    >
                      <MenuItem value="faculty">Faculty</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="psu_admin">PSU Admin</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? null : <PersonAddIcon />}
                    sx={{ 
                      py: 1.5,
                      mt: 2
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        href="/login" 
                        color="primary"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Stack>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default Register;
