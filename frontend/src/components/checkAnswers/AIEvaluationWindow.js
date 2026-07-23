const AIEvaluationWindow = ({ selectedFile }) => {
  return (
    <div className="w-1/2 h-full p-6 flex flex-col gap-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-slate-100">AI Evaluation</h2>
      <p className="text-sm text-slate-400">
        Once an answer sheet is loaded on the left, click evaluate to check
        formatting, content accuracy, and scores against UPSC guidelines.
      </p>

      <button
        disabled={!selectedFile}
        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg font-medium transition text-sm cursor-pointer disabled:cursor-not-allowed"
      >
        Run AI Evaluation
      </button>

      <div className="flex-1 bg-slate-900/40 rounded-xl border border-slate-800/80 p-4 text-sm text-slate-400">
        Evaluation details, transcribe output, and score cards will display
        here.
      </div>
    </div>
  );
};

export default AIEvaluationWindow;
