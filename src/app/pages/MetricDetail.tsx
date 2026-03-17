import { useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle,
  Activity, Brain, ChevronRight, RefreshCw,
} from "lucide-react";
import { api } from "../lib/api";

const statusStyles: Record<string, { badge: string; bg: string; border: string; icon: any; label: string }> = {
  normal: { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2, label: "Normal" },
  borderline: { badge: "bg-amber-100 text-amber-700 border-amber-200", bg: "bg-amber-50", border: "border-amber-200", icon: AlertTriangle, label: "Borderline" },
  high: { badge: "bg-red-100 text-red-700 border-red-200", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle, label: "High" },
  low: { badge: "bg-blue-100 text-blue-700 border-blue-200", bg: "bg-blue-50", border: "border-blue-200", icon: AlertTriangle, label: "Low" },
  critical: { badge: "bg-red-200 text-red-900 border-red-300", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle, label: "Critical" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.stroke }} />
            <span className="text-gray-500">Value:</span>
            <span className="font-bold text-gray-800">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function MetricDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [metric, setMetric] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getMetric(id)
      .then((data) => {
        setMetric(data.metric);
        setHistory(data.history || []);
      })
      .catch(() => setMetric(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><RefreshCw className="w-6 h-6 animate-spin text-blue-500" /></div>;
  }

  if (!metric) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Metric not found.</p>
        <button onClick={() => navigate("/metrics")} className="mt-3 text-blue-600 text-sm">← Back to metrics</button>
      </div>
    );
  }

  const style = statusStyles[metric.status] || statusStyles.normal;
  const StatusIcon = style.icon;
  const normalMin = metric.normal_min ?? 0;
  const normalMax = metric.normal_max ?? 100;
  const color = metric.color || "#3B82F6";

  // Build history chart data
  const chartData = history.map((h: any) => ({
    date: new Date(h.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: h.value,
  })).reverse();

  const hasRanges = normalMin !== null && normalMax !== null;

  const allValues = chartData.map((h: any) => h.value);
  const yMin = allValues.length && hasRanges ? Math.floor(Math.min(...allValues, normalMin) * 0.85) : 0;
  const yMax = allValues.length && hasRanges ? Math.ceil(Math.max(...allValues, normalMax) * 1.1) : (allValues.length ? Math.max(...allValues) * 1.2 : 200);

  const avg = history.length ? (history.reduce((a: number, b: any) => a + b.value, 0) / history.length).toFixed(1) : metric.value;

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      <button onClick={() => navigate("/metrics")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Metrics
      </button>

      {/* Header card */}
      <div className={`rounded-2xl p-5 lg:p-6 border mb-5 ${style.bg} ${style.border}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 bg-white/70 px-2 py-0.5 rounded-full border">{metric.category}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                <span className="flex items-center gap-1"><StatusIcon className="w-3 h-3" /> {style.label}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">{metric.name}</h2>
            {metric.description && <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-3 bg-white/50 p-3 rounded-xl border border-white/60">{metric.description}</p>}
          </div>
          <div className="flex items-end gap-4">
            <div className="text-right">
              <p className="text-4xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-sm text-gray-500">{metric.unit}</p>
            </div>
          </div>
        </div>
        {/* Range indicator */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span className="font-medium">Normal: {hasRanges ? `${normalMin} – ${normalMax}` : '? – ?'} {metric.unit}</span>
            <span>{hasRanges ? normalMax * 1.5 + '+' : 'Max'}</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
            {hasRanges ? (
              <>
                <div className="absolute h-full bg-emerald-100 rounded-full"
                  style={{ left: `${(normalMin / (normalMax * 1.5)) * 100}%`, width: `${((normalMax - normalMin) / (normalMax * 1.5)) * 100}%` }} />
                <div className="absolute top-0 h-full w-1 rounded-full"
                  style={{ left: `${Math.min(95, (metric.value / (normalMax * 1.5)) * 100)}%`, backgroundColor: color }} />
              </>
            ) : (
              <div className="absolute h-full bg-gray-200 w-full" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        {/* Main chart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Measurement Trend</h3>
                <p className="text-xs text-gray-400">{history.length} data points</p>
              </div>
            </div>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis domain={hasRanges ? [yMin, yMax] : ['auto', 'auto']} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  {hasRanges && (
                    <>
                      <ReferenceLine y={normalMax} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.5} />
                      <ReferenceLine y={normalMin} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1.5} />
                    </>
                  )}
                  <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5}
                    fill={`url(#grad-${id})`}
                    dot={{ fill: color, r: 5, strokeWidth: 0 }}
                    activeDot={{ r: 7, stroke: "white", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-gray-400">
                <Activity className="w-10 h-10 text-gray-200 mb-2" />
                <p className="text-sm">Only one data point — upload more reports to see trend</p>
              </div>
            )}
          </div>

          {/* History table */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 pb-2">Date</th>
                    <th className="text-right text-xs font-semibold text-gray-500 pb-2">Value</th>
                    <th className="text-center text-xs font-semibold text-gray-500 pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((h: any, i: number) => {
                    const s = hasRanges
                      ? (h.value >= normalMin && h.value <= normalMax ? "normal"
                        : h.value < normalMin ? "low"
                        : h.value <= normalMax * 1.1 ? "borderline" : "high")
                      : "normal";
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-2.5 text-gray-600">
                          {new Date(h.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="py-2.5 text-right font-semibold text-gray-800">
                          {h.value} <span className="text-xs font-normal text-gray-400">{metric.unit}</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusStyles[s]?.badge || ""}`}>{s}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Statistics</h3>
            <div className="space-y-3">
              {[
                { label: "Current Value", value: `${metric.value} ${metric.unit}`, color },
                { label: "Normal Range", value: hasRanges ? `${normalMin}–${normalMax}` : 'Unknown', color: "#10B981" },
                { label: "Data Points", value: String(history.length), color: "#6B7280" },
                { label: "Average", value: `${avg} ${metric.unit}`, color: "#6B7280" },
                { label: "Last Updated", value: new Date(metric.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), color: "#6B7280" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{stat.label}</span>
                  <span className="text-xs font-semibold" style={{ color: stat.color }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-800">AI Insights</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Ask the AI assistant for a detailed analysis of your {metric.name} readings and personalized recommendations.
            </p>
            <button onClick={() => navigate("/ai-assistant")}
              className="w-full py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5">
              Ask AI Assistant <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Actions</h3>
            <div className="space-y-2">
              <button onClick={() => navigate("/manual-entry")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <Activity className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Add Manual Entry</span>
              </button>
              <button onClick={() => navigate("/upload")}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">Upload New Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}