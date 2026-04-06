

export interface PatientMetrics {
  bmi?: number;
  systolicBP?: number;
  age?: number;
}

export const predictDiabetesRisk = (metrics: PatientMetrics) => {
  const { bmi = 0, systolicBP = 0 } = metrics;

  // Weighted logic: BMI and BP are major indicators
  let score = 0;
  if (bmi > 30) score += 3;
  else if (bmi > 25) score += 1;
  
  if (systolicBP > 140) score += 2;
  else if (systolicBP > 120) score += 1;

  if (score >= 4) return { level: "High Risk", color: "bg-red-500", iconColor: "text-red-100", message: "Consult a specialist for a metabolic screening." };
  if (score >= 2) return { level: "Moderate Risk", color: "bg-orange-500", iconColor: "text-orange-100", message: "Consider lifestyle adjustments and regular monitoring." };
  return { level: "Low Risk", color: "bg-emerald-500", iconColor: "text-emerald-100", message: "Your current markers are within a healthy range." };
};