const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const labRoutes = require('./routes/labRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const toRoutes = require('./routes/toRoutes');
const lecturerRoutes = require('./routes/lecturerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');              // add: basic security headers
const rateLimit = require('express-rate-limit');

const app = express();
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,        // turn on later when you build a CSP
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,                 // total requests per IP per window
});
app.use(limiter);

connectDB();

// app.use(cors());
// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',             // local dev (Vite)
  'https://lab-mate-modified.vercel.app'  // your deployed Vercel frontend
  // 'https://your-custom-domain.com'  // optional: if you add a custom domain
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  // credentials: true, // ❓ keep only if using cookies/sessions; remove if using JWT in headers
}));

app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/to', toRoutes);
app.use('/api/lecturers', lecturerRoutes);
app.use('/api/students', studentRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});