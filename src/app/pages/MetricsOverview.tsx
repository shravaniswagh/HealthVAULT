import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, RefreshCw, Activity } from "lucide-react";
import { api } from "../lib/api";

const statusColors: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-700 border-emerald-200",
  borderline: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-red-100 text-red-700 border-red-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
  critical: "bg-red-200 text-red-900 border-red-300",
};

const statusOptions = ["All", "normal", "borderline", "high", "low", "critical"];

export function MetricsOverview() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    api.getMetrics()
      .then(setMetrics)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...Array.from(new Set(metrics.map((m) => m.category).filter(Boolean)))];

  const filtered = metrics.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.category || "").toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || m.category === category;
    const matchStatus = status === "All" || m.status === status;
    return matchSearch && matchCat && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      <div className="mb-6">
        <p className="text-gray-500 text-sm">Track and monitor all your health parameters</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Tracked", value: metrics.length, bg: "bg-blue-50 border-blue-100", num: "text-blue-600", sub: "text-blue-500" },
          { label: "Normal", value: metrics.filter(m => m.status === "normal").length, bg: "bg-emerald-50 border-emerald-100", num: "text-emerald-600", sub: "text-emerald-500" },
          { label: "Borderline", value: metrics.filter(m => m.status === "borderline").length, bg: "bg-amber-50 border-amber-100", num: "text-amber-600", sub: "text-amber-500" },
          { label: "Abnormal", value: metrics.filter(m => ["high", "low", "critical"].includes(m.status)).length, bg: "bg-red-50 border-red-100", num: "text-red-600", sub: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.num}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.sub} mt-0.5`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search metrics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50">
              {statusOptions.map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {metrics.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No metrics tracked yet</p>
            <p className="text-xs text-gray-400 mt-1">Upload a health report to start tracking</p>
            <button onClick={() => navigate("/upload")}
              className="mt-4 px-5 py-2 bg-blue-500 text-white text-sm font-semibold rounded-xl hover:bg-blue-600 transition-colors">
              Upload Report
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Metric</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Category</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Value</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Normal Range</th>
                  <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Recorded</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => (
                  <tr key={m.id} onClick={() => navigate(`/metrics/${m.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-8 rounded-full" style={{ backgroundColor: m.color || "#6B7280" }} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{m.short_name || m.name}</p>
                          <p className="text-[11px] text-gray-400 hidden sm:block">{m.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{m.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold text-gray-800">{m.value}</span>
                      <span className="text-xs text-gray-400 ml-1">{m.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {m.normal_min != null ? m.normal_min : "?"}–{m.normal_max != null ? m.normal_max : "?"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusColors[m.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {new Date(m.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No metrics match your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}