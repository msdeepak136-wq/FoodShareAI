const express = require('express');
const cors = require('cors');

const foodRoutes = require('./routes/food');
const ngoRoutes = require('./routes/ngos');
const matchRoutes = require('./routes/match');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/food', foodRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/match', matchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FoodNova API is running 🟢' });
});

app.listen(PORT, () => {
  console.log(`✅ FoodNova backend running at http://localhost:${PORT}`);
});

module.exports = app;
