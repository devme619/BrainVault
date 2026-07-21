import { useState } from "react";
import { createNote } from "../apis/notesAPI";

const useCreateNote = () => {
  const [error, setError] = useState(null);

  const addNote = async (payload) => {
    setError(null);
    try {
      const note = await createNote(payload);
      return note;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    addNote,
    error,
  };
};

export default useCreateNote;
