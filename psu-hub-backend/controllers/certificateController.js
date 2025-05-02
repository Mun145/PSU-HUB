const { User, Event, Certificate } = require('../models');
const PDFDocument  = require('pdfkit');
const fs           = require('fs');
const path         = require('path');
const AppError     = require('../utils/AppError');
const { sendSuccess } = require('../utils/responseHelper');
const generatePNG   = require('../utils/certificateGenerator');        // the canvas-PNG version

/* ------------------------------------------------------------------ */
/*  quick helper – returns Certificate instance with fresh PNG url    */
/* ------------------------------------------------------------------ */
async function buildCertificate({ userId, event }) {
  const [cert] = await Certificate.findOrCreate({
    where   : { userId, eventId: event.id },
    defaults: { issuedAt: new Date() }
  });

  if (!cert.fileUrl) {
    const user = await User.findByPk(userId);
    cert.fileUrl = await generatePNG({
      userName   : user.name,
      eventTitle : event.title,
      certId     : cert.id
    });
  }
  cert.issuedAt = new Date();
  await cert.save();
  return cert;
}

/* ========================================================= */
/*  Normal flow – user hits “Finish Survey”                  */
/* ========================================================= */
exports.generate = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.eventId);
    const user  = await User.findByPk(req.user.id);
    if (!event || !user) throw new AppError('Invalid user / event', 404);

    const cert = await buildCertificate({ userId: user.id, event });
    return sendSuccess(res, cert, 'Certificate generated');
  } catch (err) { next(err); }
};


/* ========================================================= */
/*  Admin → re-issue                                         */
/*  POST /api/admin/certificates/:eventId/reissue/:userId    */
/* ========================================================= */
exports.reIssue = async (req, res, next) => {
  try {
    const { eventId, userId } = req.params;
    const event = await Event.findByPk(eventId);
    if (!event) throw new AppError('Event not found', 404);
    const cert  = await buildCertificate({ userId, event });
    return sendSuccess(res, cert, 'Certificate re-issued');
  } catch (e) { next(e); }
};

/* ========================================================= */
/*  Admin → revoke                                           */
/*  DELETE /api/admin/certificates/:eventId/:userId          */
/* ========================================================= */
exports.revoke = async (req, res, next) => {
  try {
    const { eventId, userId } = req.params;
    await Certificate.destroy({ where: { eventId, userId } });
    return sendSuccess(res, null, 'Certificate revoked');
  } catch (e) { next(e); }
};
