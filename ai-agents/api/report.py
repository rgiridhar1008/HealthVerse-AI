from fastapi import APIRouter, HTTPException, UploadFile, File
from models.schemas import ReportAnalyzeRequest, ReportAnalyzeResponse, ReportObservation, AbnormalValue
from services.ai_provider import ai_provider, AIProviderError
from services.biomarker_extractor import extract_biomarkers
import PyPDF2
import io
import json
import re
import time

router = APIRouter()

SYSTEM_PROMPT = """You are an expert Medical Data Extractor AI.
Analyze the provided medical report and return ONLY a valid JSON object matching this schema:
{
  "summary": "1-3 sentences summarizing the overall report findings and patient health status.",
  "findings": [
    {"name": "test name", "value": "measured value with unit", "status": "normal, attention, or critical", "description": "brief marker description"}
  ],
  "abnormal_values": [
    {"marker": "test name", "value": "measured value with unit", "referenceRange": "normal range", "status": "HIGH or LOW", "explanation": "brief clinical meaning"}
  ],
  "normal_values": ["test name and value in normal range"],
  "explanations": "Plain language explanation of what the results mean for the patient.",
  "recommendations": ["Actionable health and wellness recommendation"],
  "disclaimer": "This analysis is for informational purposes only. Consult a healthcare professional."
}
Do NOT include markdown formatting outside the JSON object. Output valid JSON only."""


async def perform_analysis(text: str) -> dict:
    start = time.time()

    # Clean redundant whitespace to maximize dense biomarker content
    cleaned_text = re.sub(r'\n\s*\n+', '\n', text.strip())
    cleaned_text = re.sub(r'[ \t]+', ' ', cleaned_text)

    # 1. Deterministic Biomarker Pre-Extraction (preserves exact values, units, reference ranges)
    bio_result = extract_biomarkers(cleaned_text)
    
    if bio_result["findings"]:
        print(f"[BIOMARKER-EXTRACTOR] Extracted {len(bio_result['findings'])} biomarkers, {len(bio_result['abnormal_values'])} abnormal in 0ms")
        
        abnormal_summary = "\n".join([
            f"- {a['marker']}: {a['value']} (Ref: {a['referenceRange']}, Status: {a['status']})"
            for a in bio_result["abnormal_values"]
        ]) if bio_result["abnormal_values"] else "All measured parameters within normal laboratory limits."
        
        all_markers_summary = ", ".join([f"{f['name']} ({f['value']})" for f in bio_result["findings"][:15]])
        
        synth_prompt = (
            f"The following biomarkers were deterministically extracted from the patient's lab report:\n"
            f"Abnormal Findings:\n{abnormal_summary}\n\n"
            f"Sample of Tested Markers: {all_markers_summary}\n\n"
            f"Provide a clinical synthesis in JSON format:\n"
            f"{{\n"
            f'  "summary": "1-2 sentences summarizing clinical findings and general health status",\n'
            f'  "explanations": "Plain language clinical explanation of what the abnormal and key findings indicate",\n'
            f'  "recommendations": ["3-4 specific, actionable lifestyle, dietary, or clinical follow-up recommendations"],\n'
            f'  "abnormal_explanations": {{"Marker Name": "Specific clinical reason/context for abnormal level"}}\n'
            f"}}"
        )
        
        synth_system = (
            "You are an expert Clinical Pathologist and Medical AI. "
            "Interpret the extracted laboratory findings concisely and professionally. "
            "Output valid JSON only matching the schema."
        )
        
        try:
            llm_synth = await ai_provider.generate_json(
                prompt=synth_prompt,
                system_prompt=synth_system,
                max_tokens=400,
                temperature=0.1,
                feature="report"
            )
        except Exception as e:
            print(f"[AI-AGENT-WARN] LLM synthesis failed, using fallback clinical defaults: {e}")
            llm_synth = {}

        abnormal_exps = llm_synth.get("abnormal_explanations", {}) if isinstance(llm_synth.get("abnormal_explanations"), dict) else {}
        for ab in bio_result["abnormal_values"]:
            marker = ab["marker"]
            if marker in abnormal_exps:
                ab["explanation"] = str(abnormal_exps[marker])

        raw_recs = llm_synth.get("recommendations", [])
        recs = []
        if isinstance(raw_recs, list) and raw_recs:
            recs = [str(r) for r in raw_recs if r]
        else:
            recs = [
                "Schedule a follow-up consultation with your physician to discuss these findings.",
                "Review lifestyle, diet, and hydration habits tailored to the identified biomarkers."
            ]

        summary_text = str(llm_synth.get("summary") or (
            f"Lab report evaluated: {len(bio_result['abnormal_values'])} markers require clinical attention."
            if bio_result["abnormal_values"]
            else "All evaluated laboratory biomarkers are within optimal clinical reference ranges."
        ))

        explanation_text = str(llm_synth.get("explanations") or summary_text)

        elapsed = int((time.time() - start) * 1000)
        print(f"[REPORT-TIMING] total_optimized_analysis_time={elapsed}ms")

        return {
            "summary": summary_text,
            "findings": bio_result["findings"],
            "abnormal_values": bio_result["abnormal_values"],
            "normal_values": bio_result["normal_values"],
            "explanations": explanation_text,
            "recommendations": recs,
            "disclaimer": "This analysis is for informational purposes only. Consult a healthcare professional."
        }

    # Fallback to general LLM extraction if no standard structured biomarkers were matched
    print("[REPORT-FALLBACK] No standard biomarkers matched by regex; using full LLM extraction")
    if len(cleaned_text) > 6000:
        cleaned_text = cleaned_text[:6000] + "\n... [ADDITIONAL LAB TEXT TRUNCATED]"

    prompt = f"Analyze this medical report thoroughly and extract structured data:\n\n{cleaned_text}"

    raw_data = await ai_provider.generate_json(
        prompt=prompt,
        system_prompt=SYSTEM_PROMPT,
        max_tokens=1024,
        temperature=0.1,
        feature="report"
    )

    # Sanitize and guarantee all fields match expected structure
    sanitized = {
        "summary": str(raw_data.get("summary") or "Medical report processed successfully."),
        "findings": [],
        "abnormal_values": [],
        "normal_values": [],
        "explanations": str(raw_data.get("explanations") or raw_data.get("summary") or "Review results with your physician."),
        "recommendations": [],
        "disclaimer": str(raw_data.get("disclaimer") or "This analysis is for informational purposes only. Consult a healthcare professional.")
    }

    # Normalize findings
    raw_findings = raw_data.get("findings")
    if isinstance(raw_findings, list):
        for item in raw_findings:
            if isinstance(item, dict):
                sanitized["findings"].append({
                    "name": str(item.get("name") or "Unknown marker"),
                    "value": str(item.get("value") or "N/A"),
                    "status": str(item.get("status") or "normal").lower(),
                    "description": str(item.get("description") or "")
                })

    # Normalize abnormal_values
    raw_abnormal = raw_data.get("abnormal_values")
    if isinstance(raw_abnormal, list):
        for item in raw_abnormal:
            if isinstance(item, dict):
                status_val = str(item.get("status") or "ATTENTION").upper()
                if status_val not in ["HIGH", "LOW", "POSITIVE", "NEGATIVE"]:
                    status_val = "HIGH" if "high" in status_val.lower() else ("LOW" if "low" in status_val.lower() else "ATTENTION")
                sanitized["abnormal_values"].append({
                    "marker": str(item.get("marker") or item.get("name") or "Abnormal marker"),
                    "value": str(item.get("value") or "N/A"),
                    "referenceRange": str(item.get("referenceRange") or item.get("reference_range") or "See lab reference"),
                    "status": status_val,
                    "explanation": str(item.get("explanation") or "Value outside typical reference range.")
                })

    # Normalize normal_values
    raw_normals = raw_data.get("normal_values")
    if isinstance(raw_normals, list):
        for item in raw_normals:
            if isinstance(item, str):
                sanitized["normal_values"].append(item)
            elif isinstance(item, dict):
                sanitized["normal_values"].append(f"{item.get('name', '')}: {item.get('value', '')}")

    # Normalize recommendations
    raw_recs = raw_data.get("recommendations")
    if isinstance(raw_recs, list):
        for item in raw_recs:
            if isinstance(item, str):
                sanitized["recommendations"].append(item)
            elif isinstance(item, dict):
                sanitized["recommendations"].append(str(item.get("text") or item.get("recommendation") or str(item)))

    if not sanitized["recommendations"]:
        sanitized["recommendations"] = [
            "Discuss these test results with your primary healthcare provider.",
            "Maintain adequate hydration and balanced nutrition."
        ]

    elapsed = int((time.time() - start) * 1000)
    print(f"[REPORT-TIMING] total_analysis_time={elapsed}ms")
    return sanitized


