import React from "react";
import Header from "./Header";
import background from "../assests/images/bg.png";

const Login = () => {
  return (
    <div>
      <Header />
      <img
        alt="bg"
        src={background}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <form className="relative w-1/3 m-auto p-4 bg-gray-700 bg-opacity-60 rounded-3xl">
        <h1 className="mt-4 text-2xl font-bold text-white">Sign In</h1>
        <div className="grid">
          <input
            type="text"
            placeholder="Full Name"
            className="p-2 m-4 rounded-lg text-white bg-transparent border border-solid border-white placeholder:text-white font-bold"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="p-2 m-4 rounded-lg text-white bg-transparent border border-solid border-white placeholder:text-white font-bold"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 m-4 rounded-lg text-white bg-transparent border border-solid border-white placeholder:text-white font-bold"
          />
          <button
            className="w-fit px-4 py-2 mx-auto mb-4 bg-white rounded-lg hover:bg-opacity-85"
            onClick={(e) => e.preventDefault()}
          >
            Sign In
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
