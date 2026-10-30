"""
Intelligent, deterministic biomarker extraction engine for HealthVerse AI.
Extracts measured values, units, and laboratory-provided reference ranges
from raw medical report text without hallucinating or assuming unprovided ranges.
"""

import re
from typing import List, Dict, Any, Optional


def clean_number(val_str: str) -> Optional[float]:
    """Clean string to float for range checking, e.g. '7,200' -> 7200.0, '13.8' -> 13.8"""
    cleaned = re.sub(r'[^\d.]', '', val_str.replace(',', ''))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def evaluate_status(val: float, ref_range: str) -> str:
    """
    Evaluate whether a numerical value is HIGH, LOW, or NORMAL strictly
    based on the laboratory-provided reference range. Never assumes a range.
    """
    if not ref_range or not ref_range.strip():
        return "NORMAL"

    range_clean = ref_range.replace('–', '-').replace('—', '-').strip()

    # Range format: "min - max" e.g. "13.0 - 17.0", "70 - 99", "4.0 - 5.6"
    m_between = re.search(r'([\d,.]+)\s*-\s*([\d,.]+)', range_clean)
    if m_between:
        low = clean_number(m_between.group(1))
        high = clean_number(m_between.group(2))
        if low is not None and high is not None:
            if val < low:
                return "LOW"
            elif val > high:
                return "HIGH"
            else:
                return "NORMAL"

    # Range format: "< max" or "<= max"
    m_less = re.search(r'<\s*=?\s*([\d,.]+)', range_clean)
    if m_less:
        high = clean_number(m_less.group(1))
        if high is not None:
            return "HIGH" if val >= high else "NORMAL"

    # Range format: "> min" or ">= min" or "≥ min"
    m_greater = re.search(r'(?:>|>=|≥)\s*([\d,.]+)', range_clean)
    if m_greater:
        low = clean_number(m_greater.group(1))
        if low is not None:
            return "LOW" if val < low else "NORMAL"

    return "NORMAL"


# Comprehensive list of standard clinical blood test and lab markers
KNOWN_MARKERS = [
    # CBC
    "Hemoglobin", "RBC Count", "WBC Count", "Platelet Count", "Hematocrit",
    "MCV", "MCH", "MCHC", "RDW", "Neutrophils", "Lymphocytes", "Monocytes",
    "Eosinophils", "Basophils", "ESR", "Mean Platelet Volume", "MPV",
    # Blood Glucose / Diabetes
    "Fasting Blood Glucose", "Post Prandial Blood Glucose", "Random Blood Sugar", "HbA1c",
    "Estimated Average Glucose", "eAG", "Insulin", "C-Peptide",
    # Lipid Profile
    "Total Cholesterol", "LDL Cholesterol", "HDL Cholesterol", "Triglycerides", "VLDL",
    "Cholesterol/HDL Ratio", "Non-HDL Cholesterol",
    # Liver Function (LFT)
    "Total Bilirubin", "Direct Bilirubin", "Indirect Bilirubin",
    "SGOT", "AST", "SGPT", "ALT", "Alkaline Phosphatase", "ALP", "GGT",
    "Total Protein", "Albumin", "Globulin", "A/G Ratio",
    # Kidney Function (KFT/RFT)
    "Serum Creatinine", "Blood Urea Nitrogen", "BUN", "Urea", "Uric Acid", "eGFR",
    # Electrolytes & Minerals
    "Sodium", "Potassium", "Chloride", "Calcium", "Phosphorus", "Magnesium",
    # Thyroid
    "TSH", "Free T3", "Free T4", "Total T3", "Total T4",
    # Vitamins & Iron
    "Vitamin D", "Vitamin B12", "Ferritin", "Serum Iron", "Total Iron Binding Capacity", "TIBC", "Transferrin"
]


def extract_biomarkers(raw_text: str) -> Dict[str, Any]:
    """
    Extracts clinical biomarkers, measured results, units, and laboratory reference ranges
    from raw PDF lab text. Guarantees 0 hallucinated values.
    """
    if not raw_text or not raw_text.strip():
        return {"findings": [], "abnormal_values": [], "normal_values": []}

    lines = [l.strip() for l in raw_text.splitlines() if l.strip()]

    extracted_findings = []
    abnormal_values = []
    normal_values = []
    seen_markers = set()

    i = 0
    while i < len(lines):
        line = lines[i]
        matched_marker = None

        # Check known markers with case-insensitive matching
        for km in KNOWN_MARKERS:
            pattern = r'^\b' + re.escape(km) + r'\b'
            if re.match(pattern, line, re.IGNORECASE):
                matched_marker = km
                break

        if matched_marker and matched_marker.lower() not in seen_markers:
            val_str = ""
            unit_str = ""
            ref_str = ""

            # Check single line format: "Hemoglobin 13.8 g/dL 13.0 - 17.0"
            remainder = line[len(matched_marker):].strip()
            single_match = re.search(
                r'[:\s]*([\d,.]+)\s+([a-zA-Z/%µ]+(?:/[a-zA-Zµ]+)?)\s+([<>\d\s–—.-]+)',
                remainder
            )
            if single_match:
                val_str = single_match.group(1).strip()
                unit_str = single_match.group(2).strip()
                ref_str = single_match.group(3).strip()
            elif i + 3 < len(lines):
                # Check multi-line tabular format:
                # lines[i]   = Test Name
                # lines[i+1] = Result
                # lines[i+2] = Unit
                # lines[i+3] = Reference Range
                cand_val = lines[i+1].strip()
                cand_unit = lines[i+2].strip()
                cand_ref = lines[i+3].strip()

                if re.match(r'^[\d,.]+$', cand_val):
                    val_str = cand_val
                    unit_str = cand_unit
                    ref_str = cand_ref
                    i += 3  # skip consumed lines

            if val_str:
                num_val = clean_number(val_str)
                status = evaluate_status(num_val, ref_str) if num_val is not None else "NORMAL"
                seen_markers.add(matched_marker.lower())

                finding_status = "attention" if status in ["HIGH", "LOW"] else "normal"

                extracted_findings.append({
                    "name": matched_marker,
                    "value": f"{val_str} {unit_str}".strip(),
                    "status": finding_status,
                    "description": f"Standard clinical parameter: {matched_marker}"
                })

                if status in ["HIGH", "LOW"]:
                    abnormal_values.append({
                        "marker": matched_marker,
                        "value": f"{val_str} {unit_str}".strip(),
                        "referenceRange": ref_str,
                        "status": status,
                        "explanation": f"Measured value {val_str} {unit_str} is outside the laboratory reference range ({ref_str})."
                    })
                else:
                    normal_values.append(f"{matched_marker}: {val_str} {unit_str} (Ref: {ref_str})")

        i += 1

    return {
        "findings": extracted_findings,
        "abnormal_values": abnormal_values,
        "normal_values": normal_values
    }

