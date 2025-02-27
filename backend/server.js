const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const routes = require('./routes/index.routes');
const dailyUpdateRoutes = require('./routes/dailyupdate.routes');
const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const studentRoutes = require('./routes/student.routes');
const leaveRequestRoutes = require('./routes/leaveRequest.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const subjectsRoutes = require('./routes/subjects.routes');
const testSubmissionRoutes = require('./routes/testsubmission.routes');
const uploadRoutes = require('./routes/upload.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Set a fixed port, ignoring environment variables
const PORT = 4000;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/leave-requests', leaveRequestRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/daily-updates', dailyUpdateRoutes);
app.use('/api/test-submissions', testSubmissionRoutes);  
app.use('/api/', subjectsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
