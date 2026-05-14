// NGO Matcher Service
// Pairs available food with the best-fit NGO based on distance and capacity

const db = require('../database');

function matchFoodToNGO(food) {
  const ngos = db.ngos;

  // Score each NGO: lower distance = better, higher capacity = better
  const scored = ngos.map((ngo) => {
    const distanceScore = Math.max(0, 100 - ngo.distance * 8);
    const capacityScore = Math.min(50, ngo.capacity / 10);
    const score = distanceScore + capacityScore;
    return { ...ngo, score: Math.round(score) };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top 3 matches
  return scored.slice(0, 3).map((ngo, index) => ({
    ...ngo,
    matchRank: index + 1,
    estimatedArrival: `${Math.round(ngo.distance * 4)} mins`,
    compatibilityPercent: Math.max(60, ngo.score),
  }));
}

module.exports = { matchFoodToNGO };
