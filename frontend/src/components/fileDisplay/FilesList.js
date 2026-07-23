import { useEffect } from "react";
import FileCard from "../reusableComponents/FileCard";
import { getNotes } from "../../apis/notesAPI";
import { useDispatch, useSelector } from "react-redux";
import { setNotes } from "../../utils/store/notesSlice";

const FilesList = () => {
  const dispatch = useDispatch();
  const notesList = useSelector((store) => store.notes);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        dispatch(setNotes(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("Failed to fetch notes:", err);
        dispatch(setNotes([]));
      }
    };
    fetchNotes();
  }, [dispatch]);

  if (!notesList || notesList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 m-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-center backdrop-blur-sm">
        <div className="text-4xl mb-3 opacity-60">📚</div>
        <h3 className="text-base font-semibold text-slate-300">No notes exist yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Click the <strong className="text-emerald-400 font-medium">+ Create Note</strong> button above to add your first answer sheet or subject note.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap mb-20 p-4">
      {notesList.map((note, index) => (
        <FileCard
          key={note.id || index}
          name={note.name}
          description={note.description}
          fileUrl={note.fileUrl}
          fileType={note.fileType}
          fileName={note.fileName}
        />
      ))}
    </div>
  );
};

export default FilesList;
