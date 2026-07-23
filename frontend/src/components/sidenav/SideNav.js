import { Link } from "react-router-dom";

const SideNav = () => {
  return (
    <div className="relative w-48 h-full bg-slate-900 bg-gradient-to-t">
      <Link to="/home">
        <button className="w-32 p-2 m-2 bg-white rounded-lg hover:bg-slate-200 text-slate-900 font-medium">
          Home
        </button>
      </Link>
      <Link to="/home/checkanswers">
        <button className="w-32 p-2 m-2 bg-white rounded-lg hover:bg-slate-200 text-slate-900 font-medium">
          Check Answers
        </button>
      </Link>
    </div>
  );
};

export default SideNav;
