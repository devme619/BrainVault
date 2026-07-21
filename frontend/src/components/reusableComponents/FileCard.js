const FileCard = ({ name, description }) => {
  return (
    <div className="w-44 h-60 m-4 p-4 bg-slate-400">
      <h1>{name}</h1>
      <div>{description}</div>
    </div>
  );
};

export default FileCard;
