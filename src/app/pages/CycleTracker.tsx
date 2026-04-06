import { useState, useEffect } from "react";
import { Plus, Calendar, AlertCircle, Droplets, CheckCircle2, Save, Trash2, Heart, Smile, Thermometer, Wind, Frown, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface CycleLog {
  id: number;
  period_start: string;
  period_end: string | null;
  cycle_length: number | null;
  flow_level: string | null;
  symptoms: string[];
  mood: string | null;
  pain_level: number | null;
  notes: string | null;
  temperature: number | null;
  cervical_mucus: string | null;
  is_ovulation_day: boolean;
}

const COMMON_SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Breast Tenderness", 
  "Acne", "Fatigue", "Backache", "Nausea", "Cravings", "Insomnia"
];
const MOODS = ["Happy", "Sensitive", "Sad", "Anxious", "Irritable", "Calm", "Energetic", "Mood Swings"];
const FLOWS = ["Spotting", "Light", "Medium", "Heavy"];
const MUCUS_TYPES = ["Dry", "Sticky", "Creamy", "Watery", "Egg White (Fertile)"];

export function CycleTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Log State
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [painLevel, setPainLevel] = useState<number>(0); // 0-10
  const [temperature, setTemperature] = useState("");
  const [cervicalMucus, setCervicalMucus] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.getCycleLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = () => {
    if (logs.length === 0) return null;
    
    // Sort logs descending
    const sorted = [...logs].sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime());
    const lastLog = sorted[0];
    
    const lastStart = new Date(lastLog.period_start);
    // Use user settings or default to 28 days
    const cycleLength = user?.cycle_length || lastLog.cycle_length || 28;
    
    const nextPeriod = new Date(lastStart);
    nextPeriod.setDate(lastStart.getDate() + cycleLength);
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const diffTime = nextPeriod.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      nextDate: nextPeriod.toISOString().split("T")[0],
      daysDiff: diffDays,
      isLate: diffDays < 0,
      predictedOvulation: new Date(nextPeriod.getTime() - (14 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0]
    };
  };

  const handleSaveLog = async () => {
    setSaving(true);
    try {
      await api.logCycle({
        period_start: startDate,
        period_end: endDate || null,
        flow_level: flow || null,
        symptoms: selectedSymptoms,
        mood: mood || null,
        pain_level: painLevel > 0 ? painLevel : null,
        notes: customNotes || null,
        temperature: temperature ? parseFloat(temperature) : null,
        cervical_mucus: cervicalMucus || null,
        // Auto compute length if previous exists
        cycle_length: logs.length > 0 ? 
          Math.round((new Date(startDate).getTime() - new Date(logs[0].period_start).getTime()) / (1000 * 60 * 60 * 24)) 
          : 28
      });
      setShowLogForm(false);
      resetForm();
      fetchLogs();
    } catch (err) {
      console.error(err);
      alert("Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      await api.deleteCycleLog(id);
      fetchLogs();
    } catch (err) {}
  };

  const resetForm = () => {
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setFlow("");
    setSelectedSymptoms([]);
    setMood("");
    setPainLevel(0);
    setTemperature("");
    setCervicalMucus("");
    setCustomNotes("");
  };

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== sym));
    } else {
      setSelectedSymptoms(prev => [...prev, sym]);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  const prediction = calculatePredictions();

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Droplets className="w-6 h-6 text-rose-500" /> Menstrual Tracker
          </h1>
          <p className="text-sm text-gray-500 mt-1">Track your cycle, flow, symptoms, and receive predictions.</p>
        </div>
        <button
          onClick={() => setShowLogForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Log Period / Symptoms
        </button>
      </div>

      {prediction && !showLogForm && (
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-6 justify-between ${
          prediction.isLate ? "bg-red-50 border-red-200" : "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-100"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${prediction.isLate ? "bg-red-200 text-red-600" : "bg-rose-200 text-rose-600"}`}>
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${prediction.isLate ? "text-red-800" : "text-rose-800"}`}>Next Period Prediction</p>
              <h2 className={`text-2xl font-bold ${prediction.isLate ? "text-red-900" : "text-rose-900"}`}>
                {prediction.isLate 
                  ? `Late by ${Math.abs(prediction.daysDiff)} ${Math.abs(prediction.daysDiff) === 1 ? 'day' : 'days'}!`
                  : `In ${prediction.daysDiff} ${prediction.daysDiff === 1 ? 'day' : 'days'}`}
              </h2>
              <p className={`text-xs mt-1 ${prediction.isLate ? "text-red-700" : "text-rose-600"}`}>
                Estimated date: {new Date(prediction.nextDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="bg-white/60 p-3 rounded-xl border border-white/50 min-w-[200px]">
             <p className="text-xs text-rose-700 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" /> Est. Ovulation Window
             </p>
             <p className="text-sm font-medium text-gray-800">{new Date(prediction.predictedOvulation).toLocaleDateString([], { month: 'short', day: 'numeric'})}</p>
          </div>
        </div>
      )}

      {showLogForm ? (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 animate-in fade-in slide-in-from-bottom-4">
           <div className="flex justify-between items-center mb-5 border-b pb-3">
             <h2 className="text-lg font-bold text-gray-800">Log Cycle & Symptoms</h2>
             <button onClick={() => setShowLogForm(false)} className="text-gray-400 hover:text-gray-600 px-3 py-1 rounded-lg bg-gray-100">Cancel</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {/* Dates & Flow */}
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Period Start *</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Period End (Optional)</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Flow Intensity</label>
                  <div className="flex gap-2">
                    {FLOWS.map(f => (
                      <button key={f} onClick={() => setFlow(f)} className={`flex-1 py-2 text-xs rounded-lg border font-medium transition-colors ${flow === f ? 'bg-rose-500 text-white border-rose-600' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             {/* Symptoms & Pain */}
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Symptoms</label>
                  <div className="flex flex-wrap gap-1.5">
                     {COMMON_SYMPTOMS.map(sym => (
                       <button key={sym} onClick={() => toggleSymptom(sym)} className={`px-2.5 py-1 text-xs rounded-full transition-colors ${selectedSymptoms.includes(sym) ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent'} border`}>
                         {sym}
                       </button>
                     ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Pain Level: {painLevel === 0 ? "None" : `${painLevel}/10`}</label>
                  <input type="range" min="0" max="10" value={painLevel} onChange={e => setPainLevel(parseInt(e.target.value))} className="w-full accent-rose-500" />
                </div>
             </div>

             {/* Mood & Vitals */}
             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Mood</label>
                  <select value={mood} onChange={e => setMood(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200">
                    <option value="">Select mood...</option>
                    {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">BBT (Temp)</label>
                    <input type="number" step="0.1" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="°C or °F" className="w-full border rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Cervical Mucus</label>
                    <select value={cervicalMucus} onChange={e => setCervicalMucus(e.target.value)} className="w-full border rounded-xl px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200">
                      <option value="">Select...</option>
                      {MUCUS_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Notes</label>
                  <textarea value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="Any other details..." className="w-full border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-200 resize-none h-16"/>
                </div>
             </div>
           </div>

           <div className="mt-6 flex justify-end">
             <button onClick={handleSaveLog} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 shadow-md transition-all disabled:opacity-50">
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Save Log
             </button>
           </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">History</h2>
          {logs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No cycle logs found.</p>
              <button onClick={() => setShowLogForm(true)} className="text-rose-500 hover:text-rose-600 font-medium text-sm mt-2">Log your first period</button>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {logs.map(log => (
                 <div key={log.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm relative group">
                    <button onClick={() => handleDelete(log.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-start gap-3 border-b pb-3 mb-3">
                       <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                         <Droplets className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900">{new Date(log.period_start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                         <p className="text-xs text-gray-500">
                           {log.period_end ? `Ended: ${new Date(log.period_end).toLocaleDateString([], { month: 'short', day: 'numeric'})}` : "Ongoing"}
                         </p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       {log.flow_level && <p className="text-xs text-gray-600"><span className="font-semibold text-gray-400">Flow:</span> {log.flow_level}</p>}
                       {log.mood && <p className="text-xs text-gray-600"><span className="font-semibold text-gray-400">Mood:</span> {log.mood}</p>}
                       {log.pain_level !== null && <p className="text-xs text-gray-600"><span className="font-semibold text-gray-400">Pain:</span> {log.pain_level}/10</p>}
                       {log.symptoms && log.symptoms.length > 0 && (
                         <div className="flex flex-wrap gap-1 mt-1">
                           {log.symptoms.slice(0, 3).map(s => <span key={s} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">{s}</span>)}
                           {log.symptoms.length > 3 && <span className="text-[10px] text-gray-400">+{log.symptoms.length - 3}</span>}
                         </div>
                       )}
                    </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}
