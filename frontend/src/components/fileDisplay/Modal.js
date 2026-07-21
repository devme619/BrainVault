import { useRef } from "react";
import close from "../../assests/icons/cross-circle.svg";
import FileUploader from "../reusableComponents/FileUploader";
import useCreateNote from "../../hooks/useCreateNote";

const Modal = ({ heading, setIsModalOpen }) => {
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
      setIsModalOpen(false);
    } catch (err) {}
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
          <FileUploader isMulti={true} />
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
