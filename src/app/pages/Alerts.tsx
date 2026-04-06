import { useState, useEffect } from "react";
import {
  AlertTriangle, AlertCircle, Info, CheckCircle2, Bell,
  ChevronRight, X, Activity, Check,
} from "lucide-react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

const severityConfig: Record<string, any> = {
  critical: {
    icon: AlertCircle, badge: "bg-red-100 text-red-700 border-red-200",
    card: "border-red-200 bg-red-50", dot: "bg-red-500", label: "Critical", headerBg: "bg-red-500",
  },
  high: {
    icon: AlertTriangle, badge: "bg-red-50 text-red-600 border-red-100",
    card: "border-red-100 bg-red-50/50", dot: "bg-red-400", label: "High", headerBg: "bg-red-400",
  },
  medium: {
    icon: AlertTriangle, badge: "bg-amber-50 text-amber-700 border-amber-200",
    card: "border-amber-100 bg-amber-50/50", dot: "bg-amber-400", label: "Medium", headerBg: "bg-amber-400",
  },
  info: {
    icon: Info, badge: "bg-blue-50 text-blue-700 border-blue-100",
    card: "border-blue-100 bg-blue-50/50", dot: "bg-blue-400", label: "Info", headerBg: "bg-blue-400",
  },
};

function AlertCard({ alert, onMarkRead, onDismiss }: { alert: any; onMarkRead: (id: any) => void; onDismiss: (id: any) => void }) {
  const navigate = useNavigate();
  const config = severityConfig[alert.severity] || severityConfig.info;
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-4 lg:p-5 transition-all duration-200 ${config.card} ${!alert.read ? "shadow-sm" : "opacity-70"}`}>
      <div className="flex items-start gap-3 lg:gap-4">
        <div className={`w-10 h-10 rounded-xl ${config.headerBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm font-semibold ${alert.read ? "text-gray-600" : "text-gray-900"}`}>{alert.title}</h3>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.badge}`}>{config.label}</span>
              {!alert.read && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">NEW</span>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!alert.read && (
                <button onClick={() => onMarkRead(alert.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-white transition-colors" title="Mark as read">
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={() => onDismiss(alert.id)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-white transition-colors" title="Dismiss">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mb-2 leading-relaxed">{alert.message}</p>
          {alert.recommendation && (
            <div className="bg-white/70 rounded-xl p-3 mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">💡 Recommendation</p>
              <p className="text-xs text-gray-600 leading-relaxed">{alert.recommendation}</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">
              {new Date(alert.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {alert.read ? " · Read" : " · Unread"}
            </span>
            {alert.metric_id && (
              <button onClick={() => navigate(`/metrics/${alert.metric_id}`)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                <Activity className="w-3 h-3" /> View metric <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "high" | "medium" | "info">("all");

  useEffect(() => {
    api.getAlerts()
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: any) => {
    await api.markAlertRead(id).catch(() => {});
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: 1 } : a));
  };

  const dismiss = (id: any) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const markAllRead = async () => {
    await api.markAllAlertsRead().catch(() => {});
    setAlerts((prev) => prev.map((a) => ({ ...a, read: 1 })));
  };

  const filtered = alerts.filter((a) => {
    if (filter === "all") return true;
    if (filter === "unread") return !a.read;
    return a.severity === filter;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical" || a.severity === "high").length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      {unreadCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">{unreadCount} unread alert{unreadCount > 1 ? "s" : ""} require your attention</p>
            <p className="text-xs text-amber-600">Review and act on these health notifications</p>
          </div>
          <button onClick={markAllRead}
            className="text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total Alerts", value: alerts.length, bg: "bg-gray-50 border-gray-100", text: "text-gray-700", sub: "text-gray-500" },
          { label: "Unread", value: unreadCount, bg: "bg-blue-50 border-blue-100", text: "text-blue-600", sub: "text-blue-500" },
          { label: "High Priority", value: criticalCount, bg: "bg-red-50 border-red-100", text: "text-red-600", sub: "text-red-500" },
          { label: "Read", value: alerts.filter(a => a.read).length, bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", sub: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-3 text-center`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className={`text-xs font-medium ${s.sub}`}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-2 border border-gray-100 shadow-sm mb-5 flex gap-1 overflow-x-auto">
        {(["all", "high", "medium", "low", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${filter === (f === "low" ? "info" : f) ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}>
            {f === "all" ? "All Alerts" : f.charAt(0).toUpperCase() + f.slice(1)}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">{alerts.length === 0 ? "No alerts yet" : "No alerts in this category"}</p>
            <p className="text-xs text-gray-400 mt-1">{filter === "unread" ? "You're all caught up!" : "Upload reports to generate alerts"}</p>
          </div>
        ) : (
          (["critical", "high", "medium", "info"] as const).map((sev) => {
            const sevAlerts = filtered.filter((a) => a.severity === sev);
            if (sevAlerts.length === 0) return null;
            const cfg = severityConfig[sev];
            return (
              <div key={sev}>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{cfg.label} Priority</span>
                  <span className="text-xs text-gray-400">({sevAlerts.length})</span>
                </div>
                <div className="space-y-2.5 mb-5">
                  {sevAlerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} onMarkRead={markRead} onDismiss={dismiss} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}