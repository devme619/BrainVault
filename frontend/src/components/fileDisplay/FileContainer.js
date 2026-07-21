import { useState } from "react";
import Modal from "./Modal";
import FilesList from "./FilesList";

const FileContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOnClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full bg-white overflow-y-scroll hide-scrollbar">
      <h1> Subject Name</h1>
      <div>
        <button onClick={handleOnClick}>Create new Subject</button>
        {isModalOpen && (
          <Modal heading={"Create new note"} setIsModalOpen={setIsModalOpen} />
        )}
      </div>
      <FilesList />
    </div>
  );
};

export default FileContainer;
