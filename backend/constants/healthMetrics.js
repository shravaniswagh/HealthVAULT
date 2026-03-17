// Standard normal ranges for common health metrics
// Used as fallbacks when OCR does not provide min/max ranges
module.exports = {
  // --- Metabolic ---
  'Glucose': { min: 70, max: 99, unit: 'mg/dL', title: 'Fasting Blood Glucose', category: 'Metabolic' },
  'Fasting Blood Sugar (FBS)': { min: 70, max: 99, unit: 'mg/dL', category: 'Metabolic' },
  'HbA1c': { min: 4.0, max: 5.6, unit: '%', title: 'Hemoglobin A1c', category: 'Metabolic' },
  // --- Cardiovascular & Lipids ---
  'Total Cholesterol': { min: 100, max: 199, unit: 'mg/dL', category: 'Cardiovascular' },
  'LDL Cholesterol': { min: 0, max: 99, unit: 'mg/dL', category: 'Cardiovascular' },
  'HDL Cholesterol': { min: 40, max: 60, unit: 'mg/dL', category: 'Cardiovascular' },
  'Triglycerides': { min: 0, max: 149, unit: 'mg/dL', category: 'Cardiovascular' },
  // --- Hematology ---
  'WBC': { min: 4.0, max: 11.0, unit: '10^3/uL', title: 'White Blood Cells', category: 'Hematology' },
  'White Blood Cells': { min: 4.0, max: 11.0, unit: '10^3/uL', category: 'Hematology' },
  'RBC': { min: 4.0, max: 5.9, unit: '10^6/uL', title: 'Red Blood Cells', category: 'Hematology' },
  'Red Blood Cells': { min: 4.0, max: 5.9, unit: '10^6/uL', category: 'Hematology' },
  'Hemoglobin': { min: 12.0, max: 17.5, unit: 'g/dL', category: 'Hematology' },
  'Hematocrit': { min: 36.0, max: 50.0, unit: '%', category: 'Hematology' },
  'Platelets': { min: 150, max: 450, unit: '10^3/uL', category: 'Hematology' },
  // --- Renal/Kidney ---
  'Creatinine': { min: 0.6, max: 1.2, unit: 'mg/dL', category: 'Renal' },
  'BUN (Blood Urea Nitrogen)': { min: 7, max: 20, unit: 'mg/dL', category: 'Renal' },
  'eGFR': { min: 90, max: 120, unit: 'mL/min', category: 'Renal' }, // >90 is normal, but capped
  // --- Liver (Hepatic) ---
  'AST': { min: 8, max: 33, unit: 'U/L', title: 'Aspartate Aminotransferase', category: 'Other' },
  'ALT': { min: 4, max: 36, unit: 'U/L', title: 'Alanine Aminotransferase', category: 'Other' },
  'ALP': { min: 44, max: 147, unit: 'IU/L', title: 'Alkaline Phosphatase', category: 'Other' },
  'Bilirubin, Total': { min: 0.1, max: 1.2, unit: 'mg/dL', category: 'Other' },
  // --- Thyroid ---
  'TSH': { min: 0.4, max: 4.0, unit: 'mIU/L', title: 'Thyroid Stimulating Hormone', category: 'Thyroid' },
  'Free T4': { min: 0.8, max: 1.8, unit: 'ng/dL', category: 'Thyroid' },
  'Free T3': { min: 2.3, max: 4.2, unit: 'pg/mL', category: 'Thyroid' },
  // --- Electrolytes/Nutritional ---
  'Sodium': { min: 135, max: 145, unit: 'mEq/L', category: 'Nutritional' },
  'Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L', category: 'Nutritional' },
  'Calcium': { min: 8.5, max: 10.2, unit: 'mg/dL', category: 'Nutritional' },
  'Vitamin D': { min: 30, max: 100, unit: 'ng/mL', category: 'Nutritional' },
  'Vitamin B12': { min: 200, max: 900, unit: 'pg/mL', category: 'Nutritional' },
  'Iron': { min: 60, max: 170, unit: 'mcg/dL', category: 'Nutritional' }
};
