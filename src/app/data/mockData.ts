// Mock health data for the platform

export const userProfile = {
  id: "u1",
  name: "Alex Johnson",
  age: 34,
  gender: "Male",
  dob: "1991-03-14",
  bloodType: "A+",
  height: "5'11\" (180 cm)",
  weight: "178 lbs (80.7 kg)",
  bmi: 24.9,
  email: "alex.johnson@email.com",
  phone: "+1 (555) 234-5678",
  emergencyContact: "Sarah Johnson",
  emergencyPhone: "+1 (555) 345-6789",
  primaryDoctor: "Dr. Emily Chen",
  insurance: "BlueCross BlueShield",
  allergies: ["Penicillin", "Shellfish"],
  conditions: ["Mild Hypertension"],
  medications: ["Lisinopril 10mg", "Vitamin D 2000IU"],
  avatar: "https://images.unsplash.com/photo-1758691461516-7e716e0ca135?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
};

export const healthScore = {
  overall: 78,
  trend: +3,
  categories: {
    cardiovascular: 72,
    metabolic: 81,
    nutritional: 68,
    renal: 90,
    thyroid: 85,
  },
};

export type MetricStatus = "normal" | "borderline" | "high" | "low" | "critical";

export interface HealthMetric {
  id: string;
  name: string;
  shortName: string;
  value: number;
  unit: string;
  normalMin: number;
  normalMax: number;
  status: MetricStatus;
  trend: "up" | "down" | "stable";
  trendValue: number;
  category: string;
  color: string;
  icon: string;
  lastUpdated: string;
  description: string;
  history: { date: string; value: number }[];
}

export const healthMetrics: HealthMetric[] = [
  {
    id: "blood-sugar",
    name: "Blood Sugar (Fasting)",
    shortName: "Blood Sugar",
    value: 108,
    unit: "mg/dL",
    normalMin: 70,
    normalMax: 100,
    status: "borderline",
    trend: "up",
    trendValue: 5,
    category: "Metabolic",
    color: "#F59E0B",
    icon: "droplet",
    lastUpdated: "2026-03-10",
    description: "Fasting blood glucose measures the amount of sugar in your blood after not eating for at least 8 hours.",
    history: [
      { date: "2025-09", value: 96 },
      { date: "2025-10", value: 99 },
      { date: "2025-11", value: 102 },
      { date: "2025-12", value: 98 },
      { date: "2026-01", value: 103 },
      { date: "2026-02", value: 105 },
      { date: "2026-03", value: 108 },
    ],
  },
  {
    id: "total-cholesterol",
    name: "Total Cholesterol",
    shortName: "Cholesterol",
    value: 215,
    unit: "mg/dL",
    normalMin: 0,
    normalMax: 200,
    status: "borderline",
    trend: "down",
    trendValue: -8,
    category: "Cardiovascular",
    color: "#EF4444",
    icon: "heart",
    lastUpdated: "2026-03-10",
    description: "Total cholesterol is the sum of all cholesterol in your blood. High levels can increase risk of heart disease.",
    history: [
      { date: "2025-09", value: 228 },
      { date: "2025-10", value: 223 },
      { date: "2025-11", value: 220 },
      { date: "2025-12", value: 218 },
      { date: "2026-01", value: 223 },
      { date: "2026-02", value: 219 },
      { date: "2026-03", value: 215 },
    ],
  },
  {
    id: "hdl-cholesterol",
    name: "HDL Cholesterol",
    shortName: "HDL",
    value: 52,
    unit: "mg/dL",
    normalMin: 40,
    normalMax: 100,
    status: "normal",
    trend: "up",
    trendValue: 2,
    category: "Cardiovascular",
    color: "#10B981",
    icon: "shield",
    lastUpdated: "2026-03-10",
    description: "HDL is the 'good' cholesterol that helps remove other forms of cholesterol from your bloodstream.",
    history: [
      { date: "2025-09", value: 48 },
      { date: "2025-10", value: 49 },
      { date: "2025-11", value: 50 },
      { date: "2025-12", value: 51 },
      { date: "2026-01", value: 50 },
      { date: "2026-02", value: 51 },
      { date: "2026-03", value: 52 },
    ],
  },
  {
    id: "ldl-cholesterol",
    name: "LDL Cholesterol",
    shortName: "LDL",
    value: 138,
    unit: "mg/dL",
    normalMin: 0,
    normalMax: 100,
    status: "high",
    trend: "down",
    trendValue: -5,
    category: "Cardiovascular",
    color: "#EF4444",
    icon: "activity",
    lastUpdated: "2026-03-10",
    description: "LDL is the 'bad' cholesterol. High levels can build up in your arteries and increase heart disease risk.",
    history: [
      { date: "2025-09", value: 152 },
      { date: "2025-10", value: 148 },
      { date: "2025-11", value: 145 },
      { date: "2025-12", value: 142 },
      { date: "2026-01", value: 143 },
      { date: "2026-02", value: 140 },
      { date: "2026-03", value: 138 },
    ],
  },
  {
    id: "hemoglobin",
    name: "Hemoglobin",
    shortName: "Hemoglobin",
    value: 14.8,
    unit: "g/dL",
    normalMin: 13.5,
    normalMax: 17.5,
    status: "normal",
    trend: "stable",
    trendValue: 0,
    category: "Hematology",
    color: "#3B82F6",
    icon: "zap",
    lastUpdated: "2026-03-10",
    description: "Hemoglobin is a protein in red blood cells that carries oxygen throughout your body.",
    history: [
      { date: "2025-09", value: 14.5 },
      { date: "2025-10", value: 14.6 },
      { date: "2025-11", value: 14.9 },
      { date: "2025-12", value: 14.7 },
      { date: "2026-01", value: 14.8 },
      { date: "2026-02", value: 14.9 },
      { date: "2026-03", value: 14.8 },
    ],
  },
  {
    id: "vitamin-d",
    name: "Vitamin D",
    shortName: "Vitamin D",
    value: 18,
    unit: "ng/mL",
    normalMin: 20,
    normalMax: 50,
    status: "low",
    trend: "up",
    trendValue: 2,
    category: "Nutritional",
    color: "#8B5CF6",
    icon: "sun",
    lastUpdated: "2026-03-10",
    description: "Vitamin D is essential for calcium absorption, bone health, immune function, and overall wellbeing.",
    history: [
      { date: "2025-09", value: 12 },
      { date: "2025-10", value: 13 },
      { date: "2025-11", value: 14 },
      { date: "2025-12", value: 15 },
      { date: "2026-01", value: 16 },
      { date: "2026-02", value: 17 },
      { date: "2026-03", value: 18 },
    ],
  },
  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    shortName: "B12",
    value: 342,
    unit: "pg/mL",
    normalMin: 200,
    normalMax: 900,
    status: "normal",
    trend: "stable",
    trendValue: 0,
    category: "Nutritional",
    color: "#10B981",
    icon: "pill",
    lastUpdated: "2026-03-10",
    description: "Vitamin B12 is crucial for nerve function, DNA synthesis, and red blood cell formation.",
    history: [
      { date: "2025-09", value: 310 },
      { date: "2025-10", value: 325 },
      { date: "2025-11", value: 318 },
      { date: "2025-12", value: 330 },
      { date: "2026-01", value: 335 },
      { date: "2026-02", value: 340 },
      { date: "2026-03", value: 342 },
    ],
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    shortName: "Triglycerides",
    value: 168,
    unit: "mg/dL",
    normalMin: 0,
    normalMax: 150,
    status: "borderline",
    trend: "down",
    trendValue: -12,
    category: "Cardiovascular",
    color: "#F59E0B",
    icon: "trending-up",
    lastUpdated: "2026-03-10",
    description: "Triglycerides are a type of fat found in the blood. High levels may increase heart disease risk.",
    history: [
      { date: "2025-09", value: 195 },
      { date: "2025-10", value: 188 },
      { date: "2025-11", value: 182 },
      { date: "2025-12", value: 178 },
      { date: "2026-01", value: 175 },
      { date: "2026-02", value: 171 },
      { date: "2026-03", value: 168 },
    ],
  },
  {
    id: "blood-pressure",
    name: "Blood Pressure",
    shortName: "Blood Pressure",
    value: 132,
    unit: "mmHg",
    normalMin: 90,
    normalMax: 120,
    status: "high",
    trend: "down",
    trendValue: -4,
    category: "Cardiovascular",
    color: "#EF4444",
    icon: "activity",
    lastUpdated: "2026-03-12",
    description: "Blood pressure measures the force of blood against artery walls. High BP increases risk of heart attack and stroke.",
    history: [
      { date: "2025-09", value: 138 },
      { date: "2025-10", value: 140 },
      { date: "2025-11", value: 136 },
      { date: "2025-12", value: 135 },
      { date: "2026-01", value: 134 },
      { date: "2026-02", value: 133 },
      { date: "2026-03", value: 132 },
    ],
  },
  {
    id: "creatinine",
    name: "Creatinine",
    shortName: "Creatinine",
    value: 0.98,
    unit: "mg/dL",
    normalMin: 0.6,
    normalMax: 1.2,
    status: "normal",
    trend: "stable",
    trendValue: 0,
    category: "Renal",
    color: "#3B82F6",
    icon: "droplets",
    lastUpdated: "2026-03-10",
    description: "Creatinine is a waste product from normal muscle activity filtered by the kidneys.",
    history: [
      { date: "2025-09", value: 0.95 },
      { date: "2025-10", value: 0.97 },
      { date: "2025-11", value: 0.96 },
      { date: "2025-12", value: 0.99 },
      { date: "2026-01", value: 0.98 },
      { date: "2026-02", value: 0.97 },
      { date: "2026-03", value: 0.98 },
    ],
  },
  {
    id: "tsh",
    name: "Thyroid Stimulating Hormone",
    shortName: "TSH",
    value: 2.1,
    unit: "mIU/L",
    normalMin: 0.4,
    normalMax: 4.0,
    status: "normal",
    trend: "stable",
    trendValue: 0,
    category: "Thyroid",
    color: "#10B981",
    icon: "thermometer",
    lastUpdated: "2026-03-10",
    description: "TSH regulates thyroid hormone production. Abnormal levels can indicate thyroid disorders.",
    history: [
      { date: "2025-09", value: 2.3 },
      { date: "2025-10", value: 2.2 },
      { date: "2025-11", value: 2.1 },
      { date: "2025-12", value: 2.0 },
      { date: "2026-01", value: 2.2 },
      { date: "2026-02", value: 2.1 },
      { date: "2026-03", value: 2.1 },
    ],
  },
  {
    id: "iron",
    name: "Serum Iron",
    shortName: "Iron",
    value: 72,
    unit: "µg/dL",
    normalMin: 60,
    normalMax: 170,
    status: "normal",
    trend: "up",
    trendValue: 5,
    category: "Nutritional",
    color: "#10B981",
    icon: "cpu",
    lastUpdated: "2026-03-10",
    description: "Serum iron measures the amount of iron in your blood. Iron is essential for making red blood cells.",
    history: [
      { date: "2025-09", value: 62 },
      { date: "2025-10", value: 65 },
      { date: "2025-11", value: 68 },
      { date: "2025-12", value: 67 },
      { date: "2026-01", value: 70 },
      { date: "2026-02", value: 71 },
      { date: "2026-03", value: 72 },
    ],
  },
];

export interface MedicalReport {
  id: string;
  name: string;
  date: string;
  lab: string;
  type: string;
  status: "processed" | "pending" | "failed";
  metricsCount: number;
  thumbnail: string;
  metrics: string[];
  notes: string;
}

export const medicalReports: MedicalReport[] = [
  {
    id: "r1",
    name: "Complete Blood Count + Lipid Panel",
    date: "2026-03-10",
    lab: "LabCorp",
    type: "Comprehensive Metabolic",
    status: "processed",
    metricsCount: 12,
    thumbnail: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    metrics: ["Blood Sugar", "Cholesterol", "HDL", "LDL", "Triglycerides", "Hemoglobin", "Vitamin D", "B12", "Creatinine", "TSH", "Iron"],
    notes: "Routine annual checkup. LDL remains elevated, doctor recommends dietary changes.",
  },
  {
    id: "r2",
    name: "Thyroid Function Test",
    date: "2025-12-15",
    lab: "Quest Diagnostics",
    type: "Thyroid Panel",
    status: "processed",
    metricsCount: 3,
    thumbnail: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    metrics: ["TSH", "T3", "T4"],
    notes: "Thyroid function within normal limits.",
  },
  {
    id: "r3",
    name: "Vitamin Panel",
    date: "2025-11-20",
    lab: "LabCorp",
    type: "Nutritional Assessment",
    status: "processed",
    metricsCount: 4,
    thumbnail: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    metrics: ["Vitamin D", "B12", "B6", "Folate"],
    notes: "Vitamin D deficiency confirmed. Supplementation started.",
  },
  {
    id: "r4",
    name: "Cardiac Risk Assessment",
    date: "2025-09-08",
    lab: "Mayo Clinic Lab",
    type: "Cardiac Panel",
    status: "processed",
    metricsCount: 5,
    thumbnail: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    metrics: ["Cholesterol", "HDL", "LDL", "Triglycerides", "Blood Pressure"],
    notes: "Elevated LDL and Triglycerides. Follow-up in 3 months.",
  },
  {
    id: "r5",
    name: "Blood Glucose Monitoring",
    date: "2025-07-22",
    lab: "Local Clinic",
    type: "Diabetes Screening",
    status: "processed",
    metricsCount: 2,
    thumbnail: "https://images.unsplash.com/photo-1620933967796-53cc2b175b6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    metrics: ["Blood Sugar", "HbA1c"],
    notes: "Borderline fasting glucose. Monitor and reduce sugar intake.",
  },
];

