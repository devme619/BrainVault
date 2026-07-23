import { useState } from "react";
import Modal from "./Modal";
import FilesList from "./FilesList";

const FileContainer = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOnClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="relative w-full h-full overflow-y-scroll hide-scrollbar">
      <div className="sticky top-0 z-100 bg-slate-900">
        <h1 className=" flex justify-center  text-white font-bold text-lg">
          {" "}
          Subject Name
        </h1>
        <div className="flex w-full justify-end">
          <button
            onClick={handleOnClick}
            className="flex mx-4 mb-1 p-2 justify-end bg-white text-black font-bold rounded-lg "
          >
            Create Note
          </button>
        </div>
      </div>
      {isModalOpen && (
        <Modal heading={"Create new note"} setIsModalOpen={setIsModalOpen} />
      )}
      <FilesList />
    </div>
  );
};

export default FileContainer;
