import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { dismissWelcomeAnimation } from "../../utils/store/userSlice";
import Logo from "../../assests/icons/brainvault_logo.svg";

const WelcomeAnimation = ({ userName = "Aspirant" }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const steps = [
    { label: "Initializing AI Evaluation Engine...", icon: "⚡" },
    { label: "Connecting UPSC Guidelines & Criteria...", icon: "📜" },
    { label: "Building Personal Notes Vault...", icon: "📚" },
    { label: "Workspace Ready!", icon: "✨" },
  ];

  useEffect(() => {
    // 6-second progress interval
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const next = prev + 2;
        if (next >= 75) setStepIndex(3);
        else if (next >= 50) setStepIndex(2);
        else if (next >= 25) setStepIndex(1);
        return next;
      });
    }, 120);

    // Auto complete at 6.5s
    const timeout = setTimeout(() => {
      handleComplete();
    }, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleComplete = () => {
    dispatch(dismissWelcomeAnimation());
    navigate("/home");
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden selection:bg-emerald-500">
      {/* Dynamic Animated Particle Aura & Glow */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="w-[300px] h-[300px] bg-teal-500/15 rounded-full blur-[90px] animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/70 to-slate-950"></div>
      </div>

      {/* Floating Sparkle Elements */}
      <div className="absolute top-1/4 left-1/5 text-2xl animate-bounce duration-1000 opacity-60">✨</div>
      <div className="absolute bottom-1/4 right-1/5 text-2xl animate-pulse opacity-60">🧠</div>
      <div className="absolute top-1/3 right-1/4 text-xl animate-bounce opacity-40" style={{ animationDelay: '0.5s' }}>📑</div>

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
        {/* Animated Logo Container */}
        <div className="relative mb-8 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-75 transition duration-1000 animate-pulse"></div>
          <div className="relative p-6 bg-slate-900/90 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-md">
            <img src={Logo} alt="BrainVault Logo" className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]" />
          </div>
        </div>

        {/* Personalized Welcome Banner */}
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-widest mb-3 animate-fade-in">
          Welcome to BrainVault
        </span>

        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          Hello, <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{userName}</span>! 👋
        </h1>

        <p className="text-sm text-slate-400 mb-8 max-w-md leading-relaxed">
          Your personal AI-powered UPSC Answer Evaluation & Note Vault is being prepared for you.
        </p>

        {/* Progress Bar & Status Step */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl mb-6">
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-2">
              <span>{steps[stepIndex].icon}</span> {steps[stepIndex].label}
            </span>
            <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleComplete}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer group"
        >
          <span>Enter BrainVault Workspace</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
