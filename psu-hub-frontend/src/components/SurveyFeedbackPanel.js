// SurveyFeedbackPanel.js
import React from 'react';
import {
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Bar } from 'react-chartjs-2';

/**
 * Props:
 *   summary = selectedEvent.SurveySummary  (or null)
 */
export default function SurveyFeedbackPanel ({ summary }) {
  if (!summary) {
    return <Typography>No survey data yet.</Typography>;
  }

  if (!summary.questions.length) {
    return <Typography>No questions were defined for this survey.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {summary.questions.map((q, idx) => {
        if (q.qType === 'short') {
          return (
            <Accordion key={q.id || idx} disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 500 }}>
                  {idx + 1}. {q.question} &nbsp;
                  <Chip
                    label={`${q.answers.length} answers`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {q.answers.length ? (
                  q.answers.map((ans, i) => (
                    <Typography key={i} sx={{ mb: 1 }}>
                      • {ans}
                    </Typography>
                  ))
                ) : (
                  <Typography color="text.secondary">
                    No responses for this question.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          );
        }

        if (q.qType === 'rating') {
          return (
            <Box key={q.id || idx}>
              <Typography sx={{ fontWeight: 500, mb: 1 }}>
                {idx + 1}. {q.question}
              </Typography>
              <Typography variant="h4" sx={{ mb: 0.5 }}>
                ⭐ {q.average} / 5
              </Typography>
              <Typography color="text.secondary">
                {q.responseCnt} responses
              </Typography>
            </Box>
          );
        }

        // mcq or checkbox  → bar chart
        const labels = Object.keys(q.counts);
        const counts = Object.values(q.counts);

        return (
          <Box key={q.id || idx}>
            <Typography sx={{ fontWeight: 500, mb: 2 }}>
              {idx + 1}. {q.question}
            </Typography>
            <Box sx={{ height: 250, maxWidth: 600 }}>
              <Bar
                data={{
                  labels,
                  datasets: [
                    {
                      label: 'Responses',
                      data : counts
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    x: { ticks: { autoSkip: false } },
                    y: { beginAtZero: true, precision: 0 }
                  }
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
