// Route Optimizer Service
// Returns optimized route details with fuel and time savings

function optimizeRoute(origin, destination, distanceKm) {
  // Simulate route calculation
  const avgSpeedKmh = 30; // city speed
  const fuelEfficiencyKmL = 14;
  const fuelPricePerL = 102; // INR

  const travelTimeMin = Math.round((distanceKm / avgSpeedKmh) * 60);
  const fuelUsedL = distanceKm / fuelEfficiencyKmL;
  const fuelCostINR = (fuelUsedL * fuelPricePerL).toFixed(0);

  // Savings vs non-optimized (20% longer route)
  const baselineDistanceKm = distanceKm * 1.2;
  const savedDistanceKm = (baselineDistanceKm - distanceKm).toFixed(1);
  const savedTimeMins = Math.round(savedDistanceKm / avgSpeedKmh * 60);
  const savedFuelCost = ((savedDistanceKm / fuelEfficiencyKmL) * fuelPricePerL).toFixed(0);

  // Waypoints for visual route display
  const waypoints = generateWaypoints(origin, destination, distanceKm);

  return {
    origin,
    destination,
    distanceKm,
    travelTimeMin,
    fuelCostINR: parseInt(fuelCostINR),
    optimizationSavings: {
      distanceKm: parseFloat(savedDistanceKm),
      timeMin: savedTimeMins,
      fuelCostINR: parseInt(savedFuelCost),
      co2Kg: parseFloat((parseFloat(savedDistanceKm) * 0.12).toFixed(2)),
    },
    waypoints,
  };
}

function generateWaypoints(origin, destination, distanceKm) {
  // Generate intermediate points for a smooth route line
  const steps = 4;
  return Array.from({ length: steps }, (_, i) => ({
    step: i + 1,
    label: i === 0 ? 'Pickup Point' : i === steps - 1 ? 'Delivery Point' : `Checkpoint ${i}`,
    distanceFromStart: parseFloat(((distanceKm / steps) * (i + 1)).toFixed(1)),
    timeMin: Math.round((distanceKm / steps / 30) * 60 * (i + 1)),
  }));
}

module.exports = { optimizeRoute };
