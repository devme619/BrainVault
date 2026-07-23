import FilePreview from "./FilePreview";

const FileCard = ({ name, description, fileUrl, fileType, fileName }) => {
  return (
    <div className="w-60 h-80 m-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition shadow-lg group">
      <div className="flex flex-col gap-1.5 shrink-0">
        <h3 className="font-semibold text-slate-100 text-base truncate group-hover:text-emerald-400 transition" title={name}>
          {name}
        </h3>
        {description ? (
          <p className="text-xs text-slate-400 line-clamp-2" title={description}>
            {description}
          </p>
        ) : (
          <p className="text-xs text-slate-600 italic">No description provided</p>
        )}
      </div>

      <div className="flex-1 my-3 relative overflow-hidden rounded-lg">
        <FilePreview
          fileUrl={fileUrl}
          fileType={fileType}
          fileName={fileName}
          className="w-full h-full"
          showFileName={false}
        />
      </div>

      {fileName && (
        <div className="shrink-0 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
          <span className="truncate max-w-[140px] font-mono" title={fileName}>
            📎 {fileName}
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-500">
            {fileType?.includes("pdf") ? "PDF" : fileType?.includes("image") ? "IMG" : "FILE"}
          </span>
        </div>
      )}
    </div>
  );
};

export default FileCard;
