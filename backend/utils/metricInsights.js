const healthMetrics = require('../constants/healthMetrics');

function getMetricInsights(value, min, max, name) {
  let finalMin = min;
  let finalMax = max;

  if (finalMin == null || finalMax == null || (finalMin === 0 && finalMax === 0)) {
    const key = Object.keys(healthMetrics).find(k => 
      name.toLowerCase().includes(k.toLowerCase()) || 
      k.toLowerCase().includes(name.toLowerCase())
    );
    if (key) {
      finalMin = healthMetrics[key].min;
      finalMax = healthMetrics[key].max;
    }
  }

  if (finalMin == null || finalMax == null) {
    return 'Detailed insights are not available because normal ranges for this metric are unknown.';
  }

  const range = finalMax - finalMin;
  const ratio = (value - finalMin) / range;
  // ratio = 0 at exactly min
  // ratio = 1 at exactly max
  // ratio = 0.5 at perfect middle

  let levelText = '';
  let advice = '';

  if (ratio < -0.5) {
    levelText = 'Dangerously Low (Level 1/10)';
    advice = `Your ${name} is critically below the normal range (${finalMin}-${finalMax}). This requires immediate medical attention. Please consult a healthcare professional as soon as possible.`;
  } else if (ratio < -0.2) {
    levelText = 'Significantly Low (Level 2/10)';
    advice = `Your ${name} is significantly below the normal range. You should schedule an appointment with your doctor to investigate the underlying cause.`;
  } else if (ratio < 0) {
    levelText = 'Slightly Low (Level 3/10)';
    advice = `Your ${name} is just barely below the normal minimum of ${finalMin}. While not usually an emergency, monitor this and discuss it at your next checkup. Consider lifestyle or dietary adjustments to boost it if appropriate.`;
  } else if (ratio < 0.2) {
    levelText = 'Low Normal (Level 4/10)';
    advice = `Your ${name} is within the normal range, but on the lower end. This is generally healthy, but maintaining a balanced diet and regular exercise is recommended to keep it stable.`;
  } else if (ratio < 0.4) {
    levelText = 'Optimal Lower-Mid (Level 5/10)';
    advice = `Your ${name} is in an excellent, optimal range. Keep up your current healthy habits, as this level indicates good metabolic balance for this metric.`;
  } else if (ratio < 0.6) {
    levelText = 'Perfectly Optimal (Level 6/10)';
    advice = `Your ${name} is right in the middle of the ideal range. This is the optimal target. Continue your current lifestyle and dietary habits to maintain this excellent result!`;
  } else if (ratio < 0.8) {
    levelText = 'Optimal Upper-Mid (Level 7/10)';
    advice = `Your ${name} is healthy and within the normal limits, leaning slightly toward the upper end. This is perfectly fine, just continue monitoring it during your routine annual tests.`;
  } else if (ratio <= 1.0) {
    levelText = 'High Normal (Level 8/10)';
    advice = `Your ${name} is normal but sitting right at the upper limit of ${finalMax}. You might want to consider minor dietary or lifestyle adjustments to prevent it from crossing into the elevated range.`;
  } else if (ratio <= 1.3) {
    levelText = 'Elevated / Borderline High (Level 9/10)';
    advice = `Your ${name} is slightly elevated above the normal maximum. This may act as an early warning sign. You should focus on proactive lifestyle changes, such as diet and exercise, and discuss this with your doctor.`;
  } else {
    levelText = 'Significantly High (Level 10/10)';
    advice = `Your ${name} is dangerously above the normal range (${finalMin}-${finalMax}). This is a critical result that requires medical evaluation. Please consult your healthcare provider promptly to discuss a treatment plan.`;
  }

  return `📊 Severity: ${levelText}\n\n💡 Insight & Advice: ${advice}`;
}

module.exports = { getMetricInsights };
