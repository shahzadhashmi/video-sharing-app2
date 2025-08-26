// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed origins
const allowedOrigins = [
  'http://localhost:5173', // dev frontend
  'https://red-pebble-0def29e03.2.azurestaticapps.net' // production frontend
];

// CORS configuration
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser tools
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `CORS blocked for origin ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  exposedHeaders: ['Authorization']
}));

// Parse JSON
app.use(bodyParser.json());

// Enable preflight for all routes
app.options('*', cors());

// --- Example Routes ---

// Videos routes
app.get('/api/videos/featured', (req, res) => {
  res.json({ videos: ['video1', 'video2', 'video3'] });
});

app.get('/api/videos/trending', (req, res) => {
  res.json({ videos: ['trending1', 'trending2'] });
});

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { username, password } = req.body;
  // Fake signup logic
  res.json({ message: `User ${username} signed up successfully!` });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  // Fake login logic
  res.json({ message: `User ${username} logged in successfully!` });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
