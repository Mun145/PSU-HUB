// src/pages/TakeSurvey.js
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Radio, Checkbox, TextField, Typography,
  Paper, CircularProgress, Rating, FormControlLabel
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api   from '../api/axiosInstance';
import { toast } from 'react-toastify';

export default function TakeSurvey () {
  /* ───────── query / nav helpers ───────── */
  const [params] = useSearchParams();
  const eventId  = params.get('eventId');
  const navigate = useNavigate();

  /* ───────── local state ───────── */
  const [survey,  setSurvey]  = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  /* ───────── fetch survey schema ───────── */
  useEffect(() => {
    api.get(`/surveys/event/${eventId}`)
       .then(res => {
         /* ensure options is always an array */
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

  /* ───────── easy exits ───────── */
  if (loading)
    return <Box sx={{mt:4,textAlign:'center'}}><CircularProgress/></Box>;

  if (!survey || !survey.questions?.length)
    return (
      <Paper sx={{p:4}}>
        <Typography>No survey has been configured for this event.</Typography>
        <Button sx={{mt:2}} onClick={() => navigate('/my-attendance')}>Back</Button>
      </Paper>
    );

  /* ───────── handlers ───────── */
  const handleChange = (qid, val) =>
    setAnswers(a => ({ ...a, [qid]: val }));

  const handleSubmit = async () => {
    /* quick completeness-check: show first unanswered mandatory q */
    const missing = survey.questions.find(q => answers[q.id] === undefined || answers[q.id] === '' || (Array.isArray(answers[q.id]) && !answers[q.id].length));
    if (missing) {
      toast.warn('Please answer all questions');
      return;
    }

    try {
      const payload = Object.entries(answers).map(([qId, ans]) => ({
        questionId: +qId, answer: ans
      }));
      await api.post(`/surveys/${survey.id}/response`, { answers: payload });
      toast.success('Thank you for completing the survey!');
      navigate('/my-attendance');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error submitting');
    }
  };

  /* ───────── render ───────── */
  return (
    <Paper sx={{p:4, maxWidth:800, mx:'auto'}}>
      <Typography variant="h5" gutterBottom>Event Survey</Typography>

      {survey.questions.map(q => (
        <Box key={q.id} sx={{mb:3}}>
          <Typography sx={{mb:1}}>{q.question}</Typography>

          {/* SHORT TEXT ------------------------------------------------- */}
          {q.qType === 'short' && (
            <TextField
              fullWidth
              value={answers[q.id] ?? ''}
              onChange={e => handleChange(q.id, e.target.value)}
            />
          )}

          {/* SINGLE-CHOICE MCQ ----------------------------------------- */}
          {q.qType === 'mcq' && q.options.length ? (
            q.options.map(opt => (
              <FormControlLabel
                key={opt}
                control={
                  <Radio
                    checked={answers[q.id] === opt}
                    onChange={() => handleChange(q.id, opt)}
                  />
                }
                label={opt}
              />
            ))
          ) : q.qType === 'mcq' ? (
            <Typography color="text.secondary">⚠ No options configured</Typography>
          ) : null}

          {/* MULTI-SELECT CHECKBOX ------------------------------------- */}
          {q.qType === 'checkbox' && q.options.length ? (
            q.options.map(opt => (
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
                  />
                }
                label={opt}
              />
            ))
          ) : q.qType === 'checkbox' ? (
            <Typography color="text.secondary">⚠ No options configured</Typography>
          ) : null}

          {/* 1-5 RATING ------------------------------------------------- */}
          {q.qType === 'rating' && (
            <Rating
              value={answers[q.id] ?? 0}
              onChange={(_, val) => handleChange(q.id, val)}
            />
          )}
        </Box>
      ))}

      <Button variant="contained" onClick={handleSubmit}>Submit</Button>
    </Paper>
  );
}
