import { useState, useEffect } from "react";
import { convertFileToText } from "../../apis/evaluationAPIs";

const PROVIDER_MODELS = {
  gemini: [
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Recommended Free)" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro" },
  ],
  grok: [
    { id: "grok-beta", name: "xAI Grok Beta" },
    { id: "grok-2", name: "xAI Grok-2" },
  ],
  openrouter: [
    { id: "google/gemini-flash-1.5:free", name: "Gemini Flash 1.5 (OpenRouter Free)" },
    { id: "meta-llama/llama-3.1-8b-instruct:free", name: "Llama 3.1 8B (OpenRouter Free)" },
    { id: "qwen/qwen-2.5-7b-instruct:free", name: "Qwen 2.5 7B (OpenRouter Free)" },
  ],
};

const AIEvaluationWindow = ({ selectedFile }) => {
  const [provider, setProvider] = useState(localStorage.getItem("bv_ai_provider") || "gemini");
  const [modelName, setModelName] = useState(localStorage.getItem("bv_ai_model") || "gemini-1.5-flash");
  const [apiKey, setApiKey] = useState(localStorage.getItem("bv_ai_key") || "");
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(!localStorage.getItem("bv_ai_key"));

  const [activeTab, setActiveTab] = useState("report");
  const [loading, setLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Sync localStorage when settings change
  useEffect(() => {
    localStorage.setItem("bv_ai_provider", provider);
    localStorage.setItem("bv_ai_model", modelName);
    localStorage.setItem("bv_ai_key", apiKey);
  }, [provider, modelName, apiKey]);

  // Handle provider switch -> default to first model of provider
  const handleProviderChange = (e) => {
    const p = e.target.value;
    setProvider(p);
    setModelName(PROVIDER_MODELS[p][0].id);
  };

  // Clear output when a new file is uploaded
  useEffect(() => {
    setEvaluationData(null);
    setError(null);
  }, [selectedFile]);

  const handleRunEvaluation = async () => {
    if (!selectedFile?.file) return;

    if (!apiKey) {
      setError("Please enter your free API Key in AI Settings below before running evaluation.");
      setShowSettings(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await convertFileToText(selectedFile.file, {
        provider,
        apiKey,
        modelName,
      });

      if (result.evaluation_report?.error) {
        setError(result.evaluation_report.error);
      }

      setEvaluationData(result);
      if (result.evaluation_report && !result.evaluation_report.error) {
        setActiveTab("report");
      } else {
        setActiveTab("text");
      }
    } catch (err) {
      setError(err.message || "Failed to process document for AI evaluation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (evaluationData?.extracted_text) {
      navigator.clipboard.writeText(evaluationData.extracted_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const report = evaluationData?.evaluation_report;

  return (
    <div className="w-1/2 h-full p-6 flex flex-col gap-4 overflow-y-auto selection:bg-emerald-500">
      {/* Header & Settings Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>🤖</span> AI Evaluation Window
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate answer sheets with your preferred AI model & API key.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border cursor-pointer flex items-center gap-1.5 ${
            showSettings
              ? "bg-slate-800 text-emerald-400 border-slate-700"
              : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
          }`}
        >
          <span>⚙️ AI Settings</span>
          <span>{showSettings ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* AI Settings Drawer */}
      {showSettings && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 backdrop-blur-md shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              🔑 Provider & Model Setup
            </span>
            <span className="text-[11px] text-slate-400">Keys stored locally in browser</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Platform
              </label>
              <select
                value={provider}
                onChange={handleProviderChange}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="gemini">Google Gemini (Recommended)</option>
                <option value="grok">xAI Grok</option>
                <option value="openrouter">OpenRouter (Free LLMs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Model
              </label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {PROVIDER_MODELS[provider]?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                API Key for {provider.toUpperCase()} <span className="text-red-400">*</span>
              </label>
              {provider === "gemini" && (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Get Free Gemini Key ↗
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                placeholder={`Paste your ${provider.toUpperCase()} API key here...`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-2 text-[10px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
              >
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleRunEvaluation}
        disabled={!selectedFile || loading}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800/80 disabled:text-slate-600 rounded-xl font-semibold transition text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Evaluating with {modelName}...</span>
          </>
        ) : (
          <span>Run AI Evaluation ({provider.toUpperCase()})</span>
        )}
      </button>

      {/* Main Output Display Area */}
      <div className="flex-1 bg-slate-900/40 backdrop-blur-md rounded-xl border border-slate-800/80 p-4 text-sm text-slate-400 flex flex-col gap-3 overflow-hidden shadow-md">
        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-lg text-xs font-mono">
            ⚠️ {error}
          </div>
        )}

        {evaluationData ? (
          <div className="flex flex-col h-full gap-3 overflow-hidden">
            {/* View Tabs Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("report")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "report"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-950/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📊 AI Evaluation Report
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    activeTab === "text"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-950/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 Transcribed Text ({evaluationData.word_count || 0} words)
                </button>
              </div>

              {activeTab === "text" && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  {copied ? "Copied! ✓" : "Copy Text"}
                </button>
              )}
            </div>

            {/* TAB 1: REPORT VIEW */}
            {activeTab === "report" ? (
              report && !report.error ? (
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                  {/* Scorecard Header Banner */}
                  <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        Evaluated by {modelName}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-100 mt-0.5">
                        Grade: <span className="text-emerald-400">{report.grade || "Evaluated"}</span>
                      </h3>
                    </div>
                    <div className="text-right bg-emerald-950/60 border border-emerald-800/80 px-4 py-2 rounded-xl">
                      <p className="text-[10px] text-emerald-400 font-semibold uppercase">UPSC Score</p>
                      <p className="text-2xl font-black text-emerald-300 font-mono">
                        {report.score ?? "--"}{" "}
                        <span className="text-xs text-slate-400 font-normal">/ {report.max_score || 15}</span>
                      </p>
                    </div>
                  </div>

                  {/* Structural Assessment */}
                  {(report.introduction_assessment || report.body_assessment || report.conclusion_assessment) && (
                    <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                        <span>📜</span> UPSC Structural Assessment
                      </h4>
                      {report.introduction_assessment && (
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-slate-100">Introduction:</strong> {report.introduction_assessment}
                        </p>
                      )}
                      {report.body_assessment && (
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-slate-100">Body Content:</strong> {report.body_assessment}
                        </p>
                      )}
                      {report.conclusion_assessment && (
                        <p className="text-slate-300 leading-relaxed">
                          <strong className="text-slate-100">Conclusion:</strong> {report.conclusion_assessment}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3">
                    {report.strengths && report.strengths.length > 0 && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-900/60 rounded-xl space-y-1.5">
                        <h4 className="font-bold text-emerald-400 flex items-center gap-1">
                          <span>✅</span> Key Strengths
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {report.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {report.weaknesses && report.weaknesses.length > 0 && (
                      <div className="p-3 bg-amber-950/30 border border-amber-900/60 rounded-xl space-y-1.5">
                        <h4 className="font-bold text-amber-400 flex items-center gap-1">
                          <span>⚠️</span> Areas for Improvement
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {report.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Keywords Covered vs Missing */}
                  {(report.keywords_covered || report.missing_keywords) && (
                    <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
                      <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                        <span>🏷️</span> UPSC Keywords & Terminology
                      </h4>
                      {report.keywords_covered && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 mr-1 font-semibold">Covered:</span>
                          {report.keywords_covered.map((k, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px]">
                              ✓ {k}
                            </span>
                          ))}
                        </div>
                      )}
                      {report.missing_keywords && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 mr-1 font-semibold">Recommended:</span>
                          {report.missing_keywords.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-900 rounded text-[10px]">
                              + {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Improvement Tips */}
                  {report.improvement_tips && report.improvement_tips.length > 0 && (
                    <div className="p-3.5 bg-indigo-950/40 border border-indigo-900/60 rounded-xl space-y-1.5">
                      <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <span>💡</span> Mentor Action Plan (To Score 12+)
                      </h4>
                      <ul className="list-decimal list-inside space-y-1 text-slate-300">
                        {report.improvement_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="m-auto text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                  <div className="text-3xl opacity-50">🤖</div>
                  <p>No LLM evaluation report yet. Click "Run AI Evaluation" above.</p>
                </div>
              )
            ) : (
              /* TAB 2: TRANSCRIBED TEXT VIEW */
              <div className="flex-1 bg-slate-950/90 border border-slate-800/90 rounded-lg p-3.5 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {evaluationData.extracted_text}
              </div>
            )}
          </div>
        ) : (
          <div className="m-auto text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <div className="text-3xl opacity-50">✨</div>
            <p>Select your AI Model & API Key above, then click "Run AI Evaluation".</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEvaluationWindow;
