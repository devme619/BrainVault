import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../utils/store/userSlice";
import { setNotes, clearOpenedNote } from "../utils/store/notesSlice";
import { resetCheckAnswers } from "../utils/store/checkAnswersSlice";
import { signupUser, loginUser, googleAuthUser } from "../apis/authAPI";
import Header from "./Header";
import background from "../assests/images/bg.png";
import WelcomeAnimation from "./welcome/WelcomeAnimation";
import GoogleAuthModal from "./auth/GoogleAuthModal";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showWelcomeAnimation, user } = useSelector((store) => store.user);

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
  };

  const clearPreviousUserData = () => {
    dispatch(setNotes([]));
    dispatch(clearOpenedNote());
    dispatch(resetCheckAnswers());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isSignUp) {
      if (!fullName) {
        setError("Full Name is required for registration.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      clearPreviousUserData();

      if (isSignUp) {
        const response = await signupUser({
          full_name: fullName,
          email: email,
          password: password,
        });

        dispatch(
          setUser({
            user: response.user,
            token: response.access_token,
            isNewUser: true,
          })
        );
      } else {
        const response = await loginUser({
          email: email,
          password: password,
        });

        dispatch(
          setUser({
            user: response.user,
            token: response.access_token,
            isNewUser: false,
          })
        );
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async (googleUserData) => {
    setLoading(true);
    setError("");
    try {
      clearPreviousUserData();
      const response = await googleAuthUser(googleUserData);

      dispatch(
        setUser({
          user: response.user,
          token: response.access_token,
          isNewUser: response.user.is_new_user,
        })
      );

      setIsGoogleModalOpen(false);

      if (!response.user.is_new_user) {
        navigate("/home");
      }
    } catch (err) {
      setError(err.message || "Google Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showWelcomeAnimation) {
    return <WelcomeAnimation userName={user?.full_name || "Aspirant"} />;
  }

  return (
    <div className="relative w-screen h-screen flex flex-col overflow-hidden bg-slate-950 text-white selection:bg-emerald-500">
      {/* Top Navigation */}
      <div className="relative z-20 shrink-0 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
        <Header />
      </div>

      {/* Background Image Layer with vignette overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          alt="bg"
          src={background}
          className="w-full h-full object-cover opacity-20 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/95"></div>
      </div>

      {/* Center Auth Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col gap-4"
        >
          <div className="text-center mb-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
              UPSC AIR-1 BrainVault
            </span>
            <h1 className="text-2xl font-bold text-slate-100 mt-2">
              {isSignUp ? "Create your Account" : "Sign In to BrainVault"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isSignUp
                ? "Register to start AI-powered answer evaluations"
                : "Enter your credentials to access your notes vault"}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-300 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ashutosh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="aspirant@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold rounded-xl transition text-sm shadow-lg shadow-emerald-950/50 mt-1 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : isSignUp ? (
              "Sign Up & Create Account"
            ) : (
              "Sign In"
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center my-1">
            <div className="flex-1 border-t border-slate-800"></div>
            <span className="px-3 text-xs text-slate-500 uppercase font-mono">OR</span>
            <div className="flex-1 border-t border-slate-800"></div>
          </div>

          {/* Google Sign-In Button */}
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={loading}
            className="w-full py-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-200 font-medium text-xs rounded-xl transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.4-.4-2.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* Toggle Mode */}
          <div className="text-center mt-2 text-xs text-slate-400">
            {isSignUp ? "Already registered?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer ml-1"
            >
              {isSignUp ? "Sign In here" : "Sign Up now"}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Google Sign-In Popup Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onGoogleSubmit={handleGoogleSubmit}
        isLoading={loading}
      />
    </div>
  );
};

export default Login;
