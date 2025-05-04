// psu-hub-backend/controllers/analyticsController.js
const { Event, Registration, Attendance, User, Certificate, sequelize } = require('../models');
const { Op }         = require('sequelize');
const AppError       = require('../utils/AppError');
const { sendSuccess }= require('../utils/responseHelper');

/* ──────────── survey aggregation helper ──────────── */
async function buildSurveySummary (eventId) {
  const { Survey, SurveyQuestion, SurveyResponse } = require('../models');

  // Does this event even have a survey?
  const survey = await Survey.findOne({ where: { eventId } });
  if (!survey) return null;

  // Fetch questions & all responses
  const questions = await SurveyQuestion.findAll({ where: { surveyId: survey.id } });
  const responses = await SurveyResponse.findAll({ where: { surveyId: survey.id } });

  // Prepare counts
  const summary = {
    responseCount : responses.length,
    questions     : []          // each question’s analytics pushed below
  };

  // Build a map of answers for quick lookup
  const answerArrays = responses.map(r => r.answers); // each is [{questionId, answer}]
  const answersByQ   = new Map();                     // questionId ➜ array of answers

  answerArrays.forEach(arr => {
    arr.forEach(({ questionId, answer }) => {
      if (!answersByQ.has(questionId)) answersByQ.set(questionId, []);
      answersByQ.get(questionId).push(answer);        // push raw answer
    });
  });

  // Loop over each question and summarise
  for (const q of questions) {
    const incoming = answersByQ.get(q.id) || [];

    if (q.qType === 'short') {
      summary.questions.push({
        id       : q.id,
        question : q.question,
        qType    : 'short',
        answers  : incoming                          // list of strings
      });
    } else if (q.qType === 'rating') {
      const nums = incoming.map(n => Number(n)).filter(Boolean);
      const avg  = nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
      summary.questions.push({
        id          : q.id,
        question    : q.question,
        qType       : 'rating',
        average     : +avg.toFixed(2),
        responseCnt : nums.length
      });
    } else { // mcq / checkbox
      // Flatten checkbox answers (they come as arrays)
      const flat = incoming.flat();
      const counts = {};
      (q.options || []).forEach(opt => { counts[opt] = 0; }); // init all to 0
      flat.forEach(ans => { counts[ans] = (counts[ans] || 0) + 1; });

      summary.questions.push({
        id        : q.id,
        question  : q.question,
        qType     : q.qType,
        counts    : counts,              // { option: number }
        totalResp : flat.length
      });
    }
  }

  return summary;
}


/* ───────────────────────── OVERVIEW ───────────────────────── */
exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    const [ totalEvents, totalAttendances, totalUsers, approvedEvents ] = await Promise.all([
      Event.count(),
      Attendance.count(),
      User.count(),
      Event.count({ where: { status: 'approved' } })
    ]);

    return sendSuccess(
      res,
      { totalEvents, approvedEvents, totalAttendance: totalAttendances, totalUsers },
      'Overview analytics fetched'
    );
  } catch (err) { next(err); }
};

/* ──────────────────────── PER-EVENT LIST ───────────────────── */
exports.getAllEventAnalytics = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      attributes : {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS A WHERE A.event_id = Event.id)'
            ),
            'attendeeCount'
          ]
        ]
      },
      order: [['createdAt', 'DESC']]
    });

    return sendSuccess(res, events, 'Event analytics fetched');
  } catch (err) { next(err); }
};

/* ────────────────── SINGLE EVENT – FULL DETAILS ────────────── */
exports.getEventDetailedAnalytics = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        /* all sign-ups */
        {
          model   : Registration,
          include : [{ model: User, attributes: ['id','name','email'] }]
        },
        /* attended list (+ certificate, if any) */
        {
          model   : Attendance,
          include : [
            { model: User,        attributes: ['id','name','email'] },
            { model: Certificate, as: 'Certificate', attributes: ['fileUrl'] }   
          ]
        }
      ]
    });

    if (!event) throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    
    event.dataValues.SurveySummary = await buildSurveySummary(event.id);

    return sendSuccess(res, event, 'Detailed event analytics fetched');
  } catch (err) { next(err); }
};

/* ────────────────────── ADVANCED ANALYTICS ─────────────────── */
exports.getAdvancedAnalytics = async (req, res, next) => {
  try {
    /* top N events by attendance */
    const topEvents = await Event.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM `Attendances` AS A WHERE A.event_id = Event.id)'
            ),
            'attendanceCount'
          ]
        ]
      },
      order : [[sequelize.literal('attendanceCount'), 'DESC']],
      limit : 5
    });

    /* range-filtered attendance count */
    const { startDate, endDate } = req.query;
    const whereScan = startDate && endDate
      ? { scan_time: { [Op.between]: [new Date(startDate), new Date(endDate)] } }
      : {};

    const totalRangeAttendance = await Attendance.count({ where: whereScan });

    return sendSuccess(
      res,
      { topEvents, totalRangeAttendance },
      'Advanced analytics fetched'
    );
  } catch (err) { next(err); }
};
