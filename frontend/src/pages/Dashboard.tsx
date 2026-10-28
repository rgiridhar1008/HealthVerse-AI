import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Activity, Moon, Flame, Droplets, Scale, ActivitySquare, Bell, Sparkles, ArrowRight,
  CheckCircle2, Circle, AlertCircle, ChevronRight, FileText, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { twinApi } from '../services/twinApi';
import { reportApi } from '../services/reportApi';
import { TwinMetrics } from '../types/twin';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState<TwinMetrics | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [twinDataRes, reportsRes] = await Promise.all([
          twinApi.getTwinStatus(),
          reportApi.getAllReports()
        ]);
        setTwinData(twinDataRes);
        setRecentReports(reportsRes.slice(0, 3)); // Only show latest 3
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
        <p className="text-slate-500">Loading your Health Twin...</p>
      </div>
    );
  }

  const isInsufficient = twinData?.status === 'insufficient data' || twinData?.status === 'AI Service Error: timeout';

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Good morning, {user?.name.split(' ')[0] || 'User'}</h1>
          <p className="mt-1 text-slate-500">Here's your health overview for <span className="font-semibold text-slate-700">{today}</span>.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Health Score & Insights) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Animated Health Score */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity className="w-24 h-24 text-primary-500" />
            </div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 z-10">Your Health Score</h2>
            
            <div className="relative w-48 h-48 flex items-center justify-center z-10 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  cx="96" cy="96" r="88" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="552.9" 
                  initial={{ strokeDashoffset: 552.9 }}
                  animate={{ strokeDashoffset: isInsufficient ? 552.9 : 552.9 - (552.9 * ((twinData?.overallWellnessScore || 0) / 100)) }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  className="text-primary-500" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-6xl font-black text-slate-900"
                >
                  {isInsufficient ? '--' : twinData?.overallWellnessScore || 0}
                </motion.span>
                <span className="text-sm text-primary-600 font-bold tracking-wide mt-1">
                  {isInsufficient ? 'NO DATA' : (twinData?.overallWellnessScore || 0) >= 80 ? 'EXCELLENT' : (twinData?.overallWellnessScore || 0) >= 60 ? 'GOOD' : 'NEEDS WORK'}
                </span>
              </div>
            </div>
            
            <div className="mt-6 flex items-center text-sm font-medium text-primary-700 bg-primary-50 px-4 py-2 rounded-full z-10">
              {isInsufficient ? (
                <span>Add data to see score</span>
              ) : (
                <span className="capitalize">{twinData?.status}</span>
              )}
            </div>
          </motion.div>

          {/* AI Health Insight */}
          <motion.div variants={item} className="bg-gradient-to-br from-accent-600 to-accent-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-20 h-20" />
            </div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <Sparkles className="h-5 w-5 text-accent-300" />
              <h3 className="font-semibold text-accent-100 tracking-wide uppercase text-sm">AI Health Insight</h3>
            </div>
            <div className="relative z-10 space-y-3">
              {isInsufficient ? (
                <>
                  <p className="text-lg font-medium leading-snug">Welcome to HealthVerse AI.</p>
                  <p className="text-accent-200 text-sm leading-relaxed">
                    Log your weight, sleep, and activity to get personalized AI insights and predictions.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium leading-snug">
                    {twinData?.insights?.[0] || 'Your health data has been analyzed.'}
                  </p>
                  <p className="text-accent-200 text-sm leading-relaxed">
                    {twinData?.recommendations?.[0] || 'Keep logging your daily metrics.'}
                  </p>
                </>
              )}
              <div className="pt-2">
                <button className="flex items-center text-sm font-semibold text-white hover:text-accent-200 transition-colors">
                  View Full Report <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Wellness Risk Indicators */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Wellness Overview</h3>
            <div className="space-y-6">
              {isInsufficient ? (
                <div className="text-sm text-slate-500">Not enough data to calculate wellness indicators.</div>
              ) : (
                twinData?.radarData.map((indicator, idx) => {
                  const percentage = (indicator.A / indicator.fullMark) * 100;
                  let colorClass = 'bg-primary-500';
                  let statusText = 'Excellent';
                  
                  if (percentage < 75 && percentage >= 50) {
                    colorClass = 'bg-warning-500';
                    statusText = 'Needs Attention';
                  } else if (percentage < 50) {
                    colorClass = 'bg-critical-500';
                    statusText = 'Critical';
                  }
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-slate-700">{indicator.subject}</span>
                        <span className="text-xs font-semibold text-slate-500">{indicator.A}/{indicator.fullMark}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.5 + (idx * 0.2) }}
                          className={`h-full rounded-full ${colorClass}`} 
                        />
                      </div>
                      <p className={`text-xs font-medium ${percentage < 50 ? 'text-critical-600' : percentage < 75 ? 'text-warning-600' : 'text-primary-600'}`}>
                        {statusText}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>

        </div>

        {/* Right Column (Metrics, Trends, Plan) */}
        <div className="lg:col-span-8 space-y-8 min-w-0 overflow-hidden">
          
          {/* Top Metrics Grid */}
          <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MetricCard title="Energy Score" value={isInsufficient ? '--' : twinData?.energyScore} unit="/100" trend={isInsufficient ? '' : twinData?.activityTrendString} icon={Activity} color="text-secondary-600" bg="bg-secondary-50" />
            <MetricCard title="Recovery Score" value={isInsufficient ? '--' : twinData?.recoveryScore} unit="/100" trend={isInsufficient ? '' : twinData?.sleepTrendString} icon={Moon} color="text-accent-600" bg="bg-accent-50" />
            <MetricCard title="Weight Trend" value={isInsufficient ? '--' : twinData?.weightTrend?.[0]?.weight || '--'} unit="kg" trend={isInsufficient ? '' : twinData?.weightTrendString} icon={Scale} color="text-slate-600" bg="bg-slate-50" />
            <MetricCard title="Activity Adherence" value={isInsufficient ? '--' : twinData?.nutritionAdherence} unit="%" icon={ActivitySquare} color="text-primary-600" bg="bg-primary-50" />
          </motion.div>

          {/* Health Trends Chart */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Activity vs Sleep Trend</h3>
            </div>
            {isInsufficient ? (
              <div className="h-72 w-full flex items-center justify-center bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-slate-400 font-medium">Log 7 days of data to see your trends.</p>
              </div>
            ) : (
              <div className="h-72 w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={twinData?.activitySleepTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area yAxisId="left" type="monotone" dataKey="activity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                    <Area yAxisId="right" type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Today's Wellness Plan Timeline */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">AI Health Journey</h3>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {isInsufficient ? (
                  <div className="text-sm text-slate-500">Not enough history to generate journey events.</div>
                ) : twinData?.journeyEvents?.length ? (
                  twinData.journeyEvents.map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + (idx * 0.1) }}
                      className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                    >
                      <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-slate-200 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {item.type === 'positive' || item.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-primary-500 bg-white rounded-full" /> : <Circle className="w-5 h-5 text-warning-500 bg-white rounded-full" />}
                      </div>
                      
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-primary-600">{item.date}</span>
                          <h4 className="font-semibold text-sm text-slate-800">{item.event}</h4>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">No events found.</div>
                )}
              </div>
            </motion.div>

            {/* Recent Reports Placeholder / Adherence */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Recent Reports</h3>
              <div className="space-y-4">
                {recentReports.length > 0 ? recentReports.map((report: any) => (
                  <div key={report.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-secondary-50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{report.fileName || report.reportType}</h4>
                      <p className="text-xs text-slate-500 mt-1">Date: {new Date(report.reportDate).toLocaleDateString()}</p>
                      {report.analysisStatus === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 mt-2 bg-primary-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Analyzed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600 mt-2 bg-warning-50 px-2 py-0.5 rounded-full">
                          <Activity className="w-3 h-3 animate-spin" /> Processing
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500">No recent reports found. Upload a report to see it here.</div>
                )}
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </motion.div>
  );
};

// Helper component for the metric cards inside the new dashboard
const MetricCard = ({ title, value, unit, trend, icon: Icon, color, bg }: any) => {
  const isUp = trend?.includes('+');
  return (
    <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isUp ? 'bg-primary-50 text-primary-700' : 'bg-warning-50 text-warning-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-slate-900">{value}</span>
          {unit && <span className="text-sm font-medium text-slate-500">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
