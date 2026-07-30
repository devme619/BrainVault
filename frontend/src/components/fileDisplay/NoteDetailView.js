import { useState } from "react";
import FilePreview from "../reusableComponents/FilePreview";
import { convertFileToText } from "../../apis/evaluationAPIs";

const NoteDetailView = ({ note, onClose }) => {
  const [extractedText, setExtractedText] = useState(note?.extractedText || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!note) return null;

  const handleExtractText = async () => {
    if (!note.file && !note.fileUrl) return;

    setIsExtracting(true);
    setError(null);

    try {
      let fileToProcess = note.file;

      // If note only has Blob URL, fetch blob to create File
      if (!fileToProcess && note.fileUrl) {
        const res = await fetch(note.fileUrl);
        const blob = await res.blob();
        fileToProcess = new File([blob], note.fileName || "note_document", { type: note.fileType || "application/pdf" });
      }

      const result = await convertFileToText(fileToProcess);
      if (result.extracted_text) {
        setExtractedText(result.extracted_text);
        setWordCount(result.word_count || 0);
        setCharCount(result.character_count || 0);
      } else {
        setError("No text could be extracted from this document.");
      }
    } catch (err) {
      setError(err.message || "Failed to extract text from file");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCopy = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📖</span>
            <div>
              <h2 className="font-bold text-lg text-slate-100">{note.name}</h2>
              {note.fileName && (
                <p className="text-xs text-slate-400 font-mono">📎 {note.fileName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Close ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Note Description */}
          {note.description ? (
            <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">{note.description}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No description provided for this note.</p>
          )}

          {/* Attached File Section */}
          {note.fileUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📄</span> Attached Document
                </h4>
                <button
                  onClick={handleExtractText}
                  disabled={isExtracting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  {isExtracting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Extracting OCR Text...</span>
                    </>
                  ) : (
                    <span>⚡ Extract Text (OCR)</span>
                  )}
                </button>
              </div>

              <div className="w-full h-80 rounded-xl overflow-hidden border border-slate-800">
                <FilePreview
                  fileUrl={note.fileUrl}
                  fileType={note.fileType}
                  fileName={note.fileName}
                  className="w-full h-full"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 text-xs">
              No document file attached to this note.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Extracted OCR Text Container */}
          {extractedText && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-400">✓ Extracted Text</span>
                  {wordCount > 0 && <span className="text-slate-400 font-mono">{wordCount} words</span>}
                  {charCount > 0 && <span className="text-slate-500 font-mono">{charCount} chars</span>}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  {copied ? "Copied! ✓" : "Copy Text"}
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetailView;
