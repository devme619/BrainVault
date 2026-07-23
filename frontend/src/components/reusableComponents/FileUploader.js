const FileUploader = ({
  onFileSelect,
  isMulti = false,
  accept = "image/*,application/pdf",
  buttonText = "Upload File",
  className = "",
}) => {
  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (isMulti) {
      onFileSelect(files);
    } else {
      onFileSelect(files[0]);
    }
    e.target.value = null;
  };

  return (
    <label
      className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium cursor-pointer transition text-white inline-block ${className}`}
    >
      {buttonText}
      <input
        type="file"
        multiple={isMulti}
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};

export default FileUploader;
