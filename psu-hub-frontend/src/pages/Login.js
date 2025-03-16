// src/pages/Login.js
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FormikTextField from '../components/FormikTextField';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>PSU Hub - Login</title>
        <meta name="description" content="Login to PSU Hub." />
      </Helmet>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={Yup.object({
              email: Yup.string().email('Invalid email address').required('Email is required'),
              password: Yup.string().required('Password is required')
            })}
            onSubmit={async (values) => {
              const success = await login(values.email, values.password);
              if (success) {
                navigate('/');
              } else {
                toast.error('Login failed');
              }
            }}
          >
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit} noValidate>
                <FormikTextField name="email" label="Email" />
                <FormikTextField name="password" label="Password" type="password" />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Login
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default Login;
