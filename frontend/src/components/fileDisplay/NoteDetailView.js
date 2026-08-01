import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateNoteContent, replaceFileWithText } from "../../utils/store/notesSlice";
import { updateNoteApi } from "../../apis/notesAPI";
import FilePreview from "../reusableComponents/FilePreview";
import RichTextEditor from "./RichTextEditor";
import { convertFileToText, organizeNoteTextAPI } from "../../apis/evaluationAPIs";

const NoteDetailView = ({ note, onClose }) => {
  const dispatch = useDispatch();
  
  // Single container view mode: 'file_preview' | 'extracted_text' | 'ai_organized'
  const [viewMode, setViewMode] = useState("file_preview");
  
  const [extractedText, setExtractedText] = useState(note?.extractedText || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizedHtml, setOrganizedHtml] = useState(note?.textContent || "");

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
        setViewMode("extracted_text"); // Seamlessly transition container to extracted text view

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

  const handleOrganizeWithAI = async () => {
    const textToOrganize = extractedText || note.description || note.name;
    if (!textToOrganize) return;

    setIsOrganizing(true);
    setError(null);

    try {
      const res = await organizeNoteTextAPI(textToOrganize);
      if (res.organized_text) {
        setOrganizedHtml(res.organized_text);
        setViewMode("ai_organized"); // Seamlessly transition container to organized text view
      } else {
        setError("Failed to generate AI organized note.");
      }
    } catch (err) {
      setError(err.message || "Error structuring note with AI.");
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleReplaceFileWithOrganizedText = async () => {
    const finalContent = organizedHtml || extractedText;
    if (!finalContent) return;

    // Update Redux state to clear file attachment and set textContent
    dispatch(replaceFileWithText({ id: note.id, textContent: finalContent }));

    // Save to PostgreSQL database
    if (note.id) {
      try {
        await updateNoteApi(note.id, {
          ...note,
          file_url: null,
          file_type: null,
          file_name: null,
          fileUrl: null,
          fileType: null,
          fileName: null,
          text_content: finalContent,
          textContent: finalContent,
        });
      } catch (err) {
        console.error("Failed to replace document on backend:", err);
      }
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
        /* RENDER MODE B: Unified Single Interactive Container (When file is attached) */
        <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto max-w-5xl mx-auto w-full">
          {/* Note Description */}
          {note.description && (
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl shadow-sm shrink-0">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                Description
              </span>
              <p className="text-xs text-slate-200">{note.description}</p>
            </div>
          )}

          {/* Unified Container Header & Step Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl flex-1 min-h-[500px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              {/* Step Navigation Pills */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("file_preview")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === "file_preview"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 1. File Preview
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (extractedText) setViewMode("extracted_text");
                    else handleExtractText();
                  }}
                  disabled={isExtracting}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === "extracted_text"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isExtracting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Extracting...</span>
                    </>
                  ) : (
                    <span>⚡ 2. Extracted Text</span>
                  )}
                </button>

                {extractedText && (
                  <button
                    type="button"
                    onClick={() => {
                      if (organizedHtml) setViewMode("ai_organized");
                      else handleOrganizeWithAI();
                    }}
                    disabled={isOrganizing}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                      viewMode === "ai_organized"
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow"
                    }`}
                  >
                    {isOrganizing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Organizing...</span>
                      </>
                    ) : (
                      <span>✨ 3. AI Organized Note</span>
                    )}
                  </button>
                )}
              </div>

              {/* Action Buttons Header */}
              <div className="flex items-center gap-2">
                {viewMode === "file_preview" && (
                  <button
                    onClick={handleExtractText}
                    disabled={isExtracting}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
                  >
                    {isExtracting ? "Extracting..." : "⚡ Extract Text (OCR)"}
                  </button>
                )}

                {viewMode === "extracted_text" && (
                  <>
                    <button
                      onClick={handleOrganizeWithAI}
                      disabled={isOrganizing}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      {isOrganizing ? "Structuring..." : "✨ Organize Note with AI"}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 cursor-pointer"
                    >
                      {copied ? "Copied! ✓" : "Copy Text"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-lg text-xs font-mono shrink-0">
                ⚠️ {error}
              </div>
            )}

            {/* CONTAINER CONTENT VIEW 1: FILE PREVIEW */}
            {viewMode === "file_preview" && (
              <div className="flex-1 w-full h-[450px] rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950">
                <FilePreview
                  fileUrl={note.fileUrl}
                  fileType={note.fileType}
                  fileName={note.fileName}
                  className="w-full h-full"
                />
              </div>
            )}

            {/* CONTAINER CONTENT VIEW 2: EXTRACTED OCR TEXT */}
            {viewMode === "extracted_text" && (
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800/60 pb-2">
                  <span>✓ Transcribed Text ({wordCount} words, {charCount} chars)</span>
                  <button
                    onClick={handleOrganizeWithAI}
                    disabled={isOrganizing}
                    className="text-emerald-400 hover:underline cursor-pointer font-sans font-semibold"
                  >
                    ✨ Click to Structure Headings with AI →
                  </button>
                </div>
                <div className="flex-1 bg-slate-950 p-4 rounded-lg border border-slate-800/80 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px]">
                  {extractedText}
                </div>
              </div>
            )}

            {/* CONTAINER CONTENT VIEW 3: AI ORGANIZED STRUCTURED DOCUMENT */}
            {viewMode === "ai_organized" && (
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-slate-950 p-6 rounded-lg border border-slate-800/80 overflow-y-auto text-xs text-slate-200 space-y-3 font-sans leading-relaxed max-h-[380px]"
                  dangerouslySetInnerHTML={{ __html: organizedHtml }}
                />

                {/* Single Replace File & Edit Action Banner */}
                <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-xl flex items-center justify-between gap-4 shrink-0 shadow-lg">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span>🔄</span> Replace File Attachment with AI Organized Note?
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Replaces raw file attachment and opens this note directly in Google Docs Rich Text Editor.
                    </p>
                  </div>

                  <button
                    onClick={handleReplaceFileWithOrganizedText}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer shrink-0 flex items-center gap-2"
                  >
                    <span>Replace File & Open in Google Docs Editor ↗</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteDetailView;
