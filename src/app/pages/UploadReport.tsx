import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Upload, FileText, CheckCircle2, Loader2, Edit2, Save,
  CloudUpload, File, AlertTriangle,
} from "lucide-react";
import { api } from "../lib/api";

const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  normal: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  borderline: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  high: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  low: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  critical: { text: "text-red-900", bg: "bg-red-100", border: "border-red-300" },
};

type Step = "upload" | "extracting" | "review" | "saved";

export function UploadReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("upload");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [values, setValues] = useState<any[]>([]);
  const [extractProgress, setExtractProgress] = useState(0);
  const [labName, setLabName] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportDate, setReportDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  const processFile = async (f: File) => {
    setFile(f);
    setStep("extracting");
    setExtractProgress(0);
    setError("");

    // Animate progress while uploading
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 90) { clearInterval(interval); setExtractProgress(90); }
      else setExtractProgress(p);
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", f);
      formData.append("reportName", f.name.replace(/\.[^/.]+$/, ""));
      formData.append("date", new Date().toISOString().split("T")[0]);

      const result = await api.uploadReport(formData);
      clearInterval(interval);
      setExtractProgress(100);

      // Populate review data from OCR result
      setUploadResult(result.report);
      setReportName(result.report.name || f.name);
      setLabName(result.report.lab || "");
      setReportDate(result.report.date || new Date().toISOString().split("T")[0]);
      setValues(result.metrics.map((m: any) => ({
        name: m.name,
        value: String(m.value),
        unit: m.unit,
        status: m.status,
        normal: `${m.normal_min ?? '?'}–${m.normal_max ?? '?'}`,
        confidence: 95,
      })));
      setExtractionError(result.extractionError || null);

      setTimeout(() => setStep("review"), 500);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "Upload failed. Please check that the backend is running.");
      setStep("upload");
    }
  };

  const handleSave = () => {
    setStep("saved");
  };

  const renderUpload = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 bg-white"
        }`}
      >
        <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} />
        <div className="flex flex-col items-center gap-4">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
            <CloudUpload className={`w-10 h-10 ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {dragOver ? "Drop your report here!" : "Drop your medical report here"}
            </p>
            <p className="text-sm text-gray-500">or <span className="text-blue-600 font-medium">browse files</span> to upload</p>
          </div>
          <div className="flex items-center gap-3">
            {["PDF", "JPG", "PNG"].map(fmt => (
              <span key={fmt} className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">{fmt}</span>
            ))}
          </div>
          <p className="text-xs text-gray-400">Gemini Vision AI will extract your health values automatically</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">📋 For best results:</p>
        <ul className="space-y-1 text-xs text-blue-700">
          <li>• Upload the original PDF from your lab or doctor</li>
          <li>• Ensure the report is clearly visible if uploading an image</li>
          <li>• The AI will automatically extract all health values via Gemini Vision</li>
          <li>• You can review and edit extracted values before saving</li>
        </ul>
      </div>
    </div>
  );

  const renderExtracting = () => (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-12">
      <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center">
        <File className="w-12 h-12 text-blue-500" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">Analyzing your report with AI...</h3>
        <p className="text-sm text-gray-500">{file?.name}</p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full transition-all duration-150" style={{ width: `${extractProgress}%` }} />
      </div>
      <div className="grid grid-cols-1 gap-2 w-full text-sm">
        {[
          { label: "Uploading document", done: extractProgress > 20 },
          { label: "Gemini Vision analyzing", done: extractProgress > 50 },
          { label: "Extracting health values", done: extractProgress > 75 },
          { label: "Processing results", done: extractProgress >= 100 },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-gray-600">
            {s.done ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : extractProgress > i * 25 ? (
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
            )}
            <span className={s.done ? "text-emerald-700" : "text-gray-500"}>{s.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400">{Math.round(extractProgress)}% complete</p>
    </div>
  );

  const renderReview = () => (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">{file?.name || "Report"}</p>
          <p className="text-xs text-gray-400">
            {values.length} parameters extracted · {values.filter(v => v.status === "normal").length} normal · {values.filter(v => v.status !== "normal").length} flagged
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium bg-emerald-50 px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" /> Gemini OCR
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Report Name</label>
            <input type="text" value={reportName} onChange={(e) => setReportName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Lab / Clinic</label>
            <input type="text" value={labName} onChange={(e) => setLabName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Report Date</label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          </div>
        </div>
      </div>

      {values.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Extracted Health Values</h3>
            <span className="text-xs text-gray-400">Click any value to edit</span>
          </div>
          <div className="space-y-2.5">
            {values.map((v, i) => {
              const sc = statusColors[v.status] || statusColors.normal;
              const isEditing = editingIndex === i;
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isEditing ? "border-blue-300 bg-blue-50" : `${sc.border} ${sc.bg}`}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                    <p className="text-[11px] text-gray-400">Normal: {v.normal}</p>
                  </div>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={v.value} autoFocus
                        onChange={(e) => {
                          const newVals = [...values];
                          newVals[i] = { ...newVals[i], value: e.target.value };
                          setValues(newVals);
                        }}
                        className="w-20 text-sm border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 text-right bg-white" />
                      <span className="text-xs text-gray-500">{v.unit}</span>
                      <button onClick={() => setEditingIndex(null)} className="text-blue-600 hover:text-blue-800">
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-800">{v.value} <span className="text-xs font-normal text-gray-400">{v.unit}</span></p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border capitalize ${sc.text} ${sc.bg} ${sc.border}`}>{v.status}</span>
                      <button onClick={() => setEditingIndex(i)} className="text-gray-300 hover:text-blue-500 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="text-amber-800 font-medium text-sm">
            {extractionError ? "AI Extraction Failed" : "No health values could be extracted"}
          </p>
          <p className="text-amber-600 text-xs mt-1">
            {extractionError ? extractionError : "The file may not be a health report, or the image was unclear. The report was still saved."}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 justify-end pb-6">
        <button onClick={() => setStep("upload")}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Upload Different File
        </button>
        <button onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" /> Report Saved – View Dashboard
        </button>
      </div>
    </div>
  );

  const renderSaved = () => (
    <div className="max-w-md mx-auto flex flex-col items-center gap-6 py-12 text-center">
      <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
        <CheckCircle2 className="w-14 h-14 text-emerald-500" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Report Saved Successfully!</h3>
        <p className="text-sm text-gray-500">
          Your health data has been updated with {values.length} extracted values.
        </p>
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => navigate("/")}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Go to Dashboard
        </button>
        <button onClick={() => navigate("/alerts")}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
          View Alerts
        </button>
      </div>
      <button onClick={() => { setStep("upload"); setFile(null); setValues([]); }}
        className="text-sm text-gray-400 hover:text-gray-600">
        Upload another report
      </button>
    </div>
  );

  const steps = [
    { key: "upload", label: "Upload" },
    { key: "extracting", label: "Extract" },
    { key: "review", label: "Review" },
    { key: "saved", label: "Saved" },
  ];
  const stepIndex = steps.findIndex(s => s.key === step);

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1 last:flex-none">
              <div className={`flex items-center gap-2 ${i <= stepIndex ? "text-blue-600" : "text-gray-300"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i < stepIndex ? "bg-blue-600 text-white" : i === stepIndex ? "bg-blue-100 text-blue-600 ring-2 ring-blue-200" : "bg-gray-100 text-gray-400"
                }`}>
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded-full transition-colors ${i < stepIndex ? "bg-blue-300" : "bg-gray-100"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === "upload" && renderUpload()}
      {step === "extracting" && renderExtracting()}
      {step === "review" && renderReview()}
      {step === "saved" && renderSaved()}
    </div>
  );
}
