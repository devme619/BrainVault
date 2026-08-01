import { useRef, useState } from "react";
import close from "../../assests/icons/cross-circle.svg";
import FileUploader from "../reusableComponents/FileUploader";
import FilePreview from "../reusableComponents/FilePreview";
import useCreateNote from "../../hooks/useCreateNote";
import { useDispatch, useSelector } from "react-redux";
import { addSingleNote } from "../../utils/store/notesSlice";
import { uploadNoteFileToCloud } from "../../apis/notesAPI";

function flattenSubjectTree(nodes, level = 0, result = []) {
  if (!nodes || !Array.isArray(nodes)) return result;
  for (const node of nodes) {
    const indent = "— ".repeat(level);
    result.push({
      id: node.id,
      name: `${indent}${node.name}`,
    });
    if (node.children && node.children.length > 0) {
      flattenSubjectTree(node.children, level + 1, result);
    }
  }
  return result;
}

const Modal = ({ heading, setIsModalOpen }) => {
  const dispatch = useDispatch();
  const { subjectTopicsTree, selectedSubjectTopic } = useSelector((store) => store.notes);

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(selectedSubjectTopic?.id || "");
  const [validationError, setValidationError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const topic = useRef(null);
  const description = useRef(null);
  const { addNote, error: apiError } = useCreateNote();

  const options = flattenSubjectTree(subjectTopicsTree);

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
    setIsUploading(true);

    let finalFileUrl = selectedFile?.url || null;
    let finalFileType = selectedFile?.type || null;
    let finalFileName = selectedFile?.name || null;

    try {
      // Upload file attachment to Cloudflare R2 / AWS S3 cloud storage
      if (selectedFile?.file) {
        try {
          const cloudRes = await uploadNoteFileToCloud(selectedFile.file);
          if (cloudRes?.file_url) {
            finalFileUrl = cloudRes.file_url;
            finalFileType = cloudRes.file_type || selectedFile.type;
            finalFileName = cloudRes.file_name || selectedFile.name;
          }
        } catch (uploadErr) {
          console.warn("Cloud upload warning, proceeding with local payload:", uploadErr);
        }
      }

      const payload = {
        name: nameVal,
        description: description.current.value.trim() || "",
        subjectTopicId: selectedTopicId ? parseInt(selectedTopicId) : null,
        fileUrl: finalFileUrl,
        fileType: finalFileType,
        fileName: finalFileName,
      };

      const createdBackendNote = await addNote(payload).catch(() => null);

      const noteToStore = {
        id: createdBackendNote?.id || Date.now(),
        name: createdBackendNote?.name || payload.name,
        description: createdBackendNote?.description || payload.description,
        subjectTopicId: createdBackendNote?.subjectTopicId || payload.subjectTopicId,
        file: selectedFile?.file || null,
        fileUrl: createdBackendNote?.fileUrl || payload.fileUrl,
        fileType: createdBackendNote?.fileType || payload.fileType,
        fileName: createdBackendNote?.fileName || payload.fileName,
        extractedText: createdBackendNote?.extractedText || null,
        textContent: createdBackendNote?.textContent || null,
      };

      dispatch(addSingleNote(noteToStore));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create note:", err);
    } finally {
      setIsUploading(false);
    }
  };

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
      url: URL.createObjectURL(file),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 font-sans animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{heading}</h3>
            <p className="text-xs text-slate-400">Save structured study material & cloud documents</p>
          </div>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <img src={close} alt="close" className="w-5 h-5 filter invert opacity-75 hover:opacity-100" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleOnClick} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          {validationError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold">
              ⚠️ {validationError}
            </div>
          )}

          {apiError && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs font-semibold">
              ⚠️ {apiError}
            </div>
          )}

          {/* Note Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Note Name / Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              ref={topic}
              placeholder="e.g. GS2 Constitutional Framework & 73rd Amendment"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Subject / Topic Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Link to Subject / Sub-Topic (Optional)
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="">-- General Notes (No Subject Tag) --</option>
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Short Description / Summary
            </label>
            <textarea
              ref={description}
              rows={3}
              placeholder="Key notes summary, exam relevance, or mentor hints..."
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* File Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Attach Study Document (PDF / Image) - <span className="text-emerald-400">Cloud Storage S3</span>
            </label>

            {!selectedFile ? (
              <FileUploader onFileUpload={handleFileUpload} />
            ) : (
              <div className="relative rounded-xl border border-slate-800 overflow-hidden bg-slate-950 p-2">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold text-xs">✓ Attached:</span>
                    <span className="font-mono text-slate-200 truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-slate-500 text-[10px]">({selectedFile.size} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold px-2 py-0.5 rounded bg-red-950/60 border border-red-900 cursor-pointer"
                  >
                    Remove File
                  </button>
                </div>
                <div className="w-full h-44 rounded-lg overflow-hidden">
                  <FilePreview
                    fileUrl={selectedFile.url}
                    fileType={selectedFile.type}
                    fileName={selectedFile.name}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 cursor-pointer flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading to Cloud Storage...</span>
                </>
              ) : (
                <span>Save Note to Cloud Storage ☁️</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
