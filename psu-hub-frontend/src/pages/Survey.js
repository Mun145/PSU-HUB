// src/pages/Survey.js
import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Paper, Typography, Button} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';
import { useSearchParams } from 'react-router-dom';

const Survey = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  return (
    <>
      <Helmet>
        <title>PSU Hub - Survey</title>
        <meta name="description" content="Submit your survey for an event on PSU Hub." />
      </Helmet>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>Survey</Typography>
          <Formik
            initialValues={{ rating: '', feedback: '' }}
            validationSchema={Yup.object({
              rating: Yup.number().required('Rating is required').min(1, 'Min rating is 1').max(5, 'Max rating is 5'),
              feedback: Yup.string().required('Feedback is required')
            })}
            onSubmit={async (values) => {
              try {
                const payload = { ...values, eventId };
                const { data } = await api.post('/surveys/submit', payload);
                toast.success(data.message || 'Survey submitted successfully');
              } catch (error) {
                toast.error(error.response?.data?.message || 'Error submitting survey');
              }
            }}
          >
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit} noValidate>
                <FormikTextField name="rating" label="Rating (1-5)" type="number" />
                <FormikTextField name="feedback" label="Feedback" multiline rows={4} />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                  Submit Survey
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default Survey;
