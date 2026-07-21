import { useRef } from "react";

const FileUploader = ({ isMulti = false }) => {
  const files = useRef();
  return (
    <div>
      <input
        className="m-4 p-2 rounded-lg text-white"
        type="file"
        multiple={isMulti}
        ref={files}
        onChange={() => console.log(files)}
      />
    </div>
  );
};

export default FileUploader;
