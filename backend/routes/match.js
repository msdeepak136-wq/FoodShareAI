const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const { matchFoodToNGO } = require('../services/matcher');
const { optimizeRoute } = require('../services/optimizer');

// POST /api/match - match a food item to NGOs and get route
router.post('/', (req, res) => {
  const { foodId } = req.body;

  const food = db.foods.find((f) => f.id === foodId);
  if (!food) return res.status(404).json({ success: false, message: 'Food item not found' });

  const matches = matchFoodToNGO(food);
  const topNGO = matches[0];

  const route = optimizeRoute(
    food.location || 'Your Location',
    topNGO.location,
    topNGO.distance
  );

  // Record delivery
  const delivery = {
    id: uuidv4(),
    foodId: food.id,
    foodName: food.name,
    ngoId: topNGO.id,
    ngoName: topNGO.name,
    route,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.deliveries.push(delivery);
  food.status = 'matched';

  res.json({ success: true, data: { food, matches, route, delivery } });
});

// GET /api/match/analytics - get overall impact stats
router.get('/analytics', (req, res) => {
  const totalItems = db.foods.length;
  const matchedItems = db.foods.filter((f) => f.status === 'matched').length;
  const totalMealsSaved = db.foods.reduce((sum, f) => sum + (f.ai?.impact?.mealsSaved || 0), 0);
  const totalCO2Saved = db.foods.reduce((sum, f) => sum + (f.ai?.impact?.co2Saved || 0), 0);
  const totalQuantityKg = db.foods.reduce((sum, f) => sum + (f.quantity || 0), 0);

  res.json({
    success: true,
    data: {
      totalItems,
      matchedItems,
      availableItems: totalItems - matchedItems,
      totalMealsSaved,
      totalCO2Saved: parseFloat(totalCO2Saved.toFixed(1)),
      totalQuantityKg: parseFloat(totalQuantityKg.toFixed(1)),
      deliveries: db.deliveries.length,
    },
  });
});

module.exports = router;
