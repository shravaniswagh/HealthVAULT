import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle2, Plus, Trash2, Save, Info, Loader2 } from "lucide-react";
import { api } from "../lib/api";

const metricTemplates: any[] = [
  { id: "blood-sugar", name: "Fasting Blood Sugar", unit: "mg/dL", normalMin: 70, normalMax: 100, category: "Metabolic" },
  { id: "total-cholesterol", name: "Total Cholesterol", unit: "mg/dL", normalMin: 125, normalMax: 200, category: "Cardiovascular" },
  { id: "hdl", name: "HDL Cholesterol", unit: "mg/dL", normalMin: 40, normalMax: 60, category: "Cardiovascular" },
  { id: "ldl", name: "LDL Cholesterol", unit: "mg/dL", normalMin: 0, normalMax: 100, category: "Cardiovascular" },
  { id: "triglycerides", name: "Triglycerides", unit: "mg/dL", normalMin: 0, normalMax: 150, category: "Cardiovascular" },
  { id: "systolic", name: "Systolic Blood Pressure", unit: "mmHg", normalMin: 90, normalMax: 120, category: "Vitals" },
  { id: "diastolic", name: "Diastolic Blood Pressure", unit: "mmHg", normalMin: 60, normalMax: 80, category: "Vitals" },
  { id: "heart-rate", name: "Resting Heart Rate", unit: "bpm", normalMin: 60, normalMax: 100, category: "Vitals" },
  { id: "weight", name: "Body Weight", unit: "kg", normalMin: 50, normalMax: 85, category: "Body Measurements" },
  { id: "sp02", name: "Oxygen Saturation", unit: "%", normalMin: 95, normalMax: 100, category: "Vitals" },
];

const additionalMetrics = [
  { id: "hba1c", name: "HbA1c", unit: "%", normalMin: 0, normalMax: 5.7, category: "Metabolic" },
  { id: "uric-acid", name: "Uric Acid", unit: "mg/dL", normalMin: 3.5, normalMax: 7.2, category: "Metabolic" },
  { id: "calcium", name: "Calcium", unit: "mg/dL", normalMin: 8.5, normalMax: 10.5, category: "Nutritional" },
  { id: "wbc", name: "WBC Count", unit: "×10³/µL", normalMin: 4.5, normalMax: 11.0, category: "Hematology" },
  { id: "platelets", name: "Platelets", unit: "×10³/µL", normalMin: 150, normalMax: 400, category: "Hematology" },
  { id: "alt", name: "ALT (Liver)", unit: "U/L", normalMin: 7, normalMax: 56, category: "Liver" },
  { id: "ast", name: "AST (Liver)", unit: "U/L", normalMin: 10, normalMax: 40, category: "Liver" },
  { id: "tsh", name: "TSH (Thyroid)", unit: "mIU/L", normalMin: 0.4, normalMax: 4.0, category: "Thyroid" },
  { id: "vitamin-d", name: "Vitamin D", unit: "ng/mL", normalMin: 20, normalMax: 50, category: "Nutritional" },
  { id: "vitamin-b12", name: "Vitamin B12", unit: "pg/mL", normalMin: 200, normalMax: 900, category: "Nutritional" },
];

const allMetrics = [...metricTemplates, ...additionalMetrics];
const categories = ["All", ...Array.from(new Set(allMetrics.map((m) => m.category)))];

interface EntryRow {
  metricId: string;
  value: string;
  notes: string;
}

function getStatus(value: number, min: number, max: number) {
  if (value >= min && value <= max) return "normal";
  if (value < min) {
    if (value < min * 0.8) return "critical";
    return "low";
  }
  if (value > max * 1.2) return "high";
  return "borderline";
}

const statusColors = {
  normal: "text-emerald-600 bg-emerald-50",
  borderline: "text-amber-600 bg-amber-50",
  high: "text-red-600 bg-red-50",
  low: "text-blue-600 bg-blue-50",
  critical: "text-red-900 bg-red-100",
};

