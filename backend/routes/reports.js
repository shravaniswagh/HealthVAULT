const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const healthMetrics = require('../constants/healthMetrics');
const { getMetricInsights } = require('../utils/metricInsights');

const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Helper: find standard range
function getStandardRange(name) {
  if (!name) return null;
  const key = Object.keys(healthMetrics).find(k => 
    name.toLowerCase().includes(k.toLowerCase()) || 
    k.toLowerCase().includes(name.toLowerCase())
  );
  return key ? healthMetrics[key] : null;
}

// Helper: compute metric status
function computeStatus(value, min, max, name) {
  let finalMin = min;
  let finalMax = max;

  // If min/max are missing or strictly 0 (common OCR failure), try to find standard range
  if (finalMin == null || finalMax == null || (finalMin === 0 && finalMax === 0)) {
    const std = getStandardRange(name);
    if (std) {
      finalMin = std.min;
      finalMax = std.max;
    }
  }

  if (finalMin == null || finalMax == null) return 'normal';
  if (value < finalMin * 0.8 || value > finalMax * 1.5) return 'critical';
  if (value < finalMin) return 'low';
  if (value > finalMax * 1.2) return 'high';
  if (value > finalMax) return 'borderline';
  return 'normal';
}

// Helper: generate alerts for abnormal metrics
async function generateAlertsForMetrics(userId, metrics) {
  for (const metric of metrics) {
    if (['high', 'critical', 'low'].includes(metric.status)) {
      const severity = metric.status === 'critical' ? 'critical' : metric.status === 'high' ? 'high' : 'medium';
      const dirWord = metric.value < metric.normal_min ? 'low' : 'high';
      const title = `${metric.status === 'critical' ? 'Critical' : 'Abnormal'} ${metric.name}`;
      const message = `Your ${metric.name} is ${metric.value} ${metric.unit || ''}, which is ${dirWord} (normal: ${metric.normal_min ?? '?'}–${metric.normal_max ?? '?'}).`;
      const recommendation = metric.status === 'low'
        ? `Please consult your doctor about your low ${metric.name} levels.`
        : `Consider speaking with your doctor about your elevated ${metric.name}.`;

      await db.query(`
        INSERT INTO alerts (user_id, metric_id, severity, title, message, recommendation)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, metric.id, severity, title, message, recommendation]);
    }
  }
}

// POST /api/reports/upload
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const { reportName, lab, date, type, notes } = req.body;
    const userId = req.user.id;

    let extractedMetrics = [];
    let parsedReportName = reportName;
    let parsedLab = lab;
    let parsedDate = date;
    
    // Save file persistence
    const ext = path.extname(file.originalname);
    const newFilename = `${file.filename}${ext}`;
    const newPath = path.join(file.destination, newFilename);
    const savedFilePath = `/uploads/${newFilename}`;
    
    // Rename to include extension
    fs.renameSync(file.path, newPath);

    let ocrErrorMsg = null;
    try {
      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('YOUR_API_KEY')) {
        throw new Error('GEMINI_API_KEY is missing or not configured in backend .env');
      }
      
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const fileBuffer = fs.readFileSync(newPath);
      const mimeType = file.mimetype || 'image/jpeg';
      
      const prompt = `You are a medical lab report OCR system. Extract ALL health metric values from this lab report image or document.
      
Return ONLY valid JSON in this exact format, no other text:
{
  "metrics": [
    {
      "name": "Full metric name",
      "shortName": "Short name",
      "value": 0.0,
      "unit": "unit",
      "normalMin": 0.0,
      "normalMax": 0.0,
      "category": "Cardiovascular|Metabolic|Nutritional|Renal|Thyroid|Hematology|Other",
      "description": "Brief description of this metric"
    }
  ],
  "reportName": "Report name if visible",
  "lab": "Lab name if visible",
  "date": "Date if visible in YYYY-MM-DD format"
}

Common metrics include: Glucose, HbA1c, Total Cholesterol, LDL, HDL, Triglycerides, Hemoglobin, WBC, RBC, Platelets, Creatinine, BUN, ALT, AST, TSH, T3, T4, Vitamin D, Vitamin B12, Iron, etc.
If you cannot extract metrics, return: {"metrics": [], "reportName": "", "lab": "", "date": ""}`;

      const result = await model.generateContent([
        prompt,
        { inlineData: { mimeType, data: fileBuffer.toString('base64') } }
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        let cleanText = jsonMatch[0];
        // Remove markdown code blocks if the regex didn't catch them perfectly
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '');
        const parsed = JSON.parse(cleanText);
        extractedMetrics = parsed.metrics || [];
        if (parsed.reportName) parsedReportName = parsed.reportName;
        if (parsed.lab) parsedLab = parsed.lab;
        if (parsed.date) parsedDate = parsed.date;
      } else {
        throw new Error('Failed to parse JSON from Gemini response');
      }
    } catch (ocrErr) {
      console.error('OCR error:', ocrErr.message);
      ocrErrorMsg = ocrErr.message;
      if (ocrErrorMsg.includes('403') || ocrErrorMsg.includes('PERMISSION_DENIED') || ocrErrorMsg.includes('API_KEY_INVALID')) {
        ocrErrorMsg = 'Invalid Gemini API Key. Please check your .env file and ensure the API is enabled in Google AI Studio.';
      }
    }

    // Insert report
    const finalName = parsedReportName || reportName || 'Health Report';
    const finalLab = parsedLab || lab || '';
    const finalDate = parsedDate || date || new Date().toISOString().split('T')[0];
    const finalType = type || 'General';
    const finalNotes = notes || '';

    const reportResult = await db.query(`
      INSERT INTO reports (user_id, name, lab, date, type, notes, file_path, metrics_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [userId, finalName, finalLab, finalDate, finalType, finalNotes, savedFilePath, extractedMetrics.length]);

    const reportId = reportResult.rows[0].id;

    // Insert metrics
    const insertedMetrics = [];
    for (const m of extractedMetrics) {
      if (m.value == null || isNaN(m.value)) continue;

      let std = getStandardRange(m.name);
      
      let finalMin = m.normalMin != null && m.normalMin !== 0 ? m.normalMin : (std ? std.min : null);
      let finalMax = m.normalMax != null && m.normalMax !== 0 ? m.normalMax : (std ? std.max : null);
      let finalUnit = m.unit || (std ? std.unit : '');
      let finalCategory = m.category && m.category !== 'Other' ? m.category : (std ? std.category : 'Other');
      
      const status = computeStatus(m.value, finalMin, finalMax, m.name);

      const colorMap = {
        Cardiovascular: '#EF4444',
        Metabolic: '#F59E0B',
        Nutritional: '#8B5CF6',
        Renal: '#3B82F6',
        Thyroid: '#10B981',
        Hematology: '#3B82F6',
        Other: '#6B7280',
      };
      const color = colorMap[finalCategory] || '#6B7280';

      const finalDescription = m.description || getMetricInsights(m.value, finalMin, finalMax, m.name);

      const metricResult = await db.query(`
        INSERT INTO metrics (user_id, report_id, name, short_name, value, unit, status, normal_min, normal_max, category, color, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [userId, reportId, m.name, m.shortName || m.name, m.value, finalUnit, status, finalMin, finalMax, finalCategory, color, finalDescription]);

      insertedMetrics.push({
        id: metricResult.rows[0].id,
        ...m,
        unit: finalUnit,
        category: finalCategory,
        status,
        color,
        description: finalDescription,
        normal_min: finalMin,
        normal_max: finalMax,
      });
    }

    // Update report metrics count
    await db.query('UPDATE reports SET metrics_count = $1 WHERE id = $2', [insertedMetrics.length, reportId]);

    // Generate alerts
    await generateAlertsForMetrics(userId, insertedMetrics);

    res.json({
      report: {
        id: reportId,
        name: finalName,
        lab: finalLab,
        date: finalDate,
        type: finalType,
        notes: finalNotes,
        file_path: savedFilePath,
        metrics_count: insertedMetrics.length,
      },
      metrics: insertedMetrics,
      extractionError: ocrErrorMsg
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed: ' + err.message });
  }
});

// GET /api/reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, name, lab, date, type, notes, file_path, metrics_count, created_at
      FROM reports WHERE user_id = $1 ORDER BY created_at DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

module.exports = router;
// GET /api/reports/download/:id — force-download the original PDF
router.get('/download/:id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM reports WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Report not found' });
    const report = rows[0];

    const filePath = path.join(__dirname, '..', report.file_path);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });

    res.setHeader('Content-Disposition', `attachment; filename="${report.name || 'report'}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Download failed' });
  }
});

module.exports = router;

