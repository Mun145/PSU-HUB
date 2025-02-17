require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db'); // Sequelize instance

// Import models
const User = require('./models/User');
const Event = require('./models/Event');
const Attendance = require('./models/Attendance');
const surveyRoutes = require('./routes/surveyRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

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

// Check DB connection and sync models
sequelize.authenticate()
  .then(() => console.log('✅ MySQL Database connected!'))
  .catch(err => console.error('❌ MySQL Connection Error:', err));

sequelize.sync({ alter: true })
  .then(() => console.log('✅ Database synchronized with models'))
  .catch(err => console.error('❌ Error syncing database:', err));

// Import and register routes
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
