import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, Button, CircularProgress
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';

export default function Survey() {
  const [searchParams] = useSearchParams();
  const eventId   = searchParams.get('eventId');
  const navigate  = useNavigate();

  /* fetch survey shell (to get surveyId) */
  const [surveyId, setSurveyId]   = useState(null);
  const [loading , setLoading ]   = useState(true);

  useEffect(() => {
    api.get(`/surveys/event/${eventId}`)
       .then(res => setSurveyId(res.data.data.id))
       .catch(() => toast.error('Survey not found'))
       .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <Container sx={{ mt:4, textAlign:'center' }}>
        <CircularProgress />
      </Container>
    );
  }
  if (!surveyId) return null;

  return (
    <>
      <Helmet>
        <title>PSU Hub – Survey</title>
      </Helmet>

      <Container maxWidth="sm" sx={{ mt:4 }}>
        <Paper sx={{ p:4 }}>
          <Typography variant="h5" gutterBottom>
            Event Feedback
          </Typography>

          <Formik
            initialValues={{ rating: '', feedback: '' }}
            validationSchema={Yup.object({
              rating  : Yup.number().required().min(1).max(5),
              feedback: Yup.string().required()
            })}
            onSubmit={async (values) => {
              try {
                await api.post(
                  `/surveys/${surveyId}/response`,
                  { answers: [
                      { questionId: 'rating',   answer: values.rating },
                      { questionId: 'feedback', answer: values.feedback }
                    ]}
                );

                toast.success('Thank you! Certificate (if applicable) will now be available.');
                navigate('/my-attendance');         // show the new button
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error submitting');
              }
            }}
          >
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit} noValidate>
                <FormikTextField name="rating"   label="Rating (1-5)" type="number" />
                <FormikTextField name="feedback" label="Feedback" multiline rows={4} />

                <Button type="submit" variant="contained" fullWidth sx={{ mt:2 }}>
                  Submit
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
}
