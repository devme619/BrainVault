import React from "react";
import Logo from "../assests/icons/brainvault_logo.svg";
import avatar_boy from "../assests/icons/avatar_boy.svg";

const Header = () => {
  return (
    <div className="flex justify-between h-20 border-black border-b-2 bg-gray-900 text-white">
      <div>
        <img alt="Logo" src={Logo} className="w-32 h-auto" />
      </div>
      <div className="flex justify-center items-center mr-4">
        <img
          alt="avatar"
          src={avatar_boy}
          className="w-12 h-12 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Header;
