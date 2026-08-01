# 🧠 BrainVault Custom UPSC Model Service (`ml_service`)

A 100% free, offline Machine Learning service built to evaluate UPSC Civil Services Mains answer sheets based on official marking rubrics.

---

## 📁 Directory Architecture

```
ml_service/
├── dataset/
│   └── upsc_answers_dataset.json   # UPSC Mains Q&A training dataset
├── models/
│   └── upsc_evaluator.pkl          # Trained Random Forest & TF-IDF model artifacts
├── train.py                        # Model training pipeline script
├── app.py                          # Standalone FastAPI microservice (Port 8001)
├── requirements.txt                # ML Python dependencies
└── README.md                       # Service documentation
```

---

## ⚡ Quick Start Guide

### 1. Train the ML Model
```bash
python ml_service/train.py
```
This processes `dataset/upsc_answers_dataset.json`, extracts TF-IDF n-gram features & structural indicators, trains a `RandomForestRegressor`, and saves `models/upsc_evaluator.pkl`.

### 2. Launch Standalone Microservice (Port 8001)
```bash
python ml_service/app.py
```
Starts the FastAPI microservice at `http://127.0.0.1:8001/evaluate`.

---

## 🎯 Features

- **0 API Cost / Offline**: No external API keys or paid tokens required.
- **Predictive Scoring**: Predicts UPSC Mains score out of 15 based on structural depth, policy citations, keyword coverage, and answer density.
- **Structural Feedback**: Analyzes Introduction, Body Content, and Conclusion.
- **Keywords & Action Plan**: Detects covered UPSC terminology and recommends missing keywords and mentor improvement tips.
