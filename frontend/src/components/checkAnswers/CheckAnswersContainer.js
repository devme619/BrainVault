import { useState } from "react";
import FileUploader from "../reusableComponents/FileUploader";
import FilePreview from "../reusableComponents/FilePreview";
import AIEvaluationWindow from "./AIEvaluationWindow";

const CheckAnswersContainer = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (file) => {
    if (!file) return;
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type,
      url: URL?.createObjectURL(file),
    });
  };

  return (
    <div className="flex w-full h-full bg-slate-950/40 backdrop-blur-md text-white overflow-hidden">
      <div className="w-1/2 h-full border-r border-slate-800/80 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-slate-900/70 backdrop-blur-md p-3.5 rounded-xl border border-slate-800 shrink-0 shadow-md">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Answer Sheet Document</h2>
            {selectedFile ? (
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                📄 {selectedFile.name} ({selectedFile.size} MB)
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">PDF or Image document</p>
            )}
          </div>
          <FileUploader
            onFileSelect={handleFileUpload}
            accept="image/*,application/pdf"
            buttonText={selectedFile ? "Change File" : "Upload Answer"}
          />
        </div>
        <div className="flex-1 w-full bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/80 overflow-y-auto p-2 flex items-center justify-center shadow-inner">
          <FilePreview
            fileUrl={selectedFile?.url}
            fileType={selectedFile?.type}
            fileName={selectedFile?.name}
            className="w-full h-full"
          />
        </div>
      </div>
      <AIEvaluationWindow selectedFile={selectedFile} />
    </div>
  );
};

export default CheckAnswersContainer;
