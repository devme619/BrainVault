import os
import json
import joblib
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestRegressor

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset", "upsc_answers_dataset.json")

def extract_nlp_features(text: str):
    words = text.split()
    word_count = len(words)
    char_count = len(text)
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    sentence_count = len(sentences)
    avg_word_length = char_count / (word_count + 1e-5)
    
    # Structural Indicators
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

def train_upsc_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
        
    with open(DATASET_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    texts = [item["extracted_text"] for item in data]
    scores = [item["actual_score"] for item in data]
    
    # Train TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words='english')
    X_tfidf = vectorizer.fit_transform(texts).toarray()
    
    # Combine TF-IDF features with structural features
    extra_features = []
    for t in texts:
        feats = extract_nlp_features(t)
        extra_features.append(list(feats.values()))
        
    X_combined = np.hstack((X_tfidf, np.array(extra_features)))
    
    # Train Regressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_combined, scores)
    
    # Save artifacts
    artifacts = {
        "vectorizer": vectorizer,
        "model": model,
        "training_data": data
    }
    
    model_path = os.path.join(MODEL_DIR, "upsc_evaluator.pkl")
    joblib.dump(artifacts, model_path)
    print(f"[SUCCESS] Custom UPSC Model successfully trained and saved to {model_path}!")

if __name__ == "__main__":
    train_upsc_model()
