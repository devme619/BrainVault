const FilePreview = ({
  fileUrl,
  fileType = "",
  fileName = "",
  className = "w-full h-full",
  showFileName = false,
}) => {
  if (!fileUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-800/50 text-slate-500 rounded-lg p-4 border border-slate-700/50 ${className}`}>
        <div className="text-3xl mb-1">📄</div>
        <p className="text-xs text-slate-400">No file attached</p>
      </div>
    );
  }

  const isPdf =
    fileType === "application/pdf" ||
    (fileName && fileName.toLowerCase().endsWith(".pdf")) ||
    (fileUrl && fileUrl.toLowerCase().includes(".pdf"));

  const isImage =
    fileType.startsWith("image/") ||
    (fileName && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)) ||
    (!isPdf && fileUrl);

  return (
    <div className={`relative overflow-hidden rounded-lg bg-slate-900 border border-slate-800 flex flex-col items-center justify-center ${className}`}>
      {isPdf ? (
        <div className="w-full h-full flex flex-col">
          <iframe
            src={fileUrl}
            title={fileName || "PDF Preview"}
            className="w-full h-full border-0 bg-white rounded-t-lg"
          />
          {showFileName && (
            <div className="bg-slate-900 p-1.5 text-center text-[10px] text-slate-300 font-mono truncate border-t border-slate-800">
              📄 {fileName || "PDF Document"}
            </div>
          )}
        </div>
      ) : isImage ? (
        <div className="w-full h-full flex flex-col justify-center items-center bg-black/40 overflow-hidden relative group">
          <img
            src={fileUrl}
            alt={fileName || "File Preview"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {showFileName && (
            <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-xs p-1 text-center text-[10px] text-slate-200 truncate">
              🖼️ {fileName}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-3 text-center text-slate-400">
          <div className="text-2xl mb-1">📎</div>
          <span className="text-xs font-medium truncate max-w-full">{fileName || "Attached File"}</span>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
