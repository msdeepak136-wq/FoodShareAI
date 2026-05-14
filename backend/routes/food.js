const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { predictSpoilage } = require('../services/aiPredictor');

// GET /api/food - list all food items
router.get('/', (req, res) => {
  res.json({ success: true, data: db.foods });
});

// POST /api/food - add a new food item
router.post('/', (req, res) => {
  const { name, type, quantity, unit, hoursRemaining, location, role } = req.body;

  if (!name || !type || !quantity || !hoursRemaining) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const ai = predictSpoilage(type, parseFloat(quantity), parseFloat(hoursRemaining));

  const food = {
    id: uuidv4(),
    name,
    type,
    quantity: parseFloat(quantity),
    unit: unit || 'kg',
    hoursRemaining: parseFloat(hoursRemaining),
    location: location || 'Unknown',
    role: role || 'farmer',
    ai,
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  db.foods.push(food);
  res.status(201).json({ success: true, data: food });
});

// GET /api/food/:id - get single food item
router.get('/:id', (req, res) => {
  const food = db.foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  res.json({ success: true, data: food });
});

// PATCH /api/food/:id/status - update food status
router.patch('/:id/status', (req, res) => {
  const food = db.foods.find((f) => f.id === req.params.id);
  if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
  food.status = req.body.status || food.status;
  res.json({ success: true, data: food });
});

module.exports = router;
