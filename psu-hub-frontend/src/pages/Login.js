// src/pages/Login.js
import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
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
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FormikTextField from '../components/FormikTextField';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = '/';

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub - Login</title>
      </Helmet>
      <Container 
        maxWidth="sm" 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
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
                Welcome Back
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Sign in to your PSU Hub account
              </Typography>
            </Box>
          </Stack>

          <Alert severity="info" sx={{ mb: 3 }}>
            Please enter your credentials to access your account
          </Alert>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email('Please enter a valid email address')
                .required('Email is required'),
              password: Yup.string()
                .required('Password is required')
                .min(6, 'Password must be at least 6 characters')
            })}
            onSubmit={async (values) => {
              setIsSubmitting(true);
              try {
                const success = await login(values.email, values.password);
                if (success) {
                  navigate(redirectTo, { replace: true });
                } else {
                  toast.error('Invalid email or password');
                }
              } catch (error) {
                toast.error('An error occurred during login');
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            {({ handleSubmit }) => (
              <Form>
                <Stack spacing={3}>
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

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    sx={{ 
                      py: 1.5,
                      mt: 2
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Don't have an account?{' '}
                      <Link 
                        href="/register" 
                        color="primary"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Sign up
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

export default Login;
