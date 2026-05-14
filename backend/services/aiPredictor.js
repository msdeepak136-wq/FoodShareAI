// AI Spoilage Predictor Service
// Dynamically evaluates spoilage risk based on food type, quantity, and hours remaining

const spoilageProfiles = {
  // [baseRiskScore, decayRate]  score 0-100
  dairy:       { baseRisk: 60, decayRate: 4.5, quickWin: true },
  meat:        { baseRisk: 75, decayRate: 6.0, quickWin: true },
  seafood:     { baseRisk: 80, decayRate: 7.0, quickWin: true },
  vegetables:  { baseRisk: 45, decayRate: 3.0, quickWin: false },
  fruits:      { baseRisk: 40, decayRate: 2.5, quickWin: false },
  bakery:      { baseRisk: 35, decayRate: 2.0, quickWin: false },
  cooked:      { baseRisk: 55, decayRate: 5.0, quickWin: true },
  grains:      { baseRisk: 10, decayRate: 0.5, quickWin: false },
  beverages:   { baseRisk: 20, decayRate: 1.0, quickWin: false },
  other:       { baseRisk: 30, decayRate: 2.0, quickWin: false },
};

function predictSpoilage(foodType, quantity, hoursRemaining) {
  const type = foodType.toLowerCase();
  const profile = spoilageProfiles[type] || spoilageProfiles['other'];

  // Calculate decay factor: less time = higher risk
  const timeFactor = Math.max(0, 1 - (hoursRemaining / 72));

  // Quantity factor: large quantities decay faster at scale
  const quantityFactor = Math.min(1, quantity / 200);

  // Final risk score (0-100)
  const riskScore = Math.min(
    100,
    profile.baseRisk + (timeFactor * profile.decayRate * 10) + (quantityFactor * 5)
  );

  let riskLevel, urgency, recommendation;

  if (riskScore >= 70) {
    riskLevel = 'HIGH';
    urgency = 'Needs immediate action within ' + Math.max(1, Math.round(hoursRemaining)) + ' hours';
    recommendation = 'Dispatch to nearest NGO immediately';
  } else if (riskScore >= 40) {
    riskLevel = 'MEDIUM';
    urgency = 'Schedule donation within ' + Math.round(hoursRemaining) + ' hours';
    recommendation = 'Match with NGO and plan route now';
  } else {
    riskLevel = 'LOW';
    urgency = 'Food is stable, can wait up to ' + Math.round(hoursRemaining) + ' hours';
    recommendation = 'Add to donation pool and monitor';
  }

  const co2Saved = (quantity * 2.5).toFixed(1); // kg CO2 per kg food saved
  const mealsSaved = Math.floor(quantity * 2.8); // ~2.8 meals per kg

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    urgency,
    recommendation,
    isQuickWin: profile.quickWin && riskScore >= 60,
    impact: {
      co2Saved: parseFloat(co2Saved),
      mealsSaved,
    },
  };
}

module.exports = { predictSpoilage };
