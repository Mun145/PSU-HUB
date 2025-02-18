require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db'); // Sequelize instance
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const Attendance = require('./models/Attendance');
const surveyRoutes = require('./routes/surveyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Apply rate limiting to all routes
app.use(rateLimiter);

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('PSU Hub Backend is running with MySQL!');
});

// Define associations (relationships)
User.hasMany(Attendance, { foreignKey: 'user_id' });
Attendance.belongsTo(User, { foreignKey: 'user_id' });
Event.hasMany(Attendance, { foreignKey: 'event_id' });
Attendance.belongsTo(Event, { foreignKey: 'event_id' });

// Check DB connection
sequelize.authenticate()
  .then(() => logger.info('✅ MySQL Database connected!'))
  .catch(err => logger.error('❌ MySQL Connection Error', { error: err.message }));

// Sync models
sequelize.sync({ alter: true })
  .then(() => logger.info('✅ Database synchronized with models'))
  .catch(err => logger.error('❌ Error syncing database', { error: err.message }));

// Import and register routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error-handling middleware (last)
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`🚀 Backend server running on port ${PORT}`);
});