export interface HealthAlert {
  id: string;
  metricId: string;
  metricName: string;
  severity: "critical" | "high" | "medium" | "info";
  title: string;
  message: string;
  recommendation: string;
  date: string;
  read: boolean;
}

export const healthAlerts: HealthAlert[] = [
  {
    id: "a1",
    metricId: "ldl-cholesterol",
    metricName: "LDL Cholesterol",
    severity: "high",
    title: "High LDL Cholesterol",
    message: "Your LDL cholesterol is 138 mg/dL, above the recommended maximum of 100 mg/dL.",
    recommendation: "Reduce saturated fat intake, increase physical activity, and consider discussing statin therapy with your doctor.",
    date: "2026-03-10",
    read: false,
  },
  {
    id: "a2",
    metricId: "vitamin-d",
    metricName: "Vitamin D",
    severity: "medium",
    title: "Vitamin D Deficiency",
    message: "Your Vitamin D level is 18 ng/mL, below the minimum recommended level of 20 ng/mL.",
    recommendation: "Increase sun exposure, consume Vitamin D-rich foods, and continue supplementation as prescribed.",
    date: "2026-03-10",
    read: false,
  },
  {
    id: "a3",
    metricId: "blood-pressure",
    metricName: "Blood Pressure",
    severity: "high",
    title: "Elevated Blood Pressure",
    message: "Your systolic blood pressure is 132 mmHg, above the normal range of 90-120 mmHg.",
    recommendation: "Reduce sodium intake, exercise regularly, manage stress, and take prescribed medication consistently.",
    date: "2026-03-12",
    read: true,
  },
  {
    id: "a4",
    metricId: "blood-sugar",
    metricName: "Blood Sugar",
    severity: "medium",
    title: "Borderline Fasting Glucose",
    message: "Your fasting blood sugar is 108 mg/dL, which falls in the pre-diabetic range (100-125 mg/dL).",
    recommendation: "Adopt a low-glycemic diet, exercise for 30 minutes daily, and schedule follow-up testing in 3 months.",
    date: "2026-03-10",
    read: false,
  },
  {
    id: "a5",
    metricId: "total-cholesterol",
    metricName: "Total Cholesterol",
    severity: "medium",
    title: "Borderline High Cholesterol",
    message: "Your total cholesterol is 215 mg/dL, slightly above the recommended maximum of 200 mg/dL.",
    recommendation: "Reduce saturated fats, increase omega-3 intake, and exercise regularly.",
    date: "2026-03-10",
    read: true,
  },
  {
    id: "a6",
    metricId: "triglycerides",
    metricName: "Triglycerides",
    severity: "medium",
    title: "Slightly Elevated Triglycerides",
    message: "Your triglycerides are 168 mg/dL, above the normal range of 150 mg/dL.",
    recommendation: "Limit sugar and refined carbohydrates, reduce alcohol consumption, and exercise more.",
    date: "2026-03-10",
    read: true,
  },
  {
    id: "a7",
    metricId: "blood-sugar",
    metricName: "Blood Sugar",
    severity: "info",
    title: "Improved Blood Sugar Trend",
    message: "Your blood sugar trend shows gradual improvement over the past 3 months.",
    recommendation: "Continue current dietary changes and exercise routine.",
    date: "2026-02-14",
    read: true,
  },
];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const initialChatMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content: "Hello Alex! 👋 I'm your AI Health Assistant. I've analyzed your recent lab reports and health data. I can answer questions about your health metrics, explain what your results mean, and provide lifestyle recommendations.\n\n**Quick summary:** I noticed 3 areas that need attention:\n- Your **LDL cholesterol** (138 mg/dL) is above the optimal range\n- Your **Vitamin D** (18 ng/mL) is slightly deficient\n- Your **Blood Pressure** (132 mmHg) is elevated\n\nHow can I help you today?",
    timestamp: "2026-03-14T09:00:00",
  },
];

