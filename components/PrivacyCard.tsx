"use client";

import React from "react";
import { ShieldCheck, Lock, Cloud, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const PrivacyCard: React.FC = () => {
  const { user, isDemo } = useAuth();

  return (
    <div className="crystal-glass rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-700 shadow-sm">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-slate-900">
            Strict Data Privacy
          </h3>
          <p className="text-[11px] text-slate-600">
            Private User-Level Isolation
          </p>
        </div>
      </div>

      <div className="space-y-2 text-[11px] text-slate-700">
        <div className="flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            Database strictly isolated under <code className="bg-white/40 px-1 py-0.5 rounded text-[10px] font-mono text-indigo-900 border border-white/50">users/{user?.uid ? user.uid.substring(0, 8) + '...' : '{uid}'}/entries</code>
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Cloud className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            Photos & videos saved in private vault under your authenticated UID
          </span>
        </div>
        <div className="flex items-start gap-2">
          <Key className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <span>
            Protected with client-side isolation & server-side Firebase security rules
          </span>
        </div>
      </div>
    </div>
  );
};
