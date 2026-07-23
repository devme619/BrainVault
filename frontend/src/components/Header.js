import React from "react";
import Logo from "../assests/icons/brainvault_logo.svg";
import avatar_boy from "../assests/icons/avatar_boy.svg";

const Header = () => {
  return (
    <div className="h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img alt="BrainVault Logo" src={Logo} className="h-9 w-auto object-contain" />
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-200">Aspirant User</p>
          <p className="text-[10px] text-slate-400">UPSC AIR-1 Prep</p>
        </div>
        <div className="relative group">
          <img
            alt="avatar"
            src={avatar_boy}
            className="w-10 h-10 rounded-full border-2 border-emerald-500/80 p-0.5 cursor-pointer transition transform hover:scale-105 shadow-md shadow-emerald-950/40"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
        </div>
      </div>
    </div>
  );
};

export default Header;
