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
      const data = await getNotes();
      dispatch(setNotes(data));
    };
    fetchNotes();
  }, []);

  return (
    <div className="flex flex-wrap mb-20 p-4">
      {notesList?.map((note, index) => (
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
