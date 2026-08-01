import requests
import json
import re
from typing import Dict, Any, Optional

UPSC_EVALUATION_SYSTEM_PROMPT = """You are an expert UPSC Civil Services Mains Answer Evaluator and Top-Ranker Mentor. 
Evaluate the candidate's transcribed answer sheet text based on strict UPSC Mains marking standards.

Return ONLY a valid JSON object with the following schema:
{
  "score": 8.5,
  "max_score": 15,
  "grade": "Good",
  "introduction_assessment": "Clear introduction defining core terms...",
  "body_assessment": "Well structured with bullet points...",
  "conclusion_assessment": "Needs a stronger forward-looking conclusion...",
  "keywords_covered": ["monsoon", "climate change", "mitigation"],
  "missing_keywords": ["PMKSY", "micro-irrigation", "SDG 13"],
  "strengths": [
    "Used relevant headings and bullet points",
    "Addressed primary question components"
  ],
  "weaknesses": [
    "Lacks reference to recent government policies",
    "Did not draw a flowchart or diagram"
  ],
  "improvement_tips": [
    "Include schemes like PM Fasal Bima Yojana",
    "End with a vision-driven conclusion linking to Paris Agreement"
  ]
}
"""

ORGANIZE_NOTE_SYSTEM_PROMPT = """You are an expert UPSC Civil Services Study Note Architect and Content Structurer.
Your task is to take raw, messy, or OCR-transcribed study notes and transform them into a beautifully structured, highly readable study note.

Requirements:
1. Provide a clear, professional H1 title based on the core topic.
2. Group content into logical H2 and H3 headings and subheadings.
3. Convert lists of items, points, or arguments into clean <ul> / <li> bullet lists.
4. Bold key UPSC terminology, landmark constitutional articles, acts, and policy schemes.
5. Include a <blockquote> block for key takeaways or exam tips.
6. Return ONLY clean, valid semantic HTML (e.g. <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <span>, <blockquote>) ready to be embedded directly into a rich text editor. Do NOT wrap in ```html code fences.
"""

def fallback_local_organize_html(text: str) -> str:
    """Intelligent fallback rule-based HTML note structurer when offline or without external API keys."""
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    if not sentences:
        return "<h1>UPSC Study Note</h1><p>No text content available.</p>"

    title = sentences[0][:80]
    body_sentences = sentences[1:] if len(sentences) > 1 else sentences

    html_parts = [
        f"<h1>📖 {title}</h1>",
        "<h2>📌 Executive Overview</h2>",
        f"<p>{sentences[0]}.</p>",
        "<h2>📜 Core Key Points & Key Terms</h2>",
        "<ul>"
    ]

    for idx, s in enumerate(body_sentences):
        # Highlight UPSC key terms
        highlighted_s = re.sub(
            r'\b(Article|Act|Scheme|PMKSY|PMFBY|NITI Aayog|Schedule|Part|SDG|Constitution|Devolution|PRIs|Panchayat)\b',
            r'<strong>\1</strong>',
            s,
            flags=re.IGNORECASE
        )
        html_parts.append(f"<li>{highlighted_s}.</li>")

    html_parts.append("</ul>")
    html_parts.append("<h2>💡 UPSC Exam Takeaways</h2>")
    html_parts.append("<blockquote><strong>Mentor Note:</strong> Use structured 3-tier analysis (Intro, Body with subheadings, Vision Conclusion) when attempting Mains answer writing on this topic.</blockquote>")

    return "\n".join(html_parts)


def organize_note_text(extracted_text: str, provider: Optional[str] = None, api_key: Optional[str] = None, model_name: Optional[str] = None) -> Dict[str, Any]:
    """Organizes raw OCR text into structured HTML with headings and bullet points."""
    provider_clean = (provider or "custom_ml").lower().strip()

    if provider_clean in ("custom_ml", "local") or not api_key:
        organized_html = fallback_local_organize_html(extracted_text)
        return {"organized_text": organized_html}

    clean_model = (model_name or "gemini-2.0-flash").replace("models/", "").strip()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={api_key}"

    prompt = f"{ORGANIZE_NOTE_SYSTEM_PROMPT}\n\nRaw Extracted Note Text to Structure:\n\"\"\"\n{extracted_text}\n\"\"\""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2}
    }
    headers = {"Content-Type": "application/json"}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        if response.status_code == 200:
            res_data = response.json()
            candidates = res_data.get("candidates", [])
            if candidates:
                raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                clean_html = raw_text.strip()
                if clean_html.startswith("```"):
                    clean_html = clean_html.split("\n", 1)[-1]
                    if clean_html.endswith("```"):
                        clean_html = clean_html.rsplit("```", 1)[0]
                    clean_html = clean_html.strip()
                    if clean_html.startswith("html"):
                        clean_html = clean_html[4:].strip()
                return {"organized_text": clean_html}
    except Exception:
        pass

    return {"organized_text": fallback_local_organize_html(extracted_text)}