export const aiResponses: Record<string, string> = {
  cholesterol: `Based on your latest report, your **cholesterol profile** shows mixed results:\n\n- **Total Cholesterol:** 215 mg/dL (borderline high, target: <200)\n- **LDL:** 138 mg/dL (high, target: <100)\n- **HDL:** 52 mg/dL (normal, good)\n- **Triglycerides:** 168 mg/dL (borderline high)\n\nThe good news is your LDL has been trending downward (-8% over 6 months). **Key recommendations:**\n1. Reduce saturated fat (red meat, full-fat dairy)\n2. Increase soluble fiber (oats, beans, fruits)\n3. Exercise 150+ minutes/week\n4. Consider discussing statin therapy with Dr. Chen\n\nWould you like more specific dietary advice?`,
  "blood sugar": `Your **blood sugar** is currently 108 mg/dL (fasting), which places you in the **pre-diabetic range** (100-125 mg/dL).\n\nThe trend shows a gradual increase over 6 months (+12 mg/dL). This warrants attention.\n\n**What this means:** Pre-diabetes doesn't guarantee you'll develop Type 2 diabetes — lifestyle changes can reverse it.\n\n**Action plan:**\n1. 🥗 Adopt a low-glycemic index diet\n2. 🏃 30 minutes of moderate exercise daily\n3. 💧 Stay hydrated (water over sugary drinks)\n4. 📅 Retest HbA1c in 3 months\n5. ⚖️ Maintain healthy weight (your BMI of 24.9 is good)\n\nShall I create a meal plan suggestion?`,
  "vitamin d": `Your **Vitamin D** level is 18 ng/mL, which is **deficient** (normal: 20-50 ng/mL).\n\nThis has been consistently low but is slowly improving — from 12 ng/mL (Sept 2025) to 18 ng/mL now. 📈\n\n**Why Vitamin D matters:**\n- Bone health and calcium absorption\n- Immune system function\n- Mood regulation (low Vit D linked to depression)\n- Muscle function\n\n**To increase your Vitamin D:**\n1. ☀️ 15-20 min of midday sun exposure (arms/face)\n2. 🐟 Eat fatty fish, fortified milk, egg yolks\n3. 💊 Continue your Vitamin D 2000IU supplement\n4. Consider increasing to 4000IU (discuss with doctor)\n\nYour levels should normalize in 2-3 months with consistency.`,
  default: `I can help you understand your health data! You can ask me about:\n\n- **Specific metrics** (e.g., "What does my LDL mean?")\n- **Trends** (e.g., "Is my blood sugar improving?")\n- **Lifestyle tips** (e.g., "How can I lower my cholesterol?")\n- **Report analysis** (e.g., "Summarize my latest report")\n- **Normal ranges** (e.g., "What should my hemoglobin be?")\n\nBased on your current data, your top priorities are:\n1. Managing LDL cholesterol\n2. Improving Vitamin D levels\n3. Monitoring blood pressure\n\nWhat would you like to explore?`,
};

export const overallHealthTrend = [
  { month: "Sep 25", score: 71 },
  { month: "Oct 25", score: 72 },
  { month: "Nov 25", score: 73 },
  { month: "Dec 25", score: 74 },
  { month: "Jan 26", score: 75 },
  { month: "Feb 26", score: 76 },
  { month: "Mar 26", score: 78 },
];

export const categoryScores = [
  { category: "Cardiovascular", score: 72, fill: "#EF4444" },
  { category: "Metabolic", score: 81, fill: "#F59E0B" },
  { category: "Nutritional", score: 68, fill: "#8B5CF6" },
  { category: "Renal", score: 90, fill: "#3B82F6" },
  { category: "Thyroid", score: 85, fill: "#10B981" },
];

export const bloodPressureHistory = [
  { date: "2025-09", systolic: 138, diastolic: 88 },
  { date: "2025-10", systolic: 140, diastolic: 90 },
  { date: "2025-11", systolic: 136, diastolic: 86 },
  { date: "2025-12", systolic: 135, diastolic: 85 },
  { date: "2026-01", systolic: 134, diastolic: 84 },
  { date: "2026-02", systolic: 133, diastolic: 83 },
  { date: "2026-03", systolic: 132, diastolic: 82 },
];
