import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateNoteContent } from "../../utils/store/notesSlice";
import { updateNoteApi } from "../../apis/notesAPI";
import FilePreview from "../reusableComponents/FilePreview";
import RichTextEditor from "./RichTextEditor";
import { convertFileToText } from "../../apis/evaluationAPIs";

const NoteDetailView = ({ note, onClose }) => {
  const dispatch = useDispatch();
  const [extractedText, setExtractedText] = useState(note?.extractedText || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
        fileToProcess = new File([blob], note.fileName || "note_document", {
          type: note.fileType || "application/pdf",
        });
      }

      const result = await convertFileToText(fileToProcess);
      if (result.extracted_text) {
        setExtractedText(result.extracted_text);
        setWordCount(result.word_count || 0);
        setCharCount(result.character_count || 0);

        // Sync extracted text to backend if note has an ID
        if (note.id) {
          updateNoteApi(note.id, {
            ...note,
            extractedText: result.extracted_text,
          }).catch((err) => console.warn("Failed to sync OCR text to backend:", err));
        }
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

  const handleSaveRichText = async (newHtmlContent) => {
    dispatch(
      updateNoteContent({
        id: note.id,
        textContent: newHtmlContent,
      })
    );

    if (note.id) {
      try {
        await updateNoteApi(note.id, {
          ...note,
          textContent: newHtmlContent,
        });
      } catch (err) {
        console.warn("Failed to persist rich text content to backend PostgreSQL:", err);
      }
    }
  };

  const hasFile = Boolean(note.fileUrl || note.file);

  return (
    <div className="absolute inset-0 z-40 w-full h-full bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden animate-fade-in text-white">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between shadow-lg shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{hasFile ? "📄" : "📝"}</span>
          <div>
            <h2 className="font-bold text-lg text-slate-100">{note.name}</h2>
            {note.fileName ? (
              <p className="text-xs text-slate-400 font-mono">📎 {note.fileName}</p>
            ) : (
              <p className="text-xs text-emerald-400 font-mono">✏️ Interactive Note Document</p>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600/90 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition shadow-md cursor-pointer flex items-center gap-2"
        >
          <span>Close Note</span>
          <span className="text-sm font-bold">✕</span>
        </button>
      </div>

      {/* RENDER MODE A: Google Docs Rich Text Editor (When NO file is attached) */}
      {!hasFile ? (
        <div className="flex-1 w-full h-full overflow-hidden flex flex-col">
          <RichTextEditor
            initialContent={note.textContent || (note.description ? `<p>${note.description}</p>` : "<p>Start typing your note here...</p>")}
            onSave={handleSaveRichText}
            noteName={note.name}
          />
        </div>
      ) : (
        /* RENDER MODE B: Document Preview & OCR Text Viewer (When file is attached) */
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-5xl mx-auto w-full">
          {/* Note Description */}
          {note.description ? (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl shadow-md">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Description / Summary
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">{note.description}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No description provided for this note.</p>
          )}

          {/* Attached File Section */}
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

            <div className="w-full h-[450px] rounded-xl overflow-hidden border border-slate-800 shadow-xl bg-slate-900">
              <FilePreview
                fileUrl={note.fileUrl}
                fileType={note.fileType}
                fileName={note.fileName}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs font-mono">
              ⚠️ {error}
            </div>
          )}

          {/* Extracted OCR Text Container */}
          {extractedText && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-emerald-400">✓ Extracted Transcribed Text</span>
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

              <div className="max-h-72 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800/60">
                {extractedText}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteDetailView;
