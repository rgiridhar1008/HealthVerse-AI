import React, { useState, useEffect, useRef } from 'react';
import { reportApi } from '../services/reportApi';
import { ReportAnalysis, ReportListItem } from '../types/report';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, File, X, Loader2, AlertCircle, CheckCircle2, Circle,
  AlertTriangle, FileText, Activity, ShieldCheck, ChevronRight,
  Clock, RefreshCw, ArrowLeft, Eye
} from 'lucide-react';

const STAGES = [
  { key: 'EXTRACTING_TEXT', label: 'Extracting PDF text' },
  { key: 'IDENTIFYING_BIOMARKERS', label: 'Identifying medical biomarkers' },
  { key: 'GENERATING_CLINICAL_INSIGHTS', label: 'Generating clinical insights' },
  { key: 'PREPARING_REPORT', label: 'Preparing final report' }
];

const getStageIndex = (stage: string) => {
  switch (stage) {
    case 'EXTRACTING_TEXT': return 0;
    case 'IDENTIFYING_BIOMARKERS': return 1;
    case 'GENERATING_CLINICAL_INSIGHTS': return 2;
    case 'PREPARING_REPORT': return 3;
    case 'COMPLETED': return 4;
    default: return 0;
  }
};

const Reports: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'complete'>('idle');
  const [currentProcessingStage, setCurrentProcessingStage] = useState<string>('EXTRACTING_TEXT');
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysis | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Previous reports list
  const [reportsList, setReportsList] = useState<ReportListItem[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const data = await reportApi.getAllReports();
      setReportsList(data || []);
    } catch (err) {
      console.warn('Could not load previous reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadState('idle');
    setAnalysisResult(null);
    setSelectedReportId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setError('');
    setUploadState('uploading');

    try {
      const { id } = await reportApi.uploadReport(file, (progress) => {
        setUploadProgress(progress);
      });
      setSelectedReportId(id);

      setUploadState('analyzing');
      setCurrentProcessingStage('EXTRACTING_TEXT');
      let analysis = await reportApi.getAnalysis(id);
      if (analysis?.currentStage) {
        setCurrentProcessingStage(analysis.currentStage);
      }

      let attempts = 0;
      while (analysis.analysisStatus === 'PENDING' && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        analysis = await reportApi.checkAnalysisStatus(id);
        if (analysis?.currentStage) {
          setCurrentProcessingStage(analysis.currentStage);
        }
        attempts++;
      }

      setAnalysisResult(analysis);
      setUploadState('complete');
      fetchReports();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'An error occurred during upload or analysis. Please try again.');
      setUploadState('idle');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleViewReport = async (reportId: string) => {
    setActionLoadingId(reportId);
    setError('');
    try {
      let analysis = await reportApi.checkAnalysisStatus(reportId);
      // If no analysis exists yet or pending, trigger analysis
      if (!analysis || analysis.analysisStatus === 'PENDING') {
        setUploadState('analyzing');
        setCurrentProcessingStage(analysis?.currentStage || 'EXTRACTING_TEXT');
        analysis = await reportApi.getAnalysis(reportId);
        let attempts = 0;
        while (analysis.analysisStatus === 'PENDING' && attempts < 40) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          analysis = await reportApi.checkAnalysisStatus(reportId);
          if (analysis?.currentStage) {
            setCurrentProcessingStage(analysis.currentStage);
          }
          attempts++;
        }
      }
      setSelectedReportId(reportId);
      setAnalysisResult(analysis);
      setUploadState('complete');
    } catch (err: any) {
      setError('Unable to load analysis for this report. You can try re-analyzing it.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReanalyze = async (reportId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoadingId(reportId);
    setError('');
    try {
      setUploadState('analyzing');
      setCurrentProcessingStage('EXTRACTING_TEXT');
      let analysis = await reportApi.getAnalysis(reportId);
      if (analysis?.currentStage) {
        setCurrentProcessingStage(analysis.currentStage);
      }
      let attempts = 0;
      while (analysis.analysisStatus === 'PENDING' && attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        analysis = await reportApi.checkAnalysisStatus(reportId);
        if (analysis?.currentStage) {
          setCurrentProcessingStage(analysis.currentStage);
        }
        attempts++;
      }
      setSelectedReportId(reportId);
      setAnalysisResult(analysis);
      setUploadState('complete');
      fetchReports();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Re-analysis failed. Please try again later.');
      setUploadState('idle');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-secondary-50 rounded-xl">
              <FileText className="h-8 w-8 text-secondary-600" />
            </div>
            Medical Reports
          </h1>
          <p className="text-slate-500 mt-2">Upload your blood tests or medical documents for instant AI wellness analysis.</p>
        </div>
        {uploadState === 'complete' && (
          <button
            onClick={clearFile}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Uploads & History
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Section (idle state) */}
      {uploadState === 'idle' && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8"
          >
            {!file ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-12 sm:p-16 text-center transition-all duration-300 cursor-pointer overflow-hidden group
                  ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-400 hover:bg-slate-50'}`}
              >
                <div className={`absolute inset-0 bg-primary-500/5 transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`} />

                <div className="relative z-10 flex flex-col items-center">
                  <motion.div
                    animate={{ y: isDragging ? -10 : 0, scale: isDragging ? 1.1 : 1 }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                      ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-500'}`}
                  >
                    <UploadCloud className="h-10 w-10" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Drag & drop your report here</h3>
                  <p className="text-sm font-medium text-slate-500 mb-6">or click to browse your computer</p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                    <span>PDF</span> <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>JPG</span> <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>PNG</span> <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Max 10MB</span>
                  </div>
                </div>

                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  accept=".pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary-500" />
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100 text-secondary-500">
                      <File className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={clearFile}
                    className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={clearFile}
                    className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="px-6 py-3 text-sm font-bold text-white bg-primary-600 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" /> Analyze Report
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Uploaded Reports History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Your Uploaded Reports
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">View previous lab tests, extracted biomarkers, and AI recommendations.</p>
              </div>
              <button
                onClick={fetchReports}
                disabled={loadingReports}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 bg-slate-50 hover:bg-primary-50 rounded-lg border border-slate-200 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {loadingReports ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span className="text-sm font-medium">Loading reports history...</span>
              </div>
            ) : reportsList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">No reports uploaded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Upload a lab report PDF or image above to see biomarker breakdown here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {reportsList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900 text-sm">{item.fileName || 'Lab Report'}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${item.analysisStatus === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : item.analysisStatus === 'FAILED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                            {item.analysisStatus === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                            {item.analysisStatus === 'FAILED' && <AlertCircle className="w-3 h-3" />}
                            {item.analysisStatus !== 'COMPLETED' && item.analysisStatus !== 'FAILED' && <Loader2 className="w-3 h-3 animate-spin" />}
                            {item.analysisStatus || 'UPLOADED'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span>Date: {item.reportDate ? new Date(item.reportDate).toLocaleDateString() : 'Recent'}</span>
                          {item.fileSize && (
                            <>
                              <span>•</span>
                              <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                            </>
                          )}
                          {item.uploadDate && (
                            <>
                              <span>•</span>
                              <span>Uploaded {new Date(item.uploadDate).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {item.analysisStatus === 'COMPLETED' ? (
                        <button
                          onClick={() => handleViewReport(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-all"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          View Analysis
                        </button>
                      ) : item.analysisStatus === 'FAILED' ? (
                        <button
                          onClick={(e) => handleReanalyze(item.id, e)}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Retry Analysis
                        </button>
                      ) : (
                        <button
                          onClick={() => handleViewReport(item.id)}
                          disabled={actionLoadingId === item.id}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all"
                        >
                          {actionLoadingId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Activity className="w-3.5 h-3.5" />
                          )}
                          Analyze Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Loading States */}
      {(uploadState === 'uploading' || uploadState === 'analyzing') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center relative overflow-hidden"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50 animate-pulse" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 text-primary-600 animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              {uploadState === 'uploading' ? 'Uploading report...' : 'AI is analyzing your report...'}
            </h3>
            <p className="text-base text-slate-500 mb-8 max-w-md mx-auto">
              {uploadState === 'uploading'
                ? 'Securely transferring to our encrypted servers.'
                : 'Extracting medical markers and generating a personalized wellness summary.'}
            </p>

            {uploadState === 'uploading' && (
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                  <span>Uploading</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 p-0.5">
                  <div className="bg-primary-600 h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            {uploadState === 'analyzing' && (
              <div className="w-full max-w-md mx-auto bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-left">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
                  Live Processing Stages
                </div>
                <div className="space-y-3">
                  {STAGES.map((stg, idx) => {
                    const currentIdx = getStageIndex(currentProcessingStage);
                    const isDone = currentIdx > idx;
                    const isCurrent = currentIdx === idx;
                    return (
                      <div key={stg.key} className="flex items-center gap-3">
                        <div className="shrink-0">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isCurrent ? (
                            <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <span className={`text-sm ${isDone ? 'text-slate-700 font-medium' : isCurrent ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                          {stg.label}
                        </span>
                        {isCurrent && (
                          <span className="ml-auto text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                            In Progress
                          </span>
                        )}
                        {isDone && (
                          <span className="ml-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            Completed
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Analysis Result - Failed / Timeout */}
      {uploadState === 'complete' && analysisResult && (analysisResult.analysisStatus === 'FAILED' || analysisResult.analysisStatus === 'PENDING') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 rounded-2xl shadow-sm border border-red-200 overflow-hidden"
        >
          <div className="p-8 border-b border-red-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Analysis Failed</span>
              </div>
              <h3 className="text-2xl font-bold text-red-900">
                {analysisResult.analysisStatus === 'PENDING' ? 'Analysis Timeout' : 'Medical Report Analysis'}
              </h3>
              <p className="text-red-700 text-sm mt-1">
                {analysisResult.analysisStatus === 'PENDING'
                  ? 'The analysis is taking longer than expected. Please check back later.'
                  : (analysisResult.summary || 'AI analysis is currently unavailable. Please try again.')}
              </p>
            </div>
            <div className="flex gap-2">
              {selectedReportId && (
                <button
                  onClick={() => handleReanalyze(selectedReportId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  Retry Analysis
                </button>
              )}
              <button
                onClick={clearFile}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors border border-slate-300 shadow-sm"
              >
                Back to Reports
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analysis Result - Completed */}
      {uploadState === 'complete' && analysisResult && analysisResult.analysisStatus === 'COMPLETED' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Analysis Complete</span>
                </div>
                <h3 className="text-2xl font-bold">Medical Report Analysis</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Analyzed on {analysisResult.createdAt ? new Date(analysisResult.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearFile}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors border border-white/10 backdrop-blur-sm"
                >
                  All Reports
                </button>
              </div>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Summary */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Medical Summary
                  </h4>
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed h-full">
                    {analysisResult.summary}
                  </div>
                </div>

                {/* Abnormal Values */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-primary-600 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Abnormal Values
                  </h4>
                  <div className="bg-primary-50/50 p-5 rounded-xl border border-primary-100 text-primary-900 text-sm leading-relaxed h-full">
                    {analysisResult.abnormalValues && analysisResult.abnormalValues.length > 0 ? (
                      <div className="space-y-4">
                        {analysisResult.abnormalValues.map((abnormal, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-primary-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-slate-900">{abnormal.marker}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${abnormal.status?.toUpperCase() === 'HIGH' ? 'bg-red-100 text-red-700' :
                                  abnormal.status?.toUpperCase() === 'LOW' ? 'bg-amber-100 text-amber-700' :
                                    abnormal.status?.toUpperCase() === 'POSITIVE' ? 'bg-red-100 text-red-700' :
                                      abnormal.status?.toUpperCase() === 'NEGATIVE' ? 'bg-green-100 text-green-700' :
                                        'bg-slate-100 text-slate-700'
                                }`}>
                                {abnormal.status || 'ABNORMAL'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                              <div>
                                <span className="text-slate-500 block mb-0.5">Value</span>
                                <span className="font-semibold text-slate-800">{abnormal.value}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block mb-0.5">Reference</span>
                                <span className="font-semibold text-slate-800">{abnormal.referenceRange}</span>
                              </div>
                            </div>
                            <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                              {abnormal.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic">No abnormal values detected in this report.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Observations Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Key Biomarker Observations</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Marker</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {analysisResult.findings && analysisResult.findings.map((obs, idx) => (
                        <motion.tr
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * idx }}
                          key={idx}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{obs.parameter}</p>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900 whitespace-nowrap">
                            {obs.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${obs.interpretation?.toLowerCase() === 'normal' ? 'bg-green-100 text-green-700' :
                                obs.interpretation?.toLowerCase() === 'attention' ? 'bg-amber-100 text-amber-700' :
                                  obs.interpretation?.toLowerCase() === 'critical' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                              {obs.interpretation?.toLowerCase() === 'attention' && <AlertTriangle className="h-3 w-3 mr-1.5" />}
                              {obs.interpretation ? obs.interpretation.charAt(0).toUpperCase() + obs.interpretation.slice(1) : 'Normal'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Actionable Recommendations</h4>
                <div className="grid gap-4">
                  {analysisResult.recommendations && analysisResult.recommendations.map((rec, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + (0.05 * idx) }}
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-8 w-8 rounded-full bg-primary-50 flex items-center justify-center text-sm font-bold text-primary-600 shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              {analysisResult.disclaimer && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex items-start gap-4">
                  <div className="p-2 bg-slate-200 rounded-full shrink-0">
                    <AlertCircle className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-700">Important Disclaimer</h4>
                    <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">{analysisResult.disclaimer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Reports;