@router.post("/analyze", response_model=ReportAnalyzeResponse)
async def analyze_report(request: ReportAnalyzeRequest):
    print(f"[AI-AGENT] Received report analysis request ({len(request.report_text)} chars)")
    try:
        result = await perform_analysis(request.report_text)
        validated = ReportAnalyzeResponse(**result)
        print(f"[AI-AGENT] Report analysis completed and validated successfully")
        return validated
    except AIProviderError as e:
        print(f"[AI-AGENT-ERROR] Provider error during report analysis: {e.message}")
        raise HTTPException(status_code=e.status_code, detail={"errorCode": e.error_code, "message": e.message, "service": "ai-agent-service"})
    except Exception as e:
        import traceback
        print(f"[AI-AGENT-ERROR] Unexpected error during report analysis: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail={"errorCode": "REPORT_ANALYSIS_FAILED", "message": str(e), "service": "ai-agent-service"})


@router.post("/upload", response_model=ReportAnalyzeResponse)
async def analyze_report_pdf(file: UploadFile = File(...)):
    print(f"[AI-AGENT] Received PDF upload analysis request: {file.filename}")
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail={"errorCode": "INVALID_FILE_TYPE", "message": "Only PDF files are supported", "service": "ai-agent-service"})

    try:
        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        extracted_text = ""
        for page in pdf_reader.pages:
            extracted_text += page.extract_text() + "\n"

        if not extracted_text.strip():
            # Fallback to OCR for scanned PDFs
            try:
                import pytesseract
                from pdf2image import convert_from_bytes
                images = convert_from_bytes(content)
                for image in images:
                    extracted_text += pytesseract.image_to_string(image) + "\n"
            except Exception as e:
                print(f"[AI-AGENT-WARN] OCR fallback failed: {e}")

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail={"errorCode": "EMPTY_PDF_TEXT", "message": "Could not extract text from PDF. It may be scanned or empty.", "service": "ai-agent-service"}
            )

        result = await perform_analysis(extracted_text)
        return ReportAnalyzeResponse(**result)
    except HTTPException:
        raise
    except AIProviderError as e:
        raise HTTPException(status_code=e.status_code, detail={"errorCode": e.error_code, "message": e.message, "service": "ai-agent-service"})
    except Exception as e:
        import traceback
        print(f"[AI-AGENT-ERROR] PDF processing failed: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail={"errorCode": "PDF_PROCESSING_FAILED", "message": str(e), "service": "ai-agent-service"})
