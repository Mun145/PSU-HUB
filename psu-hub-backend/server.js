//psu-hub-backend/server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./services/logger');
const rateLimiter = require('./middleware/rateLimiter');
const { sequelize } = require('./models');
const path = require('path');

// Existing route imports
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const surveyRoutes   = require('./routes/surveyRoutes');
const certificateRoutes = require('./routes/certificateRoutes');

// NEW admin routes import
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

const io = require('socket.io')(server, {
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://your-production-domain.com'
        : process.env.DEV_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.locals.io = io;

io.on('connection', (socket) => {
  logger.info('A client connected', { socketId: socket.id });
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

app.use(
  helmet({crossOriginResourcePolicy: { policy: 'cross-origin' }})
);
app.use(rateLimiter);

const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? ['https://your-production-domain.com']
    : [process.env.DEV_ORIGIN || 'http://localhost:3000'];

    app.use(cors({
        origin: true,               
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']
      }));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('PSU Hub Backend with Socket.io is running!');
});

sequelize.authenticate()
  .then(() => logger.info('✅ MySQL Database connected!'))
  .catch((err) => logger.error('❌ MySQL Connection Error', { error: err.message }));

if (process.env.NODE_ENV !== 'production') {
  sequelize.sync();
}

// Mount existing routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/certificates', certificateRoutes);


// Mount new admin routes under /api/admin
app.use('/api/admin', adminRoutes);

// Serve static files *with* CORS so the frontend (port 3000) can fetch images
app.use(
    '/uploads',
    cors({ origin: allowedOrigins, credentials: true }),
    express.static(path.join(__dirname, 'uploads'))
  );

  /* ---- NEW: nicer /certificates path that maps to the same folder ---- */ // << UPDATE
app.use(
    '/certificates',
    cors({ origin: allowedOrigins, credentials: true }),
    express.static(path.join(__dirname, 'uploads', 'certificates'))
  );

app.post('/api/notify', (req, res) => {
  const { message } = req.body;
  io.emit('newNotification', { message, timestamp: new Date() });
  res.json({ message: 'Notification sent' });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
    user: req.user ? req.user.id : 'Guest'
  });
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => logger.info(`🚀 Backend server running on port ${PORT}`));
