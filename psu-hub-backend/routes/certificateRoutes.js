/* routes/certificateRoutes.js */
const router        = require('express').Router();
const { Certificate, User, Event } = require('../models');
const auth       = require('../middleware/auth');
const roleCheck  = require('../middleware/roleCheck');
const { sendSuccess } = require('../utils/responseHelper');

// GET /api/certificates/my
router.get('/my', auth, async (req, res, next) => {
  try {
    const certs = await Certificate.findAll({ where: { userId: req.user.id } });
    return sendSuccess(res, certs, 'Certificates fetched');
  } catch (err) { next(err); }
});

// GET /api/certificates/all  (admin view in CertificatesAdmin.js)
router.get('/all', auth, roleCheck('admin'), async (_req, res, next) => {
    try {
      const certs = await Certificate.findAll({
        include: [
          { model: User,  attributes: ['id','name','email'] },
          { model: Event, attributes: ['id','title'] }
        ],
        order: [['issuedAt', 'DESC']]
      });
      return sendSuccess(res, certs, 'All certificates fetched');
    } catch (err) { next(err); }
  });

module.exports = router;
