// src/pages/Login.js
import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import FormikTextField from '../components/FormikTextField';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();
  const redirectTo = '/'; 

  return (
    <>
      <Helmet>
        <title>PSU Hub - Login</title>
      </Helmet>
      <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Sign In
          </Typography>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={Yup.object({
              email: Yup.string().email('Invalid email').required('Required'),
              password: Yup.string().required('Required')
            })}
            onSubmit={async (values) => {
              const success = await login(values.email, values.password);
              if (success) {
                navigate(redirectTo, { replace: true });
              } else {
                toast.error('Login failed');
              }
            }}
          >
            {({ handleSubmit }) => (
              <Form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <FormikTextField name="email" label="Email" />
                <FormikTextField name="password" label="Password" type="password" />
                <Button type="submit" variant="contained" fullWidth>
                  Log In
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
