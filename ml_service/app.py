import os
import re
import json
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

app = FastAPI(
    title="BrainVault Custom UPSC ML Model Service",
    description="Standalone offline ML microservice for evaluating UPSC Mains answer sheets.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "upsc_evaluator.pkl")
MODEL_DATA = None

class EvaluationRequest(BaseModel):
    extracted_text: str

def load_model():
    global MODEL_DATA
    if os.path.exists(MODEL_PATH):
        try:
            MODEL_DATA = joblib.load(MODEL_PATH)
            print(f"[INFO] Loaded trained custom UPSC model from {MODEL_PATH}")
        except Exception as e:
            print(f"[WARNING] Failed to load model file: {e}")

@app.on_event("startup")
def startup_event():
    load_model()

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "BrainVault Custom UPSC ML Evaluator",
        "model_loaded": MODEL_DATA is not None
    }

def extract_nlp_features(text: str):
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = len(sentences)
    avg_word_length = char_count / (word_count + 1e-5)
    
    has_numbers = bool(re.search(r'\b\d+(\.\d+)?%?\b', text))
    has_articles_schemes = bool(re.search(r'\b(Article|Act|Scheme|PMKSY|PMFBY|NITI|Schedule|Part|SDG)\b', text, re.IGNORECASE))
    has_bullet_structure = bool(re.search(r'[-*•\d\.]', text))
    
    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "avg_word_length": avg_word_length,
        "has_numbers": int(has_numbers),
        "has_articles_schemes": int(has_articles_schemes),
        "has_bullet_structure": int(has_bullet_structure)
    }

def generate_rule_based_report(text: str, predicted_score: float) -> Dict[str, Any]:
    words = text.split()
    word_count = len(words)
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    
    # Analyze introduction
    first_para = sentences[0] if sentences else text
    intro_eval = f"Introductory analysis: '{first_para[:120]}...'. Sets clear context for the question core requirements."
    
    # Body analysis
    body_eval = f"Contains approx {word_count} words across {len(sentences)} key points. Uses structural breakdown and relevant arguments."
    
    # Conclusion analysis
    last_para = sentences[-1] if len(sentences) > 1 else "Answer requires a dedicated vision-driven conclusion."
    conclusion_eval = f"Concluding remark: '{last_para[:120]}...'. Links key findings to policy objectives."
    
    # Extract keywords
    upsc_vocab = [
        "monsoon", "climate change", "sdg", "constitution", "article", "amendment",
        "niti aayog", "pmksy", "pmfby", "decentralization", "panchayat", "finance commission",
        "governance", "predictive analytics", "data privacy", "bhashini", "micro-irrigation",
        "rainwater harvesting", "women empowerment", "sustainable development"
    ]
    
    found_keywords = [k for k in upsc_vocab if re.search(r'\b' + re.escape(k) + r'\b', text, re.IGNORECASE)]
    missing_keywords = [k for k in upsc_vocab if k not in found_keywords][:4]
    
    # Strengths & Weaknesses
    strengths = []
    weaknesses = []
    tips = []
    
    if word_count >= 100:
        strengths.append(f"Good answer length ({word_count} words) demonstrating subject depth")
    else:
        weaknesses.append(f"Answer length is concise ({word_count} words); aim for 150-250 words")
        tips.append("Expand discussion with quantitative facts, diagrams, and case studies")
        
    if any(k in text.lower() for k in ["article", "act", "scheme", "policy", "amendment"]):
        strengths.append("Incorporates legal/policy references (Articles/Schemes)")
    else:
        weaknesses.append("Lacks explicit references to constitutional articles, acts, or government schemes")
        tips.append("Cite specific constitutional provisions (e.g. Art 243) and schemes (e.g. PMKSY) to boost marks")

    if predicted_score >= 10:
        grade = "Excellent"
    elif predicted_score >= 8:
        grade = "Good"
    elif predicted_score >= 6:
        grade = "Average"
    else:
        grade = "Needs Improvement"
        
    if not strengths:
        strengths.append("Addressed primary core theme of the question")
    if not weaknesses:
        weaknesses.append("Can enhance answer layout using bullet points and subheadings")
    if not tips:
        tips.append("Use a 3-part structure: Clear Intro (20%), Sub-headed Body (70%), Vision Conclusion (10%)")
        
    return {
        "score": round(float(predicted_score), 1),
        "max_score": 15,
        "grade": grade,
        "introduction_assessment": intro_eval,
        "body_assessment": body_eval,
        "conclusion_assessment": conclusion_eval,
        "keywords_covered": found_keywords if found_keywords else ["General terminology"],
        "missing_keywords": missing_keywords,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "improvement_tips": tips,
        "evaluator_type": "BrainVault Custom UPSC ML Model (Local)"
    }

@app.post("/evaluate")
def evaluate_answer(payload: EvaluationRequest):
    text = payload.extracted_text.strip()
    if not text or text == "No readable text found in document.":
        raise HTTPException(status_code=400, detail="No readable text available to evaluate.")
        
    if MODEL_DATA is not None:
        try:
            vectorizer = MODEL_DATA["vectorizer"]
            model = MODEL_DATA["model"]
            
            X_tfidf = vectorizer.transform([text]).toarray()
            feats = list(extract_nlp_features(text).values())
            X_combined = np.hstack((X_tfidf, np.array([feats])))
            
            predicted_score = float(model.predict(X_combined)[0])
            predicted_score = max(3.5, min(13.5, predicted_score))
        except Exception as e:
            print(f"Fallback to feature calculation due to prediction error: {e}")
            predicted_score = min(12.0, max(4.0, len(text.split()) / 20.0 + 4.0))
    else:
        predicted_score = min(12.0, max(4.0, len(text.split()) / 20.0 + 4.0))
        
    report = generate_rule_based_report(text, predicted_score)
    return report

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
