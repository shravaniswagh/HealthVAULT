import { useState, useEffect } from "react";
import {
  User, Edit2, Save, X, Phone, Mail, Calendar, Droplets,
  Shield, Stethoscope, Pill, AlertTriangle, Heart, Activity,
  FileText, Share2, Download, Settings, ChevronRight, CheckCircle2
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    gender: user?.gender || "prefer_not_to_say",
    emergency_contact_name: user?.emergency_contact_name || "",
    emergency_contact_phone: user?.emergency_contact_phone || "",
    last_period_date: user?.last_period_date ? new Date(user.last_period_date).toISOString().split('T')[0] : "",
    cycle_length: user?.cycle_length || 28,
    is_pregnant: user?.is_pregnant || false,
    due_date: user?.due_date ? new Date(user.due_date).toISOString().split('T')[0] : "",
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile(formData);
      login(res.token, res.user);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.getMetrics().catch(() => []),
      api.getReports().catch(() => []),
      api.getAnalytics().catch(() => null),
    ]).then(([m, r, an]) => {
      setMetrics(m);
      setReports(r);
      setAnalytics(an);
    });
  }, []);

  const normalCount = metrics.filter(m => m.status === "normal").length;
  const abnormalCount = metrics.filter(m => m.status !== "normal").length;
  const overallScore = analytics?.overallScore ?? 0;
  const categoryScores = analytics?.categoryScores ?? [];
  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="p-4 lg:p-6 max-w-screen-xl mx-auto">
      {/* Profile header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 lg:p-6 mb-5 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-4 lg:gap-6">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold text-white ring-4 ring-white/30">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-1">{user?.name || "User"}</h2>
            <div className="flex flex-wrap items-center gap-3 text-blue-100 text-sm">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-2 text-right">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{overallScore}</p>
              <p className="text-xs text-blue-100">Health Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Normal Metrics", value: normalCount, bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", subText: "text-emerald-400", sub: "of " + metrics.length + " total" },
          { label: "Needs Attention", value: abnormalCount, bg: "bg-red-50 border-red-100", text: "text-red-600", subText: "text-red-400", sub: "Review alerts" },
          { label: "Reports Filed", value: reports.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-600", subText: "text-blue-400", sub: "All time" },
          { label: "Health Score", value: overallScore, bg: "bg-amber-50 border-amber-100", text: "text-amber-600", subText: "text-amber-400", sub: "Out of 100" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
            <p className={`text-xs font-semibold ${s.text} mb-0.5`}>{s.label}</p>
            <p className={`text-[11px] ${s.subText}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Personal Information</h3>
              </div>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(false)} className="text-xs text-gray-500 hover:text-gray-700 hover:underline">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="text-xs text-white bg-blue-600 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50">
                    <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              )}
            </div>
            
            {saveSuccess && (
              <div className="mb-4 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                {editing ? (
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{user?.name || "—"}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                {editing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none opacity-50 cursor-not-allowed" disabled title="Email changing not supported yet" />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{user?.email || "—"}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Gender</label>
                {editing ? (
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium text-gray-800 capitalize">{user?.gender?.replace(/_/g, " ") || "Not Specified"}</p>
                )}
              </div>
            </div>

            {/* Female specific fields */}
            {(formData.gender === "female" || (!editing && user?.gender === "female")) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-pink-600 mb-3 uppercase tracking-wider">Women's Health Info</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                     <label className="block text-xs text-gray-400 mb-1">Last Period Date</label>
                     {editing ? (
                       <input type="date" value={formData.last_period_date} onChange={e => setFormData({ ...formData, last_period_date: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-300 outline-none" />
                     ) : (
                       <p className="text-sm font-medium text-gray-800">{user?.last_period_date ? new Date(user.last_period_date).toLocaleDateString() : "—"}</p>
                     )}
                  </div>
                  <div>
                     <label className="block text-xs text-gray-400 mb-1">Cycle Length (Days)</label>
                     {editing ? (
                       <input type="number" value={formData.cycle_length} onChange={e => setFormData({ ...formData, cycle_length: parseInt(e.target.value) || 28 })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-300 outline-none" />
                     ) : (
                       <p className="text-sm font-medium text-gray-800">{user?.cycle_length || "—"} days</p>
                     )}
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 mt-1">
                     {editing ? (
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={formData.is_pregnant} onChange={e => setFormData({ ...formData, is_pregnant: e.target.checked })} className="w-4 h-4 text-pink-600 rounded border-gray-300 focus:ring-pink-500" />
                         <span className="text-sm font-medium text-gray-700">Currently Pregnant</span>
                       </label>
                     ) : (
                       <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5 border px-3 py-1.5 rounded-xl border-gray-200 w-fit">
                         {user?.is_pregnant ? "🤰 Currently Pregnant" : "Not Pregnant"}
                       </p>
                     )}
                  </div>
                  {((editing && formData.is_pregnant) || (!editing && user?.is_pregnant)) && (
                    <div>
                       <label className="block text-xs text-gray-400 mb-1">Expected Due Date</label>
                       {editing ? (
                         <input type="date" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-pink-300 outline-none" />
                       ) : (
                         <p className="text-sm font-medium text-gray-800">{user?.due_date ? new Date(user.due_date).toLocaleDateString() : "—"}</p>
                       )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Emergency Contact</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contact Name</label>
                {editing ? (
                  <input type="text" value={formData.emergency_contact_name} onChange={e => setFormData({ ...formData, emergency_contact_name: e.target.value })} placeholder="Emergency Contact Name" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{user?.emergency_contact_name || "—"}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Contact Phone</label>
                {editing ? (
                  <input type="text" value={formData.emergency_contact_phone} onChange={e => setFormData({ ...formData, emergency_contact_phone: e.target.value })} placeholder="Emergency Contact Phone" className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none" />
                ) : (
                  <p className="text-sm font-medium text-gray-800">{user?.emergency_contact_phone || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Email", value: user?.email || "—", icon: Mail },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">{field.label}</p>
                      <p className="text-sm font-medium text-gray-800">{field.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hospital Visits */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <h3 className="font-semibold text-gray-800">Hospital Visits</h3>
              </div>
            </div>
            
            {(!user?.hospital_visits || user.hospital_visits.length === 0) ? (
              <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-sm text-gray-500">No hospital visits recorded.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {user.hospital_visits.map((visit: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">{visit.hospital}</h4>
                      <p className="text-xs text-gray-500 mb-1">{new Date(visit.date).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">{visit.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Health Score card */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Health Overview</h3>
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-2">
                <span className="text-2xl font-bold text-white">{overallScore}</span>
              </div>
              <p className="text-xs text-gray-400">Overall Health Score</p>
            </div>
            <div className="space-y-2.5">
              {categoryScores.map((c: any) => (
                <div key={c.category} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 capitalize w-28">{c.category}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{ width: `${c.score}%`, backgroundColor: c.score >= 80 ? "#10B981" : c.score >= 60 ? "#F59E0B" : "#EF4444" }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-6 text-right">{c.score}</span>
                </div>
              ))}
              {categoryScores.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Upload reports to see category scores</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Account Actions</h3>
            <div className="space-y-1.5">
              {[
                { icon: Share2, label: "Share Reports with Doctor", iconCls: "bg-blue-50 text-blue-500" },
                { icon: Download, label: "Export All Health Data", iconCls: "bg-gray-50 text-gray-500" },
                { icon: FileText, label: "View All Reports", iconCls: "bg-gray-50 text-gray-500" },
                { icon: Settings, label: "Notification Settings", iconCls: "bg-gray-50 text-gray-500" },
                { icon: Shield, label: "Privacy & Security", iconCls: "bg-gray-50 text-gray-500" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`w-8 h-8 ${action.iconCls.split(" ")[0]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${action.iconCls.split(" ")[1]}`} />
                    </div>
                    <span className="text-sm text-gray-700 flex-1">{action.label}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connected devices */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">Connected Devices</h3>
            <div className="space-y-2.5">
              {[
                { name: "Apple Health", icon: "🍎", status: "Connected", statusCls: "text-emerald-500" },
                { name: "Fitbit Charge 5", icon: "⌚", status: "Connected", statusCls: "text-emerald-500" },
                { name: "BP Monitor", icon: "🩺", status: "Offline", statusCls: "text-gray-400" },
              ].map((device) => (
                <div key={device.name} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                  <span className="text-xl">{device.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{device.name}</p>
                    <p className={`text-[11px] ${device.statusCls}`}>{device.status}</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-xs text-blue-600 font-medium hover:underline">+ Add Device</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}