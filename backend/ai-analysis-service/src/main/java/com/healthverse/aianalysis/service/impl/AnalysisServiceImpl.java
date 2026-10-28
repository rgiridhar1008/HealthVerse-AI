package com.healthverse.aianalysis.service.impl;

import com.healthverse.aianalysis.entity.AnalysisReport;
import com.healthverse.aianalysis.entity.MedicalReport;
import com.healthverse.aianalysis.enums.AnalysisStatus;
import com.healthverse.aianalysis.exception.BadRequestException;
import com.healthverse.aianalysis.exception.ResourceNotFoundException;
import com.healthverse.aianalysis.repository.AnalysisReportRepository;
import com.healthverse.aianalysis.repository.MedicalReportRepository;
import com.healthverse.aianalysis.service.AnalysisService;
import com.healthverse.aianalysis.service.PdfExtractionService;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsOperations;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.healthverse.aianalysis.dto.ReportAnalyzeRequest;
import com.healthverse.aianalysis.dto.ReportAnalyzeResponse;

@Service
public class AnalysisServiceImpl implements AnalysisService {

    private final AnalysisReportRepository analysisRepository;
    private final MedicalReportRepository medicalReportRepository;
    private final PdfExtractionService pdfExtractionService;
    private final GridFsTemplate gridFsTemplate;
    private final GridFsOperations gridFsOperations;
    private final RestTemplate restTemplate;

    @Value("${ai.api-key:}")
    private String aiApiKey;

    public AnalysisServiceImpl(AnalysisReportRepository analysisRepository,
                               MedicalReportRepository medicalReportRepository,
                               PdfExtractionService pdfExtractionService,
                               GridFsTemplate gridFsTemplate,
                               GridFsOperations gridFsOperations,
                               RestTemplate restTemplate) {
        this.analysisRepository = analysisRepository;
        this.medicalReportRepository = medicalReportRepository;
        this.pdfExtractionService = pdfExtractionService;
        this.gridFsTemplate = gridFsTemplate;
        this.gridFsOperations = gridFsOperations;
        this.restTemplate = restTemplate;
    }

    @Override
    public AnalysisReport analyzeReport(String reportId, Long userId) {
        Optional<AnalysisReport> existing = analysisRepository.findByReportIdAndUserId(reportId, userId);
        if (existing.isPresent()) {
            throw new BadRequestException("Analysis already exists for this report. Use reanalyze instead.");
        }
        
        AnalysisReport analysis = new AnalysisReport();
        analysis.setReportId(reportId);
        analysis.setUserId(userId);
        analysis.setAnalysisStatus(AnalysisStatus.PENDING);
        analysis.setCreatedAt(LocalDateTime.now());
        analysis.setUpdatedAt(LocalDateTime.now());
        AnalysisReport saved = analysisRepository.save(analysis);
        
        java.util.concurrent.CompletableFuture.runAsync(() -> processAnalysis(saved, reportId, userId));
        return saved;
    }

    @Override
    public AnalysisReport reanalyzeReport(String reportId, Long userId) {
        AnalysisReport existing = analysisRepository.findByReportIdAndUserId(reportId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("No existing analysis found to reanalyze"));
        
        existing.setAnalysisStatus(AnalysisStatus.PENDING);
        existing.setUpdatedAt(LocalDateTime.now());
        AnalysisReport saved = analysisRepository.save(existing);
        
        java.util.concurrent.CompletableFuture.runAsync(() -> processAnalysis(saved, reportId, userId));
        return saved;
    }

    @Override
    public AnalysisReport getAnalysisByReportId(String reportId, Long userId) {
        return analysisRepository.findByReportIdAndUserId(reportId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found for this report"));
    }

    @Override
    public AnalysisReport getAnalysisById(String analysisId, Long userId) {
        return analysisRepository.findByIdAndUserId(analysisId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found"));
    }

    private void processAnalysis(AnalysisReport analysis, String reportId, Long userId) {
        long startTime = System.currentTimeMillis();
        try {
            MedicalReport report = medicalReportRepository.findByIdAndUserId(reportId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Medical report not found or unauthorized"));

            String extractedText = "No text extracted.";
            
            long gridfsStart = System.currentTimeMillis();
            if ("application/pdf".equals(report.getContentType())) {
                extractedText = extractFromGridFs(report.getGridFsFileId());
            } else {
                extractedText = "[Image format - OCR not implemented in mock mode]";
            }
            long pdfEnd = System.currentTimeMillis();
            System.out.println("[REPORT-TIMING] gridfs-and-pdf-extraction=" + (pdfEnd - gridfsStart) + "ms");

            long aiStart = System.currentTimeMillis();
            callExternalAiAnalysis(analysis, report, extractedText);
            long aiEnd = System.currentTimeMillis();
            System.out.println("[REPORT-TIMING] ai-agent-request=" + (aiEnd - aiStart) + "ms");
            
            long saveStart = System.currentTimeMillis();
            analysisRepository.save(analysis);
            long saveEnd = System.currentTimeMillis();
            System.out.println("[REPORT-TIMING] mongo-save=" + (saveEnd - saveStart) + "ms");
            System.out.println("[REPORT-TIMING] total=" + (saveEnd - startTime) + "ms");
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("[AI-ERROR] processAnalysis exception: " + e.getMessage());
            analysis.setAnalysisStatus(AnalysisStatus.FAILED);
            analysis.setSummary("Failed to process analysis: " + e.getMessage());
            analysisRepository.save(analysis);
        }
    }

    private String extractFromGridFs(String gridFsFileId) {
        try {
            GridFSFile gridFSFile = gridFsTemplate.findOne(new Query(Criteria.where("_id").is(new org.bson.types.ObjectId(gridFsFileId))));
            if (gridFSFile != null) {
                GridFsResource resource = gridFsOperations.getResource(gridFSFile);
                try (InputStream is = resource.getInputStream()) {
                    return pdfExtractionService.extractTextFromPdf(is);
                }
            }
        } catch (Exception e) {
            return "Error extracting text: " + e.getMessage();
        }
        return "File not found in GridFS";
    }

    private void callExternalAiAnalysis(AnalysisReport analysis, MedicalReport report, String extractedText) {
        analysis.setUpdatedAt(LocalDateTime.now());
        analysis.setAnalysisStatus(AnalysisStatus.COMPLETED);
        analysis.setDisclaimer("This analysis is for informational purposes only and is not a medical diagnosis. Consult a qualified healthcare professional for medical advice.");
        
        try {
            String aiAgentUrl = System.getenv("AI_AGENT_URL");
            if (aiAgentUrl == null || aiAgentUrl.isBlank()) {
                aiAgentUrl = "http://localhost:8000";
            }
            System.out.println("[AI-ANALYSIS] Calling ai-agent-service at: " + aiAgentUrl + "/api/v1/agents/report/analyze");
            ReportAnalyzeRequest request = new ReportAnalyzeRequest(extractedText);
            ResponseEntity<ReportAnalyzeResponse> response = restTemplate.postForEntity(
                aiAgentUrl + "/api/v1/agents/report/analyze", 
                request, 
                ReportAnalyzeResponse.class
            );
            System.out.println("[AI-ANALYSIS] Received HTTP status: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                ReportAnalyzeResponse aiResponse = response.getBody();
                analysis.setSummary(aiResponse.getSummary());
                
                List<AnalysisReport.Finding> findings = new ArrayList<>();
                if (aiResponse.getFindings() != null) {
                    for (ReportAnalyzeResponse.FindingDto dto : aiResponse.getFindings()) {
                        findings.add(new AnalysisReport.Finding(dto.getName(), dto.getValue(), "N/A", "N/A", dto.getStatus()));
                    }
                }
                analysis.setFindings(findings);
                List<AnalysisReport.AbnormalValue> abnormalValues = new ArrayList<>();
                if (aiResponse.getAbnormal_values() != null) {
                    for (ReportAnalyzeResponse.AbnormalValueDto dto : aiResponse.getAbnormal_values()) {
                        abnormalValues.add(new AnalysisReport.AbnormalValue(
                            dto.getMarker(), dto.getValue(), dto.getReferenceRange(), dto.getStatus(), dto.getExplanation()
                        ));
                    }
                }
                analysis.setAbnormalValues(abnormalValues);
                analysis.setRecommendations(aiResponse.getRecommendations() != null ? aiResponse.getRecommendations() : new ArrayList<>());
                if (aiResponse.getDisclaimer() != null) {
                    analysis.setDisclaimer(aiResponse.getDisclaimer());
                }
            } else {
                analysis.setSummary("AI analysis service returned empty or unsuccessful response: " + response.getStatusCode());
                analysis.setAnalysisStatus(AnalysisStatus.FAILED);
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            e.printStackTrace();
            String responseBody = e.getResponseBodyAsString();
            System.err.println("[AI-ERROR] HttpStatusCodeException: " + responseBody);
            analysis.setSummary("AI analysis failed (" + e.getStatusCode() + "): " + (responseBody.isBlank() ? e.getMessage() : responseBody));
            analysis.setAnalysisStatus(AnalysisStatus.FAILED);
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("[AI-ERROR] Generic Exception: " + e.getMessage());
            analysis.setSummary("AI analysis failed: " + e.getMessage());
            analysis.setAnalysisStatus(AnalysisStatus.FAILED);
        }
    }
}
