import FilePreview from "./FilePreview";

const FileCard = ({ note, onCardClick }) => {
  const { name, description, fileUrl, fileType, fileName, extractedText } = note;

  return (
    <div
      onClick={() => onCardClick && onCardClick(note)}
      className="w-64 h-84 m-4 bg-slate-900 border border-slate-800 hover:border-emerald-500/80 rounded-xl p-4 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-emerald-950/30 group cursor-pointer relative"
    >
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between">
          <h3
            className="font-semibold text-slate-100 text-base truncate group-hover:text-emerald-400 transition"
            title={name}
          >
            {name}
          </h3>
          {extractedText && (
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/80 px-1.5 py-0.5 rounded font-mono">
              OCR ✓
            </span>
          )}
        </div>
        {description ? (
          <p className="text-xs text-slate-400 line-clamp-2" title={description}>
            {description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic">No description provided</p>
        )}
      </div>

      <div className="flex-1 my-2.5 relative overflow-hidden rounded-lg">
        <FilePreview
          fileUrl={fileUrl}
          fileType={fileType}
          fileName={fileName}
          className="w-full h-full"
          showFileName={false}
        />
      </div>

      {fileName ? (
        <div className="shrink-0 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          <span className="truncate max-w-[130px] font-mono" title={fileName}>
            📎 {fileName}
          </span>
          <span className="text-[10px] font-semibold text-emerald-400">
            Open Note →
          </span>
        </div>
      ) : (
        <div className="shrink-0 flex justify-end">
          <span className="text-[10px] text-emerald-400 font-semibold">
            Open Note →
          </span>
        </div>
      )}
    </div>
  );
};

export default FileCard;
