import { useState } from "react";

const GoogleAuthModal = ({ isOpen, onClose, onGoogleSubmit, isLoading }) => {
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!googleEmail) {
      setError("Please enter your Google Email address");
      return;
    }
    if (!googleEmail.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    const nameToUse = googleName.trim() || googleEmail.split("@")[0].replace(".", " ");
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(googleEmail)}`;

    onGoogleSubmit({
      email: googleEmail.trim().toLowerCase(),
      full_name: nameToUse,
      google_id: `google_${Date.now()}`,
      avatar_url: avatarUrl,
    });
  };

  const selectQuickAccount = (email, name) => {
    setGoogleEmail(email);
    setGoogleName(name);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Google Header */}
        <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-center mb-3">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
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
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign in with Google</h2>
          <p className="text-xs text-slate-500 mt-1">to continue to <strong className="text-slate-700">BrainVault AIR-1</strong></p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Account Picker suggestions */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select or enter your Google Account
            </label>
            <div className="flex flex-col gap-2 mb-3">
              <button
                type="button"
                onClick={() => selectQuickAccount("ashutosh.upsc@gmail.com", "Ashutosh Sharma")}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition text-left cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  A
                </div>
                <div className="flex-1 truncate">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600">Ashutosh Sharma</p>
                  <p className="text-[11px] text-slate-500 truncate">ashutosh.upsc@gmail.com</p>
                </div>
              </button>
            </div>
          </div>

          <div className="relative flex items-center my-1">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-2 text-[10px] text-slate-400 font-bold uppercase">or enter google email</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Email Address
            </label>
            <input
              type="email"
              placeholder="you.name@gmail.com"
              value={googleEmail}
              onChange={(e) => {
                setGoogleEmail(e.target.value);
                setError("");
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Ashutosh Sharma"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-2"
            >
              {isLoading ? "Signing in..." : "Continue as Google User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAuthModal;
