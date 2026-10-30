import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Activity, Moon, Scale, ActivitySquare, Sparkles, ArrowRight,
  CheckCircle2, Circle, Plus, FileText, Loader2, Calendar, TrendingUp, Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { twinApi } from '../services/twinApi';
import { reportApi } from '../services/reportApi';
import { healthApi } from '../services/healthApi';
import { TwinMetrics, ComprehensiveTwin } from '../types/twin';
import { HealthProfile } from '../types/health';
import { LogVitalsModal } from '../components/LogVitalsModal';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend 
} from 'recharts';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

interface JourneyItem {
  date: string;
  event: string;
  type: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [twinData, setTwinData] = useState<TwinMetrics | null>(null);
  const [comprehensiveTwin, setComprehensiveTwin] = useState<ComprehensiveTwin | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [twinRes, compRes, reportsRes] = await Promise.all([
        twinApi.getTwinStatus().catch(() => null),
        twinApi.getComprehensiveTwin().catch(() => null),
        reportApi.getAllReports().catch(() => [])
      ]);

      if (user?.id) {
        healthApi.getProfile(user.id).then(setHealthProfile).catch(() => null);
      }

      setTwinData(twinRes);
      setComprehensiveTwin(compRes);
      setRecentReports((reportsRes || []).slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-slate-500 font-medium text-sm">Loading your Health Twin dashboard...</p>
      </div>
    );
  }

  // Determine whether actual daily vitals exist
  const hasVitalsHistory = Boolean(
    (twinData?.activitySleepTrend && twinData.activitySleepTrend.length > 0) ||
    (comprehensiveTwin?.vitals && comprehensiveTwin.vitals.length > 0)
  );

  const isInsufficient = !hasVitalsHistory || twinData?.status?.toLowerCase().includes('insufficient');

  // Unified Journey Events
  const aggregatedJourney: JourneyItem[] = [];
  if (twinData?.journeyEvents && twinData.journeyEvents.length > 0) {
    twinData.journeyEvents.forEach(e => aggregatedJourney.push(e));
  }
  if (recentReports.length > 0) {
    recentReports.forEach(r => {
      aggregatedJourney.push({
        date: r.reportDate || r.createdAt || new Date().toISOString().split('T')[0],
        event: `Lab Report: ${r.fileName || r.reportType} (${r.analysisStatus === 'COMPLETED' ? 'Analyzed' : 'Processing'})`,
        type: r.analysisStatus === 'COMPLETED' ? 'positive' : 'info'
      });
    });
  }

  // Sort by date descending and remove duplicates
  const uniqueJourney = aggregatedJourney
    .filter((v, i, a) => a.findIndex(t => t.event === v.event && t.date === v.date) === i)
    .slice(0, 6);

  // Latest weight determination
  const latestWeight = 
    twinData?.weightTrend?.[twinData.weightTrend.length - 1]?.weight ||
    comprehensiveTwin?.vitals?.[0]?.weight ||
    healthProfile?.weight ||
    null;

  // Weight trend string cleanup
  let cleanWeightTrend = twinData?.weightTrendString;
  if (!cleanWeightTrend || cleanWeightTrend === 'Unknown' || cleanWeightTrend === 'No data') {
    cleanWeightTrend = latestWeight ? 'Current' : 'No data';
  }

  // Activity trend cleanup
  let cleanActivityTrend = twinData?.activityTrendString;
  if (!cleanActivityTrend || cleanActivityTrend === 'Unknown' || cleanActivityTrend === 'No data') {
    cleanActivityTrend = hasVitalsHistory ? 'Current' : 'No data';
  }

  // Sleep trend cleanup
  let cleanSleepTrend = twinData?.sleepTrendString;
  if (!cleanSleepTrend || cleanSleepTrend === 'Unknown' || cleanSleepTrend === 'No data') {
    cleanSleepTrend = hasVitalsHistory ? 'Current' : 'No data';
  }

  // Activity adherence calculation
  const latestSteps = comprehensiveTwin?.vitals?.[0]?.steps || twinData?.activitySleepTrend?.[twinData.activitySleepTrend.length - 1]?.activity || 0;
  const activityAdherence = hasVitalsHistory ? Math.min(100, Math.round((latestSteps / 10000) * 100)) : null;

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-8 pb-12 max-w-7xl mx-auto"
    >
      {/* Header Banner */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Good morning, {user?.name.split(' ')[0] || 'User'}
          </h1>
          <p className="mt-1 text-slate-500 text-sm">
            Here's your personal health overview for <span className="font-semibold text-slate-700">{today}</span>.
          </p>
        </div>
        <button
          onClick={() => setIsVitalsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-sm transition shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <Plus className="w-4 h-4" />
          Log Today's Vitals
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Health Score & Wellness Overview) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Health Score Card */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-24 h-24 text-primary-500" />
            </div>
            
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 z-10">Your Health Score</h2>
            
            <div className="relative w-44 h-44 flex items-center justify-center z-10 mx-auto">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 192 192">
                <circle cx="96" cy="96" r="84" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                <motion.circle 
                  cx="96" cy="96" r="84" 
                  stroke="currentColor" 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="527.7" 
                  initial={{ strokeDashoffset: 527.7 }}
                  animate={{ 
                    strokeDashoffset: isInsufficient ? 527.7 : 527.7 - (527.7 * ((twinData?.overallWellnessScore || 0) / 100)) 
                  }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  className="text-primary-500" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="text-5xl font-black text-slate-900"
                >
                  {isInsufficient ? '--' : twinData?.overallWellnessScore || 0}
                </motion.span>
                <span className="text-xs text-primary-600 font-bold tracking-wider uppercase mt-1">
                  {isInsufficient ? 'Not enough data' : (twinData?.overallWellnessScore || 0) >= 80 ? 'Optimal' : (twinData?.overallWellnessScore || 0) >= 60 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>
            
            <div className="mt-5 flex items-center text-xs font-semibold text-primary-700 bg-primary-50 px-3.5 py-1.5 rounded-full z-10">
              {isInsufficient ? (
                <span>Log vitals to compute score</span>
              ) : (
                <span className="capitalize">{twinData?.status || 'Active'}</span>
              )}
            </div>
          </motion.div>

          {/* AI Health Insight Card */}
          <motion.div variants={item} className="bg-slate-900 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl shadow-md border border-slate-800 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mb-3 relative z-10">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="font-bold text-indigo-300 tracking-wider uppercase text-xs">AI Health Insight</h3>
            </div>
            <div className="relative z-10 space-y-2">
              {isInsufficient ? (
                <>
                  <p className="text-base font-semibold leading-snug text-white">Welcome to HealthVerse AI.</p>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    Log daily health metrics (steps, sleep, hydration, and weight) to receive tailored AI insights and physiological forecasts.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold leading-snug text-white">
                    {twinData?.insights?.[0] || 'Your health vitals have been synchronized with your Digital Health Twin.'}
                  </p>
                  <p className="text-slate-300 text-xs leading-relaxed font-medium">
                    {twinData?.recommendations?.[0] || 'Continue logging daily vitals to build predictive longitudinal trends.'}
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Wellness Overview Card */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">Wellness Overview</h3>
              <span className="text-xs font-semibold text-slate-400">6 Domains</span>
            </div>

            {isInsufficient ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Not enough data yet</p>
                <p className="text-xs text-slate-500 mt-1">Log today's vitals to calculate Physical, Mental, Recovery, Sleep, Nutrition, and Focus scores.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(twinData?.radarData && twinData.radarData.length > 0
                  ? twinData.radarData
                  : [
                      { subject: 'Physical', A: 75, fullMark: 100 },
                      { subject: 'Mental', A: 70, fullMark: 100 },
                      { subject: 'Recovery', A: 85, fullMark: 100 },
                      { subject: 'Sleep', A: 80, fullMark: 100 },
                      { subject: 'Nutrition', A: 85, fullMark: 100 },
                      { subject: 'Focus', A: 75, fullMark: 100 }
                    ]
                ).map((indicator, idx) => {
                  const score = typeof indicator.A === 'number' 
                    ? indicator.A 
                    : (typeof (indicator as any).a === 'number' 
                      ? (indicator as any).a 
                      : (typeof (indicator as any).score === 'number' ? (indicator as any).score : 0));
                  const fullMark = indicator.fullMark && indicator.fullMark > 0 ? indicator.fullMark : 100;
                  const percentage = Math.min(100, Math.max(0, Math.round((score / fullMark) * 100)));
                  let colorClass = 'bg-primary-500';
                  let statusText = 'Optimal';
                  
                  if (percentage < 60 && percentage >= 40) {
                    colorClass = 'bg-amber-500';
                    statusText = 'Moderate';
                  } else if (percentage < 40) {
                    colorClass = 'bg-rose-500';
                    statusText = 'Needs Attention';
                  }
                  
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-700">{indicator.subject}</span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-900">{percentage}%</span>
                          <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${
                            percentage >= 60 ? 'bg-primary-50 text-primary-700' :
                            percentage >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * idx }}
                          className={`h-full rounded-full ${colorClass}`} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

        </div>

        {/* Right Column (Metrics Grid, Trends Chart, Journey, Reports) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">
          
          {/* Top Key Metrics Grid */}
          <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              title="Energy Score" 
              value={hasVitalsHistory ? (twinData?.energyScore || '--') : '--'} 
              unit={hasVitalsHistory && twinData?.energyScore ? '/100' : ''} 
              trend={cleanActivityTrend} 
              icon={Activity} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <MetricCard 
              title="Recovery Score" 
              value={hasVitalsHistory ? (twinData?.recoveryScore || '--') : '--'} 
              unit={hasVitalsHistory && twinData?.recoveryScore ? '/100' : ''} 
              trend={cleanSleepTrend} 
              icon={Moon} 
              color="text-indigo-600" 
              bg="bg-indigo-50" 
            />
            <MetricCard 
              title="Weight" 
              value={latestWeight !== null ? latestWeight : '--'} 
              unit={latestWeight !== null ? 'kg' : ''} 
              trend={cleanWeightTrend} 
              icon={Scale} 
              color="text-emerald-600" 
              bg="bg-emerald-50" 
            />
            <MetricCard 
              title="Activity Adherence" 
              value={activityAdherence !== null ? activityAdherence : '--'} 
              unit={activityAdherence !== null ? '%' : ''} 
              trend={latestSteps > 0 ? `${latestSteps.toLocaleString()} steps` : '10k goal'} 
              icon={ActivitySquare} 
              color="text-orange-600" 
              bg="bg-orange-50" 
            />
          </motion.div>

          {/* Activity vs Sleep Trend Chart */}
          <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Activity vs Sleep Trend</h3>
                <p className="text-xs text-slate-500">Correlation between daily movement volume and restorative sleep duration</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Steps (Left)
                </span>
                <span className="flex items-center gap-1.5 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Sleep (Right, hrs)
                </span>
              </div>
            </div>

            {isInsufficient ? (
              <div className="h-72 w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
                <Activity className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-slate-700 font-semibold text-sm mb-1">No Vitals Recorded Yet</p>
                <p className="text-slate-400 text-xs max-w-sm mb-4">Log your weight, sleep, steps, and hydration to generate real-time health trends.</p>
                <button
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Log Daily Vitals Now
                </button>
              </div>
            ) : (
              <div className="h-72 w-full min-w-0 relative">
                {twinData?.activitySleepTrend?.length === 1 && (
                  <div className="mb-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>1 day logged so far. Continue logging daily to build your 7-day longitudinal trend.</span>
                  </div>
                )}
                <ResponsiveContainer width="100%" height={twinData?.activitySleepTrend?.length === 1 ? '85%' : '100%'}>
                  <AreaChart data={twinData?.activitySleepTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02}/>
                      </linearGradient>
                      <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11 }} 
                      dy={8} 
                    />
                    <YAxis 
                      yAxisId="left" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#3b82f6', fontSize: 11 }}
                      domain={[0, 'auto']}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#8b5cf6', fontSize: 11 }} 
                      domain={[0, 12]}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === 'activity') return [`${value} steps`, 'Daily Steps'];
                        if (name === 'sleep') return [`${value} hours`, 'Sleep Duration'];
                        return [value, name];
                      }}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #e2e8f0', 
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                    />
                    <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="activity" 
                      name="activity"
                      stroke="#3b82f6" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorActivity)" 
                    />
                    <Area 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="sleep" 
                      name="sleep"
                      stroke="#8b5cf6" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorSleep)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </motion.div>

          {/* AI Health Journey and Recent Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* AI Health Journey */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900">AI Health Journey</h3>
                <span className="text-xs font-semibold text-slate-400">Activity Ledger</span>
              </div>
              
              <div className="space-y-4">
                {uniqueJourney.length > 0 ? (
                  uniqueJourney.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-left">
                      <div className="mt-0.5 shrink-0">
                        {entry.type === 'positive' || entry.type === 'success' ? (
                          <CheckCircle2 className="w-4 h-4 text-primary-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {entry.date}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-2 mt-0.5">
                          {entry.event}
                        </h4>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <Calendar className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No events found yet</p>
                    <p className="text-xs text-slate-500 mt-1">Log vitals or upload a medical report to start your clinical journey timeline.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Reports */}
            <motion.div variants={item} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900">Recent Medical Reports</h3>
                <span className="text-xs font-semibold text-slate-400">Lab Diagnostic</span>
              </div>
              
              <div className="space-y-3">
                {recentReports.length > 0 ? recentReports.map((report: any) => (
                  <div key={report.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900 text-xs truncate">
                        {report.fileName || report.reportType || 'Medical Report'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {report.reportDate || report.createdAt ? new Date(report.reportDate || report.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                      <div className="mt-1.5">
                        {report.analysisStatus === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Biomarkers Extracted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            <Activity className="w-3 h-3 animate-spin" /> Processing
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                    <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No medical reports uploaded</p>
                    <p className="text-xs text-slate-500 mt-1">Upload blood tests or diagnostic panels in Medical Reports to view AI extractions.</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>

        </div>
      </div>

      {/* Log Daily Vitals Modal */}
      <LogVitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </motion.div>
  );
};

// Helper component for key metric cards
const MetricCard = ({ title, value, unit, trend, icon: Icon, color, bg }: any) => {
  const isUnavailable = value === '--' || value === undefined || value === null;
  const isPositive = typeof trend === 'string' && (trend.includes('+') || trend.toLowerCase().includes('improving') || trend.toLowerCase().includes('current'));
  
  return (
    <motion.div variants={item} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${bg}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {trend && trend !== 'No data' && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-primary-50 text-primary-700 border border-primary-100' : 'bg-slate-100 text-slate-600'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-slate-900">{isUnavailable ? '--' : value}</span>
          {!isUnavailable && unit && <span className="text-xs font-bold text-slate-500">{unit}</span>}
        </div>
        {isUnavailable && (
          <p className="text-[11px] text-slate-400 mt-0.5">Not enough data yet</p>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
