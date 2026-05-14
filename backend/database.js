// In-memory database for FoodNova demo
const { v4: uuidv4 } = require('uuid');

const db = {
  foods: [],
  ngos: [
    {
      id: uuidv4(),
      name: 'Akshaya Patra Foundation',
      location: 'Bengaluru Central',
      lat: 12.9716,
      lng: 77.5946,
      capacity: 500,
      contact: '+91 80 3014 7000',
      category: 'Mid-Day Meals',
      distance: 2.1,
    },
    {
      id: uuidv4(),
      name: 'Robin Hood Army',
      location: 'Koramangala',
      lat: 12.9352,
      lng: 77.6245,
      capacity: 200,
      contact: '+91 98765 43210',
      category: 'Community Kitchens',
      distance: 3.7,
    },
    {
      id: uuidv4(),
      name: 'No Food Waste',
      location: 'Whitefield',
      lat: 12.9698,
      lng: 77.7499,
      capacity: 350,
      contact: '+91 90000 11222',
      category: 'Orphanages & Shelters',
      distance: 9.2,
    },
    {
      id: uuidv4(),
      name: 'Feeding India',
      location: 'Indiranagar',
      lat: 12.9784,
      lng: 77.6408,
      capacity: 150,
      contact: '+91 80 4567 8910',
      category: 'Disaster Relief',
      distance: 5.4,
    },
  ],
  deliveries: [],
};

module.exports = db;
