// psu-hub-backend/controllers/surveyController.js
const { Survey, SurveyQuestion, SurveyResponse, Event, Certificate, User } = require('../models');
const AppError        = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');
const generatePNG     = require('../utils/certificateGenerator');

/* ─────────────────────────  A.  createSurvey  ───────────────────────── */
exports.createSurvey = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) throw new AppError('Event not found', 404);

    /* (idempotent) return existing */
    const [survey] = await Survey.findOrCreate({
      where   : { eventId },
      defaults: {
        /* sensible default title, NOT-NULL constraint satisfied */
        title: `${event.title} – Feedback`
      }
    });

    return sendSuccess(res, survey, 'Survey ready');
  } catch (err) { next(err); }
};

/* ─────────────────────────  B.  add / replace Qs  ───────────────────── */
exports.addQuestions = async (req, res, next) => {
  try {
    const surveyId       = req.params.id;
    const { questions=[] } = req.body;

    const survey = await Survey.findByPk(surveyId);
    if (!survey) throw new AppError('Survey not found', 404);

    await SurveyQuestion.destroy({ where: { surveyId } });
    /* map options (comma-string → array) if admin sent text */
    await SurveyQuestion.bulkCreate(
      questions.map(q => ({
        surveyId,
        question : q.question,
        qType    : q.qType,
        options  : q.options?.length ? q.options : null          // null for short / rating
      }))
    );

    const out = await SurveyQuestion.findAll({ where: { surveyId } });
    return sendSuccess(res, out, 'Questions saved');
  } catch (err) { next(err); }
};

/* ─────────────────────────  C.  faculty GET  ────────────────────────── */
exports.getByEvent = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      where : { eventId: req.params.eventId },
      include: { model: SurveyQuestion, as: 'questions' }
    });
    if (!survey) throw new AppError('Survey not found', 404);
    return sendSuccess(res, survey, 'Survey fetched');
  } catch (err) { next(err); }
};

/* ─────────────────────────  D.  submitResponse  ─────────────────────── */
exports.submitResponse = async (req, res, next) => {
  try {
    const surveyId = req.params.id;
    const userId   = req.user.id;
    const { answers } = req.body;

    if (await SurveyResponse.findOne({ where: { surveyId, userId } }))
      throw new AppError('Survey already submitted', 400);

    await SurveyResponse.create({ surveyId, userId, answers });

    /* auto-certificate (if enabled) */
    const survey = await Survey.findByPk(surveyId, { include: Event });
    let certificateUrl = null;

    if (survey.Event.hasCertificate) {
      const [cert] = await Certificate.findOrCreate({
        where: { userId, eventId: survey.Event.id },
        defaults: { issuedAt: new Date() }
      });
      if (!cert.fileUrl) {
        const user = await User.findByPk(userId);
        cert.fileUrl = await generatePNG({
          userName   : user.name,
          eventTitle : survey.Event.title,
          certId     : cert.id
        });
        await cert.save();
      }
      certificateUrl = cert.fileUrl;
    }

    return sendSuccess(res, { certificateUrl }, 'Survey submitted – thank you!');
  } catch (err) { next(err); }
};
