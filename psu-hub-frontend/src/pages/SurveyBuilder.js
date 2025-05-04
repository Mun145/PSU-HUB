// src/pages/SurveyBuilder.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  Grid,
  Container,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ShortTextIcon from '@mui/icons-material/ShortText';
import StarIcon from '@mui/icons-material/Star';
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';


/* ─────────────────────────── constants ────────────────────────── */
const qTypes = [
  { value: 'short',    label: 'Short answer', icon: <ShortTextIcon /> },
  { value: 'mcq',      label: 'Multiple choice (single)', icon: <RadioButtonCheckedIcon /> },
  { value: 'checkbox', label: 'Multiple choice (multiple)', icon: <CheckBoxIcon /> },
  { value: 'rating',   label: 'Rating 1-5', icon: <StarIcon /> }
];

/* ──────────────── yup schema (dynamic options rule) ───────────── */
const questionSchema = yup.object().shape({
  question: yup.string().trim().required('Question is required'),
  qType   : yup.string().oneOf(qTypes.map((q) => q.value)).required(),
  options : yup.array().when('qType', {
    is : (v) => v === 'mcq' || v === 'checkbox',
    then: (s) =>
      s.of(yup.string().trim().required('Option cannot be empty'))
       .min(2, 'Need at least two options'),
    otherwise: (s) => s.strip(true) // strip if not needed
  })
});

const schema = yup.object({
  questions: yup.array().of(questionSchema)
});

/* ────────────────── nested component for options ──────────────── */
function OptionEditor({ nestIndex, control }) {
  /* every Question row gets its own field‑array for options */
  const {
    fields: optionFields,
    append: addOpt,
    remove: removeOpt
  } = useFieldArray({
    control,
    name: `questions.${nestIndex}.options`
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Options
      </Typography>
      <Stack spacing={1}>
        {optionFields.map((opt, optIdx) => (
          <Box key={opt.id} sx={{ display: 'flex', gap: 1 }}>
            <Controller
              control={control}
              name={`questions.${nestIndex}.options.${optIdx}`}
              defaultValue={opt || ''}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder={`Option ${optIdx + 1}`}
                  variant="outlined"
                />
              )}
            />
            <Tooltip title="Remove option">
              <IconButton 
                onClick={() => removeOpt(optIdx)}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>
      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => addOpt('')}
        sx={{ mt: 1 }}
      >
        Add option
      </Button>
    </Box>
  );
}

/* ─────────────────────────── main page ────────────────────────── */
export default function SurveyBuilder() {
  const { id: eventId } = useParams(); // eventId from URL
  const navigate        = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* one RHF context for whole form */
  const methods = useForm({
    resolver     : yupResolver(schema),
    defaultValues: { questions: [] }
  });
  const { control, register, handleSubmit, reset, watch } = methods;

  /* top‑level questions array */
  const {
    fields: qFields,
    append: addQuestion,
    remove: removeQuestion
  } = useFieldArray({ control, name: 'questions' });

  /* ─── load existing survey (if any) ── */
  useEffect(() => {
    setLoading(true);
    api
      .get(`/surveys/event/${eventId}`)
      .then((res) => {
        const qs = res?.data?.data?.questions || [];
        reset({
          questions: qs.map((q) => ({
            ...q,
            options: q.options ?? []
          }))
        });
      })
      .catch(() => {/* none yet – fine */})
      .finally(() => setLoading(false));
  }, [eventId, reset]);

  /* ───────────── submit handler ───────────── */
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      /* ensure survey shell exists (idempotent) */
      const { data: shell } = await api.post('/surveys', { eventId: +eventId });
      const surveyId = shell.data.id;

      await api.post(`/surveys/${surveyId}/questions`, {
        questions: data.questions
      });

      toast.success('Survey saved successfully');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving survey');
    } finally {
      setSubmitting(false);
    }
  };

  /* ────────────────────────── render ──────────────────────────── */
  const watchQuestions = watch('questions'); // for conditional UI

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

  return (
    <>
      <Helmet>
        <title>PSU Hub – Survey Builder</title>
        <meta name="description" content="Create and manage event surveys on PSU Hub." />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper 
          elevation={3}
          sx={{ 
            p: 4,
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <QuestionAnswerIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{ 
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                Survey Builder
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
              >
                Create and customize your event survey
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 4 }} />

          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={3}>
                {qFields.map((q, qIndex) => {
                  const qType = watchQuestions?.[qIndex]?.qType;
                  const questionType = qTypes.find(t => t.value === qType);
                  
                  return (
                    <Card key={q.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <TextField
                              label="Question"
                              fullWidth
                              {...register(`questions.${qIndex}.question`)}
                              variant="outlined"
                              size="small"
                            />

                            <TextField
                              select
                              label="Type"
                              sx={{ minWidth: 220 }}
                              {...register(`questions.${qIndex}.qType`)}
                              variant="outlined"
                              size="small"
                            >
                              {qTypes.map((qt) => (
                                <MenuItem key={qt.value} value={qt.value}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    {qt.icon}
                                    <span>{qt.label}</span>
                                  </Stack>
                                </MenuItem>
                              ))}
                            </TextField>

                            <Tooltip title="Remove question">
                              <IconButton
                                onClick={() => removeQuestion(qIndex)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          {questionType && (
                            <Chip
                              icon={questionType.icon}
                              label={questionType.label}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          )}

                          {(qType === 'mcq' || qType === 'checkbox') && (
                            <OptionEditor nestIndex={qIndex} control={control} />
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>

              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    addQuestion({
                      question: '',
                      qType: 'short',
                      options: []
                    })
                  }
                >
                  Add Question
                </Button>
              </Box>

              <Stack 
                direction="row" 
                spacing={2} 
                justifyContent="flex-end"
                sx={{ mt: 4 }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  fullWidth={isMobile}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={submitting}
                  startIcon={submitting ? null : <SaveIcon />}
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
                  ) : 'Save'}
                </Button>
              </Stack>
            </form>
          </FormProvider>
        </Paper>
      </Container>
    </>
  );
}
