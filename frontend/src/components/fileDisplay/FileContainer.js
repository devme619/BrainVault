import { useState } from "react";
import Modal from "./Modal";
import FilesList from "./FilesList";
import NoteDetailView from "./NoteDetailView";

const FileContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const handleOnClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full overflow-y-auto hide-scrollbar">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <h1 className="text-lg font-bold text-slate-100 tracking-wide">
            Subject Name
          </h1>
        </div>

        <button
          onClick={handleOnClick}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg shadow-md shadow-emerald-950/40 transition cursor-pointer flex items-center gap-2"
        >
          <span className="text-base font-bold">+</span> Create Note
        </button>
      </div>

      {/* Note creation Modal */}
      {isModalOpen && (
        <Modal heading={"Create new note"} setIsModalOpen={setIsModalOpen} />
      )}

      {/* Scrollable File Cards List */}
      <div className="p-2">
        <FilesList onNoteSelect={(note) => setSelectedNote(note)} />
      </div>

      {/* Right Side Note Detail Reader View Panel */}
      {selectedNote && (
        <NoteDetailView
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
        />
      )}
    </div>
  );
};

export default FileContainer;