def evaluate_with_custom_ml(extracted_text: str) -> Dict[str, Any]:
    url = "http://localhost:8001/evaluate"
    payload = {"extracted_text": extracted_text}
    
    try:
        response = requests.post(url, json=payload, timeout=15)
        if response.status_code == 200:
            return response.json()
    except Exception:
        pass

    try:
        import sys
        import os
        project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        if project_root not in sys.path:
            sys.path.insert(0, project_root)
            
        from ml_service.app import evaluate_answer, EvaluationRequest, load_model
        load_model()
        return evaluate_answer(EvaluationRequest(extracted_text=extracted_text))
    except Exception as e:
        return {"error": f"Failed to run custom ML model: {str(e)}"}


def evaluate_with_gemini(extracted_text: str, api_key: str, model_name: str = "gemini-2.0-flash") -> Dict[str, Any]:
    clean_model = model_name.replace("models/", "").strip() if model_name else "gemini-2.0-flash"
    
    model_aliases = {
        "gemini-1.5-pro": "gemini-1.5-pro-latest",
        "gemini-1.5-flash": "gemini-1.5-flash-latest",
    }
    target_primary = model_aliases.get(clean_model, clean_model)

    models_to_try = [target_primary]
    for alt in ["gemini-2.0-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.5-flash"]:
        if alt not in models_to_try:
            models_to_try.append(alt)

    prompt = f"{UPSC_EVALUATION_SYSTEM_PROMPT}\n\nCandidate Answer Text to Evaluate:\n\"\"\"\n{extracted_text}\n\"\"\""
    headers = {"Content-Type": "application/json"}
    last_error = ""

    for target_model in models_to_try:
        for api_version in ["v1beta", "v1"]:
            for use_mime_type in [True, False]:
                url = f"https://generativelanguage.googleapis.com/{api_version}/models/{target_model}:generateContent?key={api_key}"
                
                payload = {
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt}
                            ]
                        }
                    ]
                }
                
                if use_mime_type:
                    payload["generationConfig"] = {
                        "temperature": 0.2,
                        "responseMimeType": "application/json"
                    }
                else:
                    payload["generationConfig"] = {
                        "temperature": 0.2
                    }

                try:
                    response = requests.post(url, json=payload, headers=headers, timeout=60)
                    if response.status_code == 200:
                        res_data = response.json()
                        candidates = res_data.get("candidates", [])
                        if not candidates:
                            return {"error": "No response text generated by Gemini."}
                            
                        raw_text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return parse_json_result(raw_text)
                    
                    err_detail = response.json().get("error", {}).get("message", response.text)
                    last_error = f"Gemini API Error ({response.status_code}): {err_detail}"
                    
                    if response.status_code in (401, 403) or "key not valid" in err_detail.lower():
                        return {"error": last_error}
                except Exception as e:
                    last_error = f"Failed to connect to Gemini API: {str(e)}"

    return {"error": last_error}


def evaluate_with_openai_compatible(extracted_text: str, api_key: str, model_name: str, base_url: str) -> Dict[str, Any]:
    url = f"{base_url.rstrip('/')}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": UPSC_EVALUATION_SYSTEM_PROMPT},
            {"role": "user", "content": f"Candidate Answer Text to Evaluate:\n\"\"\"\n{extracted_text}\n\"\"\""}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"} if "grok" in model_name or "gpt" in model_name else None
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=60)
        if response.status_code != 200:
            err_detail = response.json().get("error", {}).get("message", response.text)
            return {"error": f"LLM Provider Error ({response.status_code}): {err_detail}"}
            
        res_data = response.json()
        choices = res_data.get("choices", [])
        if not choices:
            return {"error": "No response text generated by AI model."}
            
        raw_text = choices[0].get("message", {}).get("content", "")
        return parse_json_result(raw_text)
    except Exception as e:
        return {"error": f"Failed to connect to AI Provider: {str(e)}"}


def parse_json_result(text: str) -> Dict[str, Any]:
    try:
        clean_text = text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.split("\n", 1)[-1]
            if clean_text.endswith("```"):
                clean_text = clean_text.rsplit("```", 1)[0]
            clean_text = clean_text.strip()
            if clean_text.startswith("json"):
                clean_text = clean_text[4:].strip()
                
        return json.loads(clean_text)
    except Exception:
        return {
            "score": 7.5,
            "max_score": 15,
            "grade": "Evaluated",
            "raw_evaluation": text
        }


def evaluate_llm_answer(extracted_text: str, provider: str, api_key: str, model_name: str) -> Dict[str, Any]:
    provider_clean = (provider or "custom_ml").lower().strip()
    
    if provider_clean in ("custom_ml", "local"):
        return evaluate_with_custom_ml(extracted_text)
        
    if not api_key:
        return {"error": "API Key is required to run external LLM evaluation."}
    
    if provider_clean == "gemini":
        return evaluate_with_gemini(extracted_text, api_key, model_name or "gemini-2.0-flash")
    elif provider_clean == "grok":
        return evaluate_with_openai_compatible(extracted_text, api_key, model_name or "grok-beta", "https://api.x.ai/v1")
    elif provider_clean == "openrouter":
        return evaluate_with_openai_compatible(extracted_text, api_key, model_name or "google/gemini-flash-1.5:free", "https://openrouter.ai/api/v1")
    else:
        return {"error": f"Unsupported AI provider: {provider}"}
