export interface Finding {
  parameter: string;
  value: string;
  unit: string;
  referenceRange: string;
  interpretation: 'normal' | 'attention' | 'critical' | string;
}

export interface AbnormalValue {
  marker: string;
  value: string;
  referenceRange: string;
  status: string;
  explanation: string;
}

export interface ReportAnalysis {
  id: string;
  reportId: string;
  analysisStatus: string;
  currentStage?: string;
  summary: string;
  findings: Finding[];
  abnormalValues: AbnormalValue[];
  recommendations: string[];
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportListItem {
  id: string;
  userId: number;
  fileName: string;
  contentType: string;
  fileSize: number;
  reportType: string;
  reportDate: string;
  description: string;
  uploadDate: string;
  processingStatus: string;
  analysisStatus: string;
}

