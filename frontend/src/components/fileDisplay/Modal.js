import { useRef, useState } from "react";
import close from "../../assests/icons/cross-circle.svg";
import FileUploader from "../reusableComponents/FileUploader";
import useCreateNote from "../../hooks/useCreateNote";
import { useDispatch } from "react-redux";
import { addSingleNote } from "../../utils/store/notesSlice";

const Modal = ({ heading, setIsModalOpen }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const dispatch = useDispatch();
  const topic = useRef(null);
  const description = useRef(null);
  const { addNote, error } = useCreateNote();

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnClick = async (e) => {
    e.preventDefault();
    const payload = {
      name: topic.current.value,
      description: description.current.value,
    };
    try {
      await addNote(payload);
      dispatch(addSingleNote(payload));
      setIsModalOpen(false);
    } catch (err) {}
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    if (selectedFile?.url) {
      URL.revokeObjectURL(selectedFile.url);
    }
    setSelectedFile({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type,
      url: URL.createObjectURL(file),
    });
  };

  return (
    <div>
      <div className="fixed inset-0 z-20 w-full h-full  bg-black bg-opacity-60" />
      <form
        onSubmit={(e) => e.preventDefault()}
        className="fixed inset-0 z-30 w-1/3 h-fit mx-auto my-[10%] rounded-lg bg-slate-900 text-white"
      >
        <div className="flex justify-between p-4">
          <h1 className="font-bold text-2xl">{heading}</h1>
          <img
            alt="close"
            src={close}
            className="w-8 h-auto cursor-pointer"
            onClick={closeModal}
          />
        </div>
        <div className="w-full grid">
          <input
            type="text"
            placeholder="Topic of the note"
            ref={topic}
            className="m-4 p-2 rounded-lg text-black"
          />
          <input
            type="text"
            placeholder="Describe about note"
            ref={description}
            className="m-4 p-2 rounded-lg text-black"
          />
          <div className="flex">
            <FileUploader
              onFileSelect={handleFileUpload}
              className="w-32 mx-4"
            />
            <span className="m-auto">
              {selectedFile && (
                <p className="text-xs text-slate-400">
                  {selectedFile.name} ({selectedFile.size} MB)
                </p>
              )}
            </span>
          </div>
          <p className="mx-4 text-red-600">{error}</p>
          <button
            onClick={handleOnClick}
            className="w-fit mx-auto my-4 px-2 py-1 rounded-lg bg-white text-black"
          >
            Upload Note
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modal;
