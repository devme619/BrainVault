import { Link, useLocation } from "react-router-dom";

const SideNav = () => {
  const location = useLocation();

  const isHomeActive =
    location.pathname === "/home" || location.pathname === "/home/";
  const isCheckAnswersActive = location.pathname.includes("/home/checkanswers");

  return (
    <nav className="flex flex-col gap-2 pt-2">
      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        Navigation
      </div>
      <Link to="/home">
        <button
          className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-3 cursor-pointer ${
            isHomeActive
              ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-950/40 font-semibold"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`}
        >
          <span className="text-base">📚</span>
          <span>Notes Feed</span>
        </button>
      </Link>

      <Link to="/home/checkanswers">
        <button
          className={`w-full px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-3 cursor-pointer ${
            isCheckAnswersActive
              ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-950/40 font-semibold"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
          }`}
        >
          <span className="text-base">📝</span>
          <span>Check Answers</span>
        </button>
      </Link>
    </nav>
  );
};

export default SideNav;
