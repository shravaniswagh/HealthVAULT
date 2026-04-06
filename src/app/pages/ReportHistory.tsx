import { useState, useEffect } from "react";
import {
  FileText, CheckCircle2, Eye, Download, Search, Calendar, Upload, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

export function ReportHistory() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);


  useEffect(() => {
    api.getReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.lab || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.type || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1">
          <p className="text-sm text-gray-500">{reports.length} total reports</p>
        </div>
        <button onClick={() => navigate("/upload")}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Upload className="w-4 h-4" /> Upload New Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Reports", value: reports.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-600", sub: "text-blue-400" },
          { label: "Total Metrics", value: reports.reduce((s, r) => s + (r.metrics_count || 0), 0), bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", sub: "text-emerald-400" },
          { label: "Labs Used", value: new Set(reports.map(r => r.lab).filter(Boolean)).size, bg: "bg-purple-50 border-purple-100", text: "text-purple-600", sub: "text-purple-400" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
            <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
            <p className={`text-xs ${s.sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{reports.length === 0 ? "No reports uploaded yet" : "No reports found"}</p>
            <p className="text-xs text-gray-400 mt-1">Upload a health report to get started</p>
            <button onClick={() => navigate("/upload")}
              className="mt-4 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
              Upload Report
            </button>
          </div>
        ) : (
          filtered.map((report) => (
            <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-7 h-7 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{report.name}</h3>
                    <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 text-emerald-700 bg-emerald-50 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Processed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{report.lab || "Unknown Lab"} · {report.type || "General"}</p>
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(report.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="text-xs text-gray-300">·</span>
                    <span className="text-xs text-gray-400">{report.metrics_count || 0} parameters</span>
                  </div>
                  {report.notes && (
                    <p className="text-xs text-gray-500 italic border-l-2 border-gray-200 pl-2 mb-3 leading-relaxed">{report.notes}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedReport(report)}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Details
                    </button>
                    <button onClick={() => window.open(`${BACKEND_BASE}${report.file_path}`, '_blank')}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">{selectedReport.name}</h2>
                <p className="text-sm text-gray-500">{selectedReport.lab} · {selectedReport.date}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Report Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-400">Lab:</span> <span className="font-medium text-gray-700">{selectedReport.lab || "N/A"}</span></div>
                  <div><span className="text-gray-400">Type:</span> <span className="font-medium text-gray-700">{selectedReport.type || "N/A"}</span></div>
                  <div><span className="text-gray-400">Date:</span> <span className="font-medium text-gray-700">{selectedReport.date}</span></div>
                  <div><span className="text-gray-400">Parameters:</span> <span className="font-medium text-gray-700">{selectedReport.metrics_count || 0}</span></div>
                </div>
              </div>
              {selectedReport.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-xl p-3">{selectedReport.notes}</p>
                </div>
              )}
                <div className="pt-4 mt-4 border-t border-gray-100 flex gap-3">
                  <button onClick={() => window.open(`${BACKEND_BASE}${selectedReport.file_path}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors">
                    <Eye className="w-4 h-4" /> View PDF
                  </button>
                  <button
                    disabled={downloadingId === selectedReport.id}
                    onClick={async () => {
                      setDownloadingId(selectedReport.id);
                      try {
                        await api.downloadReport(selectedReport.id, selectedReport.name || 'report');
                      } catch {
                        alert('Download failed. Please try again.');
                      } finally {
                        setDownloadingId(null);
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200 disabled:opacity-60"
                  >
                    {downloadingId === selectedReport.id
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
                      : <><Download className="w-4 h-4" /> Download</>
                    }
                  </button>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}