import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, BarChart2, Download, Activity, RefreshCw, AlertTriangle, FileText, CheckCircle, List } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import generatePDF from 'react-to-pdf';

interface AnalyticsData {
  overallScore: number;
  healthScoreTrend: { date: string; score: number }[];
  categoryScores: { category: string; score: number; fill: string }[];
  metricsOverTime: { name: string; value: number; unit: string; date: string; category: string }[];
  statusDistribution?: { name: string; value: number; fill: string }[];
  summaryStats?: { totalReports: number; totalMetricsTracked: number };
  recentAlerts?: { title: string; severity: string; created_at: string }[];
}

export function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Ref for the content we want to export to PDF
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleExportPDF = () => {
    if (!data || !targetRef.current) return;
    
    // Using react-to-pdf to capture the view
    generatePDF(targetRef, { 
      filename: 'health-analytics-report.pdf',
      page: {
        margin: 10
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!data || (data.healthScoreTrend.length === 0 && data.categoryScores.length === 0)) {
    return (
      <div className="p-6 lg:p-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 mb-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <h2 className="text-3xl font-extrabold mb-2 relative z-10 tracking-tight">Health Analytics</h2>
          <p className="text-blue-100/90 text-base max-w-lg relative z-10">Deep insights into your health trends and historical data</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100/60 shadow-sm p-16 text-center transform transition-all hover:-translate-y-1 duration-300">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <BarChart2 className="w-10 h-10 text-blue-400/70" />
          </div>
          <p className="text-gray-800 font-semibold text-lg">No data available yet</p>
          <p className="text-gray-500 max-w-md mx-auto mt-2 mb-6">Upload a health report to start building your comprehensive analytics dashboard over time.</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-md transition-all duration-200"
          >
            Upload First Report
          </button>
        </div>
      </div>
    );
  }

  // Build unique metric names for metric-over-time chart
  const metricNames = [...new Set(data.metricsOverTime.map(m => m.name))];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  // Group metrics by name to find latest values for the list
  const latestMetrics = Object.values(
    data.metricsOverTime.reduce((acc: Record<string, any>, curr) => {
      // Keep replacing with the newer date since they are ordered ASC by DB 
      acc[curr.name] = curr;
      return acc;
    }, {})
  ).sort((a: any, b: any) => a.name.localeCompare(b.name));

  // Dynamic Theming based on gender
  const isFemale = user?.gender === 'female';
  const themeGradients = {
    female: "from-rose-600 via-pink-700 to-fuchsia-900",
    default: "from-blue-700 via-blue-800 to-indigo-900"
  };
  const themeText = {
    female: "text-pink-100",
    default: "text-blue-100"
  };
  const themeBg = {
    female: "bg-pink-400/10",
    default: "bg-blue-400/10"
  };
  
  const currentGradient = isFemale ? themeGradients.female : themeGradients.default;
  const currentText = isFemale ? themeText.female : themeText.default;
  const currentBg = isFemale ? themeBg.female : themeBg.default;

  return (
    <div className="p-4 lg:p-8 space-y-6 lg:space-y-8 bg-gray-50/30 min-h-full">
      {/* Header outside of PDF so the dark gradient looks good and doesn't get messed up if printed */}
      <div className={`bg-gradient-to-br ${currentGradient} rounded-3xl p-6 lg:p-8 text-white flex flex-col md:flex-row md:items-center justify-between shadow-xl relative overflow-hidden transition-colors duration-500`}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className={`absolute bottom-0 left-0 w-[300px] h-[300px] ${currentBg} rounded-full blur-2xl translate-y-1/3 -translate-x-1/4`}></div>
        
        <div className="relative z-10 mb-6 md:mb-0">
          <h2 className="text-3xl font-extrabold tracking-tight mb-2">Health Analytics</h2>
          <p className={`${currentText}/80 font-medium`}>Deep insights into your health trends</p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between md:justify-end gap-6 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="text-center px-4 border-r border-white/20">
            <div className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-${isFemale ? 'pink' : 'blue'}-100`}>{data.overallScore}</div>
            <div className={`text-${isFemale ? 'pink' : 'blue'}-200/80 text-xs font-semibold uppercase tracking-wider mt-1`}>Health Score</div>
          </div>
          <button
            onClick={handleExportPDF}
            className="flex flex-col items-center justify-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-5 h-5 pointer-events-none" />
            PDF Report
          </button>
        </div>
      </div>

      {/* Wrapping the main dashboard content in the ref for PDF generation */}
      <div ref={targetRef} className="space-y-6 lg:space-y-8 bg-gray-50/30 p-2">
        
        {/* PDF Header (Only visible slightly in normal flow, but good for the doc) */}
        <div className="hidden print:block text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">HealthVault Analytics Report</h1>
            <p className="text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        {/* Summary Stat Cards */}
        {data.summaryStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white rounded-2xl p-5 border border-indigo-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                 <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-0.5">Total Reports</p>
                <h4 className="text-2xl font-bold text-gray-900">{data.summaryStats.totalReports}</h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-emerald-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                 <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-0.5">Metrics Tracked</p>
                <h4 className="text-2xl font-bold text-gray-900">{data.summaryStats.totalMetricsTracked}</h4>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-amber-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
               <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <CheckCircle className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-500 mb-0.5">Normal Metrics</p>
                 <h4 className="text-2xl font-bold text-gray-900">
                   {data.statusDistribution?.find(d => d.name === 'Normal')?.value || 0}
                 </h4>
               </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-red-50 shadow-sm flex items-start gap-4 hover:-translate-y-1 transition-transform duration-300">
               <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-sm font-medium text-gray-500 mb-0.5">Critical Flags</p>
                 <h4 className="text-2xl font-bold text-red-600">
                   {data.statusDistribution?.find(d => d.name === 'Critical')?.value || 0}
                 </h4>
               </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Metric Status Distribution (PieChart) */}
          {data.statusDistribution && data.statusDistribution.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-1 flex flex-col">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Health Status</h3>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Pie
                      data={data.statusDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-4 w-full">
                  {data.statusDistribution.map((entry, index) => (
                     <div key={index} className="flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1 bg-gray-50 rounded-full">
                       <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                       {entry.name}: {entry.value}
                     </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Health Score Trend */}
          {data.healthScoreTrend.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Health Score Trend</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.healthScoreTrend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '3 3' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3B82F6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Recent Alerts List (Only show if there are alerts) */}
          {data.recentAlerts && data.recentAlerts.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
               <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Recent Alerts</h3>
              </div>
              <div className="space-y-4">
                {data.recentAlerts.map((alert, i) => (
                  <div key={i} className="flex gap-3 items-start border-l-2 pl-3 border-orange-400">
                     <div>
                       <p className="text-sm font-semibold text-gray-800">{alert.title}</p>
                       <p className="text-[11px] text-gray-400 mt-0.5">{new Date(alert.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/alerts')} 
                data-html2canvas-ignore="true"
                className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-semibold rounded-xl transition-colors">
                View All Alerts
              </button>
            </div>
          )}

          {/* Category Scores (Radar) */}
          {data.categoryScores.length >= 3 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-indigo-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Category Radar</h3>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={data.categoryScores}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Radar name="Score" dataKey="score" fill="#4338ca" fillOpacity={0.2} stroke="#4338ca" strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Metrics Over Time Grid */}
          {metricNames.length > 0 && (
            <div className="lg:col-span-3">
              <div className="flex items-center gap-2 mb-6 ml-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-violet-500" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Detailed Metric Trends</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metricNames.map((name, i) => {
                  const chartData = data.metricsOverTime.filter(m => m.name === name);
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={name} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-800 truncate pr-2">{name}</h4>
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-50 text-gray-500 rounded-full">{chartData[0]?.unit}</span>
                      </div>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} dy={5} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                            formatter={(val: number) => [`${val} ${chartData[0]?.unit || ''}`, name]}
                            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                          />
                          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Metric Deep-Dive List */}
          {latestMetrics.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-3 mt-4">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <List className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Latest Tracked Health Markers</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestMetrics.map((marker: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{marker.name}</p>
                      <p className="text-[11px] text-gray-400">{marker.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {marker.value} <span className="text-xs font-normal text-gray-500">{marker.unit}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
