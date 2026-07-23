import Header from "./Header";
import background from "../assests/images/bg.png";
import SideNav from "./sidenav/SideNav";
import { Outlet } from "react-router-dom";

const Home = () => {
  return (
    <div className="w-screen h-screen flex flex-col overflow-hidden bg-slate-950 text-slate-100 relative selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          alt="bg"
          src={background}
          className="w-full h-full object-cover opacity-20 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95"></div>
      </div>
      <div className="relative z-20 shrink-0 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <Header />
      </div>
      <div className="relative z-10 flex-1 flex overflow-hidden">
        <div className="w-56 shrink-0 bg-slate-900/40 backdrop-blur-md border-r border-slate-800/60 flex flex-col p-3">
          <SideNav />
        </div>
        <div className="flex-1 h-full overflow-hidden relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Home;
