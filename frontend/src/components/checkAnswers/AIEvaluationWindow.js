import { useState, useEffect } from "react";
import { convertFileToText } from "../../apis/evaluationAPIs";

const AIEvaluationWindow = ({ selectedFile }) => {
  const [loading, setLoading] = useState(false);
  const [evaluationData, setEvaluationData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Clear evaluation output when a new file is uploaded
  useEffect(() => {
    setEvaluationData(null);
    setError(null);
  }, [selectedFile]);

  const handleRunEvaluation = async () => {
    if (!selectedFile?.file) return;
    setLoading(true);
    setError(null);

    try {
      const result = await convertFileToText(selectedFile.file);
      setEvaluationData(result);
    } catch (err) {
      setError(err.message || "Failed to convert file to text");
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

  return (
    <div className="w-1/2 h-full p-6 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-100">AI Evaluation</h2>
      <p className="text-sm text-slate-400">
        Once an answer sheet is loaded on the left, click evaluate to convert
        the document to text and view evaluation results.
      </p>

      <button
        onClick={handleRunEvaluation}
        disabled={!selectedFile || loading}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Converting & Processing...
          </>
        ) : (
          "Run AI Evaluation"
        )}
      </button>

      {/* Main evaluation window area */}
      <div className="flex-1 bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 text-sm text-slate-400 flex flex-col gap-3 overflow-hidden">
        {error && (
          <div className="p-3 bg-red-900/40 border border-red-800 text-red-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        {evaluationData ? (
          <div className="flex flex-col h-full gap-3">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs">
              <div className="flex gap-4">
                <span>
                  📄{" "}
                  <strong className="text-slate-200">
                    {evaluationData.word_count}
                  </strong>{" "}
                  words
                </span>
                <span>
                  🔤{" "}
                  <strong className="text-slate-200">
                    {evaluationData.character_count}
                  </strong>{" "}
                  chars
                </span>
                {evaluationData.pages_processed && (
                  <span>
                    📑{" "}
                    <strong className="text-slate-200">
                      {evaluationData.pages_processed}
                    </strong>{" "}
                    page(s)
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition text-xs"
              >
                {copied ? "Copied! ✓" : "Copy Text"}
              </button>
            </div>

            <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-lg p-3 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap">
              {evaluationData.extracted_text}
            </div>
          </div>
        ) : (
          <div className="m-auto text-center text-slate-500 text-xs">
            Evaluation details and transcribed text output will display here
            after running evaluation.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEvaluationWindow;