export function ManualEntry() {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [labName, setLabName] = useState("");
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<EntryRow[]>([
    { metricId: "blood-sugar", value: "", notes: "" },
    { metricId: "total-cholesterol", value: "", notes: "" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState("");

  const addEntry = (metricId: string) => {
    if (!entries.find((e) => e.metricId === metricId)) {
      setEntries((prev) => [...prev, { metricId, value: "", notes: "" }]);
    }
  };

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEntry = (index: number, field: "value" | "notes", value: string) => {
    setEntries((prev) => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const valid = entries.filter((e) => e.value !== "" && !isNaN(parseFloat(e.value)));
    if (valid.length === 0) return;
    setSaving(true);
    try {
      for (const entry of valid) {
        const metric = allMetrics.find((m) => m.id === entry.metricId);
        if (!metric) continue;
        await api.createMetric({
          name: metric.name,
          shortName: metric.name,
          value: parseFloat(entry.value),
          unit: metric.unit,
          normalMin: metric.normalMin,
          normalMax: metric.normalMax,
          category: metric.category,
          description: entry.notes || '',
        });
      }
      setSaved(true);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredMetrics = allMetrics.filter((m) => {
    const matchCat = selectedCategory === "All" || m.category === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const notAdded = !entries.find((e) => e.metricId === m.id);
    return matchCat && matchSearch && notAdded;
  });

  if (saved) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Data Saved!</h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {entries.filter(e => e.value).length} health values have been recorded and your health score has been updated.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => { setSaved(false); setEntries([{ metricId: "blood-sugar", value: "", notes: "" }]); }}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
          >
            Add More Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      <div className="mb-5">
        <p className="text-sm text-gray-500">Manually record health values from your device or doctor's visit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Entry form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Session details */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Session Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Date of Measurement *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Lab / Source</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g. Home device, Dr. Chen"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">General Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional context"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Entries */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">Health Values</h3>
              <span className="text-xs text-gray-400">{entries.filter(e => e.value).length} filled</span>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Plus className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Add metrics from the panel on the right</p>
              </div>
            ) : (
              <div className="space-y-3">
                {entries.map((entry, i) => {
                  const metric = allMetrics.find((m) => m.id === entry.metricId);
                  if (!metric) return null;
                  const numVal = parseFloat(entry.value);
                  const status = entry.value && !isNaN(numVal)
                    ? getStatus(numVal, metric.normalMin, metric.normalMax)
                    : null;

                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-semibold text-gray-800">{metric.name}</p>
                          <span className="text-[11px] text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{metric.category}</span>
                          {status && (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColors[status]}`}>
                              {status}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={entry.value}
                            onChange={(e) => updateEntry(i, "value", e.target.value)}
                            placeholder="Enter value"
                            className="w-28 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-right font-semibold"
                          />
                          <span className="text-xs text-gray-500 font-medium">{metric.unit}</span>
                          <span className="text-[11px] text-gray-400 ml-auto">Normal: {metric.normalMin}–{metric.normalMax}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeEntry(i)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {entries.length > 0 && (
              <button
                onClick={handleSave}
                disabled={entries.filter(e => e.value).length === 0 || saving}
                className="mt-4 w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : `Save ${entries.filter(e => e.value).length > 0 ? entries.filter(e => e.value).length + ' ' : ''}Health Values`}
              </button>
            )}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-800 mb-1">Tips for accurate readings</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Fast for 8-12 hours for blood sugar and lipid tests</li>
                  <li>• Measure blood pressure after 5 minutes of rest</li>
                  <li>• Record the exact time for time-sensitive measurements</li>
                  <li>• Use the same device for consistent readings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Metric picker */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm h-fit lg:sticky lg:top-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Metrics</h3>
          <input
            type="text"
            placeholder="Search metrics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 mb-2"
          />
          <div className="flex flex-wrap gap-1 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors ${
                  selectedCategory === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto">
            {filteredMetrics.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">All metrics added!</p>
            ) : (
              filteredMetrics.map((m) => (
                <button
                  key={m.id}
                  onClick={() => addEntry(m.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:border-blue-100 border border-transparent transition-colors text-left group"
                >
                  <div>
                    <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">{m.name}</p>
                    <p className="text-[11px] text-gray-400">{m.category} · {m.unit}</p>
                  </div>
                  <Plus className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
