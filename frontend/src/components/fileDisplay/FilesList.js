import { useEffect, useState } from "react";
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
    <div className="flex flex-wrap mb-20">
      {notesList?.map(({ id, name, description }) => (
        <FileCard key={id} name={name} description={description} />
      ))}
    </div>
  );
};

export default FilesList;
