import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  AlertCircle, ArrowRight, FileText, Upload, ChevronRight, Activity,
  Heart, Brain, RefreshCw, Eye,
} from "lucide-react";
<<<<<<< HEAD
import { api } from "../lib/api";
=======
import { api, ASSET_URL } from "../lib/api";
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
import { useAuth } from "../contexts/AuthContext";

const statusColors: Record<string, string> = {
  normal: "text-emerald-600", borderline: "text-amber-600",
  high: "text-red-600", low: "text-blue-600", critical: "text-red-700",
};
const statusBg: Record<string, string> = {
  normal: "bg-emerald-50 border-emerald-100", borderline: "bg-amber-50 border-amber-100",
  high: "bg-red-50 border-red-100", low: "bg-blue-50 border-blue-100", critical: "bg-red-100 border-red-200",
};
const statusLabel: Record<string, string> = {
  normal: "Normal", borderline: "Borderline", high: "High", low: "Low", critical: "Critical",
};

function HealthScoreRing({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";
  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle cx="68" cy="68" r={radius} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{score}</span>
        <span className="text-[11px] text-gray-400 font-medium">Health Score</span>
      </div>
    </div>
  );
}

function MetricCard({ metric }: { metric: any }) {
  const navigate = useNavigate();
  const normalMin = metric.normal_min ?? 0;
  const normalMax = metric.normal_max ?? 100;
  const progress = normalMax > normalMin
    ? Math.min(100, ((metric.value - normalMin) / (normalMax - normalMin + 1)) * 100)
    : 50;

  return (
    <div
      onClick={() => navigate(`/metrics/${metric.id}`)}
      className={`bg-white rounded-2xl p-4 border cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 ${statusBg[metric.status] || "border-gray-100"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 font-medium mb-0.5">{metric.category}</p>
          <p className="text-sm font-semibold text-gray-800 leading-tight">{metric.short_name || metric.name}</p>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBg[metric.status]} ${statusColors[metric.status]}`}>
          {statusLabel[metric.status] || metric.status}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">{metric.value}</span>
        <span className="text-xs text-gray-400 mb-1">{metric.unit}</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: metric.color || "#6B7280" }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>{normalMin}</span>
          <span>Normal: {normalMin}–{normalMax}</span>
          <span>{normalMax}+</span>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-xs">
        <p className="font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-gray-600">{p.name || p.dataKey}:</span>
            <span className="font-semibold text-gray-800">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMetrics().catch(() => []),
      api.getReports().catch(() => []),
      api.getAlerts().catch(() => []),
      api.getAnalytics().catch(() => null),
    ]).then(([m, r, a, an]) => {
      setMetrics(m);
      setReports(r);
      setAlerts(a);
      setAnalytics(an);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const unreadAlerts = alerts.filter((a) => !a.read);
  const abnormalMetrics = metrics.filter((m) => m.status !== "normal");
  const overallScore = analytics?.overallScore ?? 0;
  const healthScoreTrend = analytics?.healthScoreTrend ?? [];
  const categoryScores = analytics?.categoryScores ?? [];
  const firstName = user?.name?.split(" ")[0] || "there";
  
  // Dynamic Theming based on gender
  const isFemale = user?.gender === 'female';
  const themeGradients = {
    female: "from-rose-500 via-pink-500 to-fuchsia-400",
    default: "from-blue-600 via-blue-500 to-blue-400"
  };
  const themeText = {
    female: "text-pink-100",
    default: "text-blue-100"
  };
  const themeButton = {
    female: "text-pink-600 hover:bg-pink-50",
    default: "text-blue-600 hover:bg-blue-50"
  };
  const themeOutlineBtn = {
    female: "bg-pink-700/40 hover:bg-pink-700/60",
    default: "bg-blue-700/40 hover:bg-blue-700/60"
  };
  
  const currentGradient = isFemale ? themeGradients.female : themeGradients.default;
  const currentText = isFemale ? themeText.female : themeText.default;
  const currentBtn = isFemale ? themeButton.female : themeButton.default;
  const currentOutlineBtn = isFemale ? themeOutlineBtn.female : themeOutlineBtn.default;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Welcome banner */}
      <div className={`bg-gradient-to-r ${currentGradient} rounded-2xl p-5 lg:p-6 text-white relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex items-center gap-4 lg:gap-6">
          <HealthScoreRing score={overallScore} />
          <div className="flex-1 min-w-0">
            <p className={`${currentText} text-sm mb-1`}>Good morning,</p>
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">{firstName}! 👋</h2>
            <p className={`${currentText} text-sm leading-relaxed mb-3 hidden md:block`}>
              {metrics.length > 0
                ? `You have ${metrics.length} metrics tracked and ${unreadAlerts.length} unread alerts to review.`
                : "Welcome! Upload a health report to start tracking your metrics."}
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate("/upload")}
                className={`bg-white ${currentBtn} text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm`}>
                <Upload className="w-3.5 h-3.5" /> Upload Report
              </button>
              <button onClick={() => navigate("/ai-assistant")}
                className={`${currentOutlineBtn} text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 border border-white/20 shadow-sm`}>
                <Brain className="w-3.5 h-3.5" /> AI Assistant
              </button>
            </div>
          </div>
          {categoryScores.length > 0 && (
            <div className="hidden lg:grid grid-cols-1 gap-2 w-40 flex-shrink-0">
              {categoryScores.map((c: any) => (
                <div key={c.category} className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: `${c.score}%` }} />
                  </div>
                  <span className="text-[11px] text-blue-100 capitalize w-20 text-right truncate">{c.category}</span>
                  <span className="text-[11px] font-bold text-white w-6 text-right">{c.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Total Reports", value: reports.length, icon: FileText, color: "blue", sub: reports.length > 0 ? `Last: ${new Date(reports[0]?.created_at || '').toLocaleDateString()}` : "None yet" },
          { label: "Metrics Tracked", value: metrics.length, icon: Activity, color: "green", sub: "All active" },
          { label: "Abnormal Values", value: abnormalMetrics.length, icon: AlertTriangle, color: "amber", sub: `${metrics.length - abnormalMetrics.length} normal` },
          { label: "Unread Alerts", value: unreadAlerts.length, icon: AlertCircle, color: "red", sub: unreadAlerts.length > 0 ? "Needs attention" : "All clear" },
        ].map((stat) => {
          const Icon = stat.icon;
          const iconBgMap: Record<string, string> = { blue: "bg-blue-50", green: "bg-green-50", amber: "bg-amber-50", red: "bg-red-50" };
          const iconColorMap: Record<string, string> = { blue: "text-blue-500", green: "text-green-500", amber: "text-amber-500", red: "text-red-500" };
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBgMap[stat.color]}`}>
                  <Icon className={`w-4 h-4 ${iconColorMap[stat.color]}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Health Score Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Health Score Trend</h3>
              <p className="text-xs text-gray-400">Per uploaded report</p>
            </div>
            {healthScoreTrend.length > 1 && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                <TrendingUp className="w-3.5 h-3.5" />
                {healthScoreTrend[healthScoreTrend.length - 1]?.score - healthScoreTrend[0]?.score > 0 ? "+" : ""}
                {healthScoreTrend.length > 1 ? (healthScoreTrend[healthScoreTrend.length - 1]?.score - healthScoreTrend[0]?.score) : 0} pts
              </span>
            )}
          </div>
          {healthScoreTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={healthScoreTrend}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5} fill="url(#scoreGrad)"
                  dot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-gray-400">
              <Activity className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm">Upload reports to see your trend</p>
              <button onClick={() => navigate("/upload")} className="mt-3 text-xs text-blue-600 font-medium hover:underline">
                Upload a report →
              </button>
            </div>
          )}
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800">Category Scores</h3>
            <p className="text-xs text-gray-400">Health domains</p>
          </div>
          {categoryScores.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <RadarChart data={categoryScores} cx="50%" cy="50%" outerRadius={55}>
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 9, fill: "#9CA3AF" }} />
                  <Radar name="Score" dataKey="score" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5">
                {categoryScores.map((c: any) => (
                  <div key={c.category} className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-gray-100 rounded-full">
                      <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: c.fill }} />
                    </div>
                    <span className="text-[11px] text-gray-500 w-24 truncate">{c.category}</span>
                    <span className="text-[11px] font-semibold text-gray-700 w-7 text-right">{c.score}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-gray-400">
              <Heart className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm text-center">No category data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">All Health Metrics</h3>
            <button onClick={() => navigate("/metrics")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
              View details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {metrics.map((metric) => <MetricCard key={metric.id} metric={metric} />)}
          </div>
        </div>
      )}

      {/* Bottom row: Alerts + Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Alerts */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Active Alerts</h3>
            <button onClick={() => navigate("/alerts")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
              All alerts <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {unreadAlerts.length > 0 ? (
            <div className="space-y-2.5">
              {unreadAlerts.slice(0, 4).map((alert: any) => {
                const isHigh = alert.severity === "high" || alert.severity === "critical";
                const cardClass = isHigh ? "bg-red-50 border border-red-100" : alert.severity === "medium" ? "bg-amber-50 border border-amber-100" : "bg-blue-50 border border-blue-100";
                const iconClass = isHigh ? "text-red-500" : alert.severity === "medium" ? "text-amber-500" : "text-blue-500";
                const textClass = isHigh ? "text-red-600" : alert.severity === "medium" ? "text-amber-600" : "text-blue-600";
                return (
                  <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl ${cardClass}`}>
                    <AlertTriangle className={`w-4 h-4 ${iconClass} mt-0.5 flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{alert.message}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${textClass} flex-shrink-0`}>{alert.severity}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-200 mb-2" />
              <p className="text-sm font-medium text-gray-500">All clear!</p>
              <p className="text-xs">No active alerts</p>
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent Reports</h3>
            <button onClick={() => navigate("/reports")} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
              All reports <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {reports.length > 0 ? (
            <div className="space-y-2.5">
              {reports.slice(0, 4).map((report: any) => (
                <div key={report.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-500" />
                  </div>
<<<<<<< HEAD
                  <div className="flex-1 min-w-0" onClick={() => window.open(`http://localhost:3001${report.file_path}`, '_blank')}>
=======
                  <div className="flex-1 min-w-0" onClick={() => window.open(`${ASSET_URL}${report.file_path}`, '_blank')}>
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{report.name}</p>
                    <p className="text-xs text-gray-400">{report.lab} · {new Date(report.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> {report.metrics_count} metrics
                    </span>
                    <button onClick={(e) => {
                      e.stopPropagation();
<<<<<<< HEAD
                      window.open(`http://localhost:3001${report.file_path}`, '_blank');
=======
                      window.open(`${ASSET_URL}${report.file_path}`, '_blank');
>>>>>>> f346220b8367c7f770d8d6b55a1e314826d9ffdf
                    }}
                      className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      title="View PDF">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400">
              <FileText className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm">No reports yet</p>
            </div>
          )}
          <button
            onClick={() => navigate("/upload")}
            className="mt-3 w-full py-2.5 rounded-xl border-2 border-dashed border-blue-200 text-xs text-blue-500 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" /> Upload new report
          </button>
        </div>
      </div>
    </div>
  );
}