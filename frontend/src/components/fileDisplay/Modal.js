import { useRef, useState } from "react";
import close from "../../assests/icons/cross-circle.svg";
import FileUploader from "../reusableComponents/FileUploader";
import FilePreview from "../reusableComponents/FilePreview";
import useCreateNote from "../../hooks/useCreateNote";
import { convertFileToText } from "../../apis/evaluationAPIs";
import { useDispatch } from "react-redux";
import { addSingleNote } from "../../utils/store/notesSlice";

const Modal = ({ heading, setIsModalOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isExtractingOcr, setIsExtractingOcr] = useState(false);
  const [validationError, setValidationError] = useState("");

  const dispatch = useDispatch();
  const topic = useRef(null);
  const description = useRef(null);
  const { addNote, error: apiError } = useCreateNote();

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnClick = async (e) => {
    e.preventDefault();
    const nameVal = topic.current.value.trim();

    // Compulsory Name Validation
    if (!nameVal) {
      setValidationError("Note name is required *");
      return;
    }
    setValidationError("");

    const payload = {
      name: nameVal,
      description: description.current.value.trim() || "",
      fileUrl: selectedFile?.url || null,
      fileType: selectedFile?.type || null,
      fileName: selectedFile?.name || null,
      extractedText: extractedText || null,
    };

    try {
      const createdBackendNote = await addNote({
        name: payload.name,
        description: payload.description,
      }).catch(() => null);

      const noteToStore = {
        id: createdBackendNote?.id || Date.now(),
        name: payload.name,
        description: payload.description,
        fileUrl: payload.fileUrl,
        fileType: payload.fileType,
        fileName: payload.fileName,
        extractedText: payload.extractedText,
      };

      dispatch(addSingleNote(noteToStore));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create note:", err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    
    setSelectedFile({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type,
      url: URL.createObjectURL(file),
    });

    // Run OCR text extraction on attached note file
    setIsExtractingOcr(true);
    setExtractedText("");
    try {
      const result = await convertFileToText(file);
      if (result.extracted_text) {
        setExtractedText(result.extracted_text);
      }
    } catch (err) {
      console.warn("OCR extraction skipped:", err);
    } finally {
      setIsExtractingOcr(false);
    }
  };

  return (
    <div>
      <div
        className="fixed inset-0 z-20 w-full h-full bg-black/70 backdrop-blur-xs"
        onClick={closeModal}
      />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="fixed inset-0 z-30 w-11/12 max-w-md h-fit mx-auto my-auto rounded-xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
          <h1 className="font-bold text-lg text-slate-100">{heading}</h1>
          <img
            alt="close"
            src={close}
            className="w-6 h-6 cursor-pointer opacity-70 hover:opacity-100 transition"
            onClick={closeModal}
          />
        </div>

        <div className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Note Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. UPSC General Studies Notes"
              ref={topic}
              onChange={() => setValidationError("")}
              className={`w-full p-2.5 rounded-lg bg-slate-950 border ${
                validationError ? "border-red-500" : "border-slate-700"
              } text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500`}
            />
            {validationError && (
              <p className="text-xs text-red-400 mt-1 font-medium">
                {validationError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description{" "}
              <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              placeholder="Summary or key points..."
              ref={description}
              rows={3}
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Attach File & Auto-Extract Text{" "}
              <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <FileUploader
                onFileSelect={handleFileUpload}
                buttonText={selectedFile ? "Change File" : "Choose File"}
                className="shrink-0"
              />
              {selectedFile && (
                <div className="flex flex-col truncate">
                  <span className="text-xs text-slate-300 truncate font-mono">
                    📄 {selectedFile.name} ({selectedFile.size} MB)
                  </span>
                  {isExtractingOcr ? (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 animate-pulse">
                      <span>⚡</span> Extracting text (OCR)...
                    </span>
                  ) : extractedText ? (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      ✓ OCR Text Extracted
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {selectedFile && (
              <div className="mt-3 w-full h-32">
                <FilePreview
                  fileUrl={selectedFile.url}
                  fileType={selectedFile.type}
                  fileName={selectedFile.name}
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {apiError && (
            <p className="text-xs text-red-400 bg-red-950/40 p-2 rounded border border-red-900">
              {apiError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleOnClick}
              disabled={isExtractingOcr}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium text-xs rounded-lg transition shadow-md cursor-pointer"
            >
              Upload Note
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Modal;
