import { useEffect, useState } from "react";
import FileCard from "../reusableComponents/FileCard";
import { getNotes } from "../../apis/notesAPI";

const FilesList = () => {
  const [notesList, setNotesList] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotes();
      setNotesList(data);
    };
    fetchNotes();
  }, []);

  return (
    <div className="flex flex-wrap mb-20">
      {notesList?.map(({ id, name, description }) => (
        <FileCard key={id} name={name} description={description} />
      ))}
    </div>
  );
};

export default FilesList;
