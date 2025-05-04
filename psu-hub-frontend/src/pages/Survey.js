import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Box,
  Stack,
  Rating,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import FormikTextField from '../components/FormikTextField';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function Survey() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [surveyId, setSurveyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/surveys/event/${eventId}`)
       .then(res => setSurveyId(res.data.data.id))
       .catch(() => toast.error('Survey not found'))
       .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={150} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={40} />
        </Paper>
      </Container>
    );
  }

  if (!surveyId) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Survey not found for this event.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/my-attendance')}
        >
          Back to Attendance
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>PSU Hub – Event Survey</title>
        <meta name="description" content="Provide feedback for your event attendance on PSU Hub." />
      </Helmet>

      <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <RateReviewIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                Event Feedback
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Help us improve by sharing your experience
              </Typography>
            </Box>
          </Stack>

          <Formik
            initialValues={{ rating: 0, feedback: '' }}
            validationSchema={Yup.object({
              rating: Yup.number()
                .required('Please provide a rating')
                .min(1, 'Rating must be at least 1')
                .max(5, 'Rating cannot exceed 5'),
              feedback: Yup.string()
                .required('Please provide feedback')
                .min(10, 'Feedback must be at least 10 characters')
            })}
            onSubmit={async (values) => {
              setSubmitting(true);
              try {
                await api.post(
                  `/surveys/${surveyId}/response`,
                  { answers: [
                      { questionId: 'rating', answer: values.rating },
                      { questionId: 'feedback', answer: values.feedback }
                    ]}
                );

                toast.success('Thank you for your feedback! Your certificate (if applicable) will now be available.');
                navigate('/my-attendance');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error submitting feedback');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ handleSubmit, setFieldValue, values }) => (
              <Form onSubmit={handleSubmit} noValidate>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    How would you rate this event?
                  </Typography>
                  <Rating
                    name="rating"
                    value={values.rating}
                    onChange={(event, newValue) => {
                      setFieldValue('rating', newValue);
                    }}
                    icon={<StarIcon fontSize="large" />}
                    emptyIcon={<StarBorderIcon fontSize="large" />}
                    size="large"
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: 'primary.main',
                      },
                      '& .MuiRating-iconHover': {
                        color: 'primary.light',
                      },
                    }}
                  />
                </Box>

                <FormikTextField
                  name="feedback"
                  label="Your Feedback"
                  multiline
                  rows={4}
                  placeholder="Share your thoughts about the event..."
                  sx={{ mb: 3 }}
                />

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/my-attendance')}
                    fullWidth={isMobile}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    fullWidth={isMobile}
                    sx={{ 
                      minWidth: 120,
                      position: 'relative'
                    }}
                  >
                    {submitting ? (
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                        }}
                      />
                    ) : 'Submit'}
                  </Button>
                </Stack>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
}
