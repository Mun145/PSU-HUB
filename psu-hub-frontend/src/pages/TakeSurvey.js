// src/pages/TakeSurvey.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Radio,
  Checkbox,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Rating,
  FormControlLabel,
  Container,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
  Divider
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';

export default function TakeSurvey() {
  const [params] = useSearchParams();
  const eventId = params.get('eventId');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/surveys/event/${eventId}`)
       .then(res => {
         const fix = {
           ...res.data.data,
           questions: (res.data.data?.questions || []).map(q => ({
             ...q,
             options: Array.isArray(q.options) ? q.options : []
           }))
         };
         setSurvey(fix);
       })
       .catch(() => {
         toast.info('No survey for this event – certificate (if enabled) is issued automatically.');
         navigate('/my-attendance');
       })
       .finally(() => setLoading(false));
  }, [eventId, navigate]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
          {[1, 2, 3].map((index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Skeleton variant="text" width="80%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} />
            </Box>
          ))}
        </Paper>
      </Container>
    );
  }

  if (!survey || !survey.questions?.length) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            No survey has been configured for this event.
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/my-attendance')}
          >
            Back to Attendance
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleChange = (qid, val) =>
    setAnswers(a => ({ ...a, [qid]: val }));

  const handleSubmit = async () => {
    const missing = survey.questions.find(q => 
      answers[q.id] === undefined || 
      answers[q.id] === '' || 
      (Array.isArray(answers[q.id]) && !answers[q.id].length)
    );
    
    if (missing) {
      toast.warn('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([qId, ans]) => ({
        questionId: +qId, answer: ans
      }));
      await api.post(`/surveys/${survey.id}/response`, { answers: payload });
      toast.success('Thank you for completing the survey!');
      navigate('/my-attendance');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting survey');
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionIcon = (qType) => {
    switch (qType) {
      case 'rating': return <StarIcon />;
      case 'mcq': return <RadioButtonCheckedIcon />;
      case 'checkbox': return <CheckBoxIcon />;
      case 'short': return <ShortTextIcon />;
      default: return <AssignmentIcon />;
    }
  };

  return (
    <>
      <Helmet>
        <title>PSU Hub – Take Survey</title>
        <meta name="description" content="Complete the event survey on PSU Hub." />
      </Helmet>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <AssignmentIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                Event Survey
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Please provide your feedback to help us improve
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          {survey.questions.map((q, index) => (
            <Box 
              key={q.id} 
              sx={{ 
                mb: 4,
                p: 3,
                borderRadius: 2,
                backgroundColor: 'background.default'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                {getQuestionIcon(q.qType)}
                <Typography variant="h6" component="h2">
                  Question {index + 1}
                </Typography>
              </Stack>

              <Typography variant="body1" sx={{ mb: 2 }}>
                {q.question}
              </Typography>

              {/* SHORT TEXT */}
              {q.qType === 'short' && (
                <TextField
                  fullWidth
                  value={answers[q.id] ?? ''}
                  onChange={e => handleChange(q.id, e.target.value)}
                  variant="outlined"
                  placeholder="Type your answer here..."
                  multiline
                  rows={3}
                />
              )}

              {/* SINGLE-CHOICE MCQ */}
              {q.qType === 'mcq' && q.options.length ? (
                <Stack spacing={1}>
                  {q.options.map(opt => (
                    <FormControlLabel
                      key={opt}
                      control={
                        <Radio
                          checked={answers[q.id] === opt}
                          onChange={() => handleChange(q.id, opt)}
                          color="primary"
                        />
                      }
                      label={opt}
                    />
                  ))}
                </Stack>
              ) : q.qType === 'mcq' ? (
                <Alert severity="warning">No options configured for this question</Alert>
              ) : null}

              {/* MULTI-SELECT CHECKBOX */}
              {q.qType === 'checkbox' && q.options.length ? (
                <Stack spacing={1}>
                  {q.options.map(opt => (
                    <FormControlLabel
                      key={opt}
                      control={
                        <Checkbox
                          checked={answers[q.id]?.includes(opt) || false}
                          onChange={e => {
                            const current = new Set(answers[q.id] || []);
                            e.target.checked ? current.add(opt) : current.delete(opt);
                            handleChange(q.id, [...current]);
                          }}
                          color="primary"
                        />
                      }
                      label={opt}
                    />
                  ))}
                </Stack>
              ) : q.qType === 'checkbox' ? (
                <Alert severity="warning">No options configured for this question</Alert>
              ) : null}

              {/* RATING */}
              {q.qType === 'rating' && (
                <Rating
                  value={answers[q.id] ?? 0}
                  onChange={(_, val) => handleChange(q.id, val)}
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
              )}
            </Box>
          ))}

          <Stack 
            direction="row" 
            spacing={2} 
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/my-attendance')}
              fullWidth={isMobile}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? null : <CheckCircleIcon />}
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
        </Paper>
      </Container>
    </>
  );
}
