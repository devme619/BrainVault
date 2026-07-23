import { useState } from "react";
import FileUploader from "../reusableComponents/FileUploader";
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
    <div className="flex w-full h-full bg-slate-950 text-white overflow-hidden">
      <div className="w-1/2 h-full border-r border-slate-800 p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold">Answer Sheet Document</h2>
            {selectedFile && (
              <p className="text-xs text-slate-400">
                {selectedFile.name} ({selectedFile.size} MB)
              </p>
            )}
          </div>
          <FileUploader
            onFileSelect={handleFileUpload}
            accept="image/*,application/pdf"
            buttonText={selectedFile ? "Change File" : "Upload Answer"}
          />
        </div>
        <div className="flex-1 w-full bg-slate-900/50 rounded-xl border border-slate-800 overflow-y-auto p-2 flex items-center justify-center">
          {selectedFile ? (
            selectedFile.type === "application/pdf" ? (
              <iframe
                src={selectedFile.url}
                title="PDF Preview"
                className="w-full h-full rounded-lg border-0 bg-white"
              />
            ) : (
              <div className="w-full h-full overflow-y-auto flex justify-center bg-black">
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full h-auto object-contain rounded-lg"
                />
              </div>
            )
          ) : (
            <div className="text-center p-6 text-slate-500">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm">No answer sheet uploaded yet</p>
              <p className="text-xs text-slate-600 mt-1">
                Upload a JPG, PNG, or PDF file to view
              </p>
            </div>
          )}
        </div>
      </div>
      <AIEvaluationWindow selectedFile={selectedFile} />
    </div>
  );
};

export default CheckAnswersContainer;
