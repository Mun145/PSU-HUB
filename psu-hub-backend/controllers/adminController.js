// psu-hub-backend/controllers/adminController.js

const { Registration, Attendance, Event, User } = require('../models');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');
const axios = require('axios');

/**
 * PATCH /api/admin/registrations/:id/mark-attended
 */
exports.markAsAttended = async (req, res, next) => {
  try {
    const regId = req.params.id;
    const { attended } = req.body;

    const registration = await Registration.findByPk(regId);
    if (!registration) throw new AppError('Registration not found', 404, 'NOT_FOUND');

    registration.attended = attended;
    await registration.save();

    if (attended) {
      await Attendance.findOrCreate({
        where: { user_id: registration.userId, event_id: registration.eventId },
        defaults: { scan_time: new Date() }
      });
    } else {
      await Attendance.destroy({
        where: { user_id: registration.userId, event_id: registration.eventId }
      });
    }

    // Return the fresh event with both lists
    const freshEvent = await Event.findByPk(registration.eventId, {
      include: [
        { model: Registration, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
        { model: Attendance,   include: [{ model: User, attributes: ['id', 'name', 'email'] }] }
      ]
    });

    return sendSuccess(res, freshEvent, 'Attendance updated');
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/chatbot
 * Body: { prompt: string }
 */
exports.chatbotAssistant = async (req, res, next) => {
  try {
    const userPrompt = (req.body.prompt || '').trim();
    if (!userPrompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Build a one-line prompt
    const prompt = `Suggest three concise event ideas for a Saudi university in Riyadh, each in one sentence: ${userPrompt}`;

    // Call the Hugging Face Inference API (flan-t5-base)
    const hfRes = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-base',
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 80,
          do_sample: true,
          top_p: 0.9,
          temperature: 0.7
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the generated text
    const generated = Array.isArray(hfRes.data)
      ? hfRes.data[0]?.generated_text
      : hfRes.data.generated_text || '';

    // Strip out our original prompt if echoed, then trim
    const responseText = generated.replace(prompt, '').trim();

    return res.json({ response: responseText });
  } catch (err) {
    console.error('Chatbot error:', err.response?.data || err.message);
    next(err);
  }
};
