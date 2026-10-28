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
  summary: string;
  findings: Finding[];
  abnormalValues: AbnormalValue[];
  recommendations: string[];
  disclaimer: string;
  createdAt: string;
  updatedAt: string;
}
