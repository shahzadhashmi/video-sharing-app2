import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins (frontend URLs)
const allowedOrigins = [
  'http://localhost:5173', // development
  'https://red-pebble-0def29e03.2.azurestaticapps.net' // production
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or server-to-server requests
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error(`CORS blocked for origin ${origin}`), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Parse JSON
app.use(express.json());

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// Error logging middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});
