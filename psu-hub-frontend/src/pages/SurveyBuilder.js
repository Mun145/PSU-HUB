// src/pages/SurveyBuilder.js
import React, { useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon    from '@mui/icons-material/Add';
import {
  useForm,
  useFieldArray,
  Controller,
  FormProvider
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { toast } from 'react-toastify';

/* ─────────────────────────── constants ────────────────────────── */
const qTypes = [
  { value: 'short',    label: 'Short answer' },
  { value: 'mcq',      label: 'Multiple choice (single)' },
  { value: 'checkbox', label: 'Multiple choice (multiple)' },
  { value: 'rating',   label: 'Rating 1‑5' }
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
    <>
      {optionFields.map((opt, optIdx) => (
        <Box key={opt.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <Controller
            control={control}
            name={`questions.${nestIndex}.options.${optIdx}`}
            defaultValue={opt || ''}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder={`Option ${optIdx + 1}`}
              />
            )}
          />
          <IconButton onClick={() => removeOpt(optIdx)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Button
        size="small"
        startIcon={<AddIcon />}
        onClick={() => addOpt('')}
      >
        Add option
      </Button>
    </>
  );
}

/* ─────────────────────────── main page ────────────────────────── */
export default function SurveyBuilder() {
  const { id: eventId } = useParams(); // eventId from URL
  const navigate        = useNavigate();

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
      .catch(() => {/* none yet – fine */});
  }, [eventId, reset]);

  /* ───────────── submit handler ───────────── */
  const onSubmit = async (data) => {
    try {
      /* ensure survey shell exists (idempotent) */
      const { data: shell } = await api.post('/surveys', { eventId: +eventId });
      const surveyId = shell.data.id;

      await api.post(`/surveys/${surveyId}/questions`, {
        questions: data.questions
      });

      toast.success('Survey saved');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving');
    }
  };

  /* ────────────────────────── render ──────────────────────────── */
  const watchQuestions = watch('questions'); // for conditional UI

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Survey Builder
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {qFields.map((q, qIndex) => {
              const qType = watchQuestions?.[qIndex]?.qType;
              return (
                <Grid item xs={12} key={q.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Question"
                        fullWidth
                        {...register(`questions.${qIndex}.question`)}
                      />

                      <TextField
                        select
                        label="Type"
                        sx={{ minWidth: 220 }}
                        {...register(`questions.${qIndex}.qType`)}
                      >
                        {qTypes.map((qt) => (
                          <MenuItem key={qt.value} value={qt.value}>
                            {qt.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <IconButton
                        onClick={() => removeQuestion(qIndex)}
                        sx={{ alignSelf: 'center' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    {(qType === 'mcq' || qType === 'checkbox') && (
                      <OptionEditor nestIndex={qIndex} control={control} />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Button
            sx={{ mt: 3 }}
            startIcon={<AddIcon />}
            onClick={() =>
              addQuestion({
                question: '',
                qType   : 'short',
                options : []
              })
            }
          >
            Add Question
          </Button>

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button variant="contained" type="submit">
              Save
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </Box>
        </form>
      </FormProvider>
    </Paper>
  );
}
