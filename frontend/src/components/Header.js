import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/store/userSlice";
import Logo from "../assests/icons/brainvault_logo.svg";
import avatar_boy from "../assests/icons/avatar_boy.svg";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, isAuthenticated } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowDropdown(false);
    navigate("/");
  };

  const displayName = user?.full_name || "Aspirant User";
  const avatarSrc = user?.avatar_url || avatar_boy;

  return (
    <div className="h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img alt="BrainVault Logo" src={Logo} className="h-9 w-auto object-contain" />
      </div>

      {isAuthenticated ? (
        <div className="relative flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{displayName}</p>
            <p className="text-[10px] text-emerald-400 font-mono">UPSC AIR-1 Aspirant</p>
          </div>
          
          <div className="relative">
            <img
              alt="avatar"
              src={avatarSrc}
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full border-2 border-emerald-500/80 p-0.5 cursor-pointer transition transform hover:scale-105 shadow-md shadow-emerald-950/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>

            {/* User Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-semibold text-slate-100 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 mt-1 hover:bg-red-950/40 text-red-400 hover:text-red-300 rounded-lg transition font-medium cursor-pointer flex items-center justify-between"
                >
                  <span>Sign Out</span>
                  <span>🚪</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Guest Mode</span>
        </div>
      )}
    </div>
  );
};

export default Header;
