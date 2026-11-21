"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Info,
  Key,
} from "lucide-react";

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, enterDemoMode, isConfigured } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError("Please fill in both email and password.");
      return;
    }
    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = err?.message || "Authentication failed.";
      if (message.includes("auth/user-not-found") || message.includes("auth/wrong-password") || message.includes("auth/invalid-credential")) {
        message = "Incorrect email or password. Please verify your credentials.";
      } else if (message.includes("auth/email-already-in-use")) {
        message = "This email is already registered. Try signing in instead.";
      } else if (message.includes("auth/weak-password")) {
        message = "Password should be at least 6 characters.";
      } else if (message.includes("auth/invalid-email")) {
        message = "Please enter a valid email address.";
      }
      setAuthError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Serene Floating Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl pointer-events-none -z-10 animate-float-slow" style={{ animationDelay: "3s" }} />

      {/* Main Centered Auth Card */}
      <div className="w-full max-w-md liquid-glass-modal rounded-4xl p-8 sm:p-10 shadow-liquid-lg animate-scale-up border border-white/80 relative z-10">
        
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-400 p-[2px] shadow-glow-primary mb-3">
            <div className="w-full h-full bg-white/90 rounded-[22px] flex items-center justify-center backdrop-blur-md">
              <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daily Flow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal Story Diary & Multimedia Vault
          </p>

          <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[11px] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict User Data Privacy Protected</span>
          </div>
        </div>

        {/* Auth Error Banner */}
        {authError && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50/90 border border-rose-200/80 text-rose-700 text-xs font-medium leading-relaxed">
            {authError}
          </div>
        )}

        {/* Login / Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm text-slate-800 placeholder:text-slate-400 shadow-inner transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white/70 border border-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm text-slate-800 placeholder:text-slate-400 shadow-inner transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-glow-primary hover:shadow-liquid-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? "Create Your Account" : "Sign In to Memories"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Login vs Sign Up */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setAuthError(null);
            }}
            className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account yet? Create one"}
          </button>
        </div>

        {/* Instant Demo Mode Option */}
        <div className="mt-6 pt-5 border-t border-slate-200/60">
          <button
            type="button"
            onClick={enterDemoMode}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white/80 hover:bg-white border border-slate-200/70 text-slate-700 hover:text-indigo-700 text-xs font-semibold shadow-sm hover:shadow transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Explore Demo Mode (Instant Preview)</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center mt-2">
            No signup needed • Pre-populated with media stories
          </p>
        </div>

        {/* Firebase Config Notice */}
        <div className="mt-4 pt-3 text-center">
          <button
            type="button"
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <Info className="w-3 h-3" />
            <span>{isConfigured ? "Firebase Connected" : "Connecting your Firebase project"}</span>
          </button>

          {showConfigGuide && (
            <div className="mt-3 p-3 rounded-2xl bg-white/70 border border-slate-200/60 text-left text-[11px] text-slate-600 space-y-1.5 animate-fade-in">
              <p className="font-semibold text-slate-800">To connect your live Firebase project:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-500">
                <li>Create a Firebase project at <span className="font-mono text-indigo-600">console.firebase.google.com</span></li>
                <li>Enable <span className="font-semibold text-slate-700">Email/Password Auth</span>, <span className="font-semibold text-slate-700">Firestore</span>, and <span className="font-semibold text-slate-700">Storage</span></li>
                <li>Add your credentials in <span className="font-mono text-indigo-600">.env.local</span></li>
              </ol>
            </div>
          )}
        </div>

      </div>

      {/* Footer Info */}
      <footer className="mt-6 text-center text-xs text-slate-400">
        Daily Flow • Apple Liquid Glass Aesthetic • End-to-End User Isolation
      </footer>
    </div>
  );
};
