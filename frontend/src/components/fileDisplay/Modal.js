import { useRef } from "react";
import close from "../../assests/icons/cross-circle.svg";
import FileUploader from "../reusableComponents/FileUploader";

const Modal = ({ heading, setIsModalOpen }) => {
  const topic = useRef(null);
  const description = useRef(null);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOnClick = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: topic.current.value,
          description: description.current.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const data = await response.json();
      console.log("Created:", data);
    } catch (err) {
      console.error(err);
    }
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
