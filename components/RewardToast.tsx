"use client";
import { useEffect, useState } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Coins, X, Sparkles } from "lucide-react";

export default function RewardToast() {
  const { rewardNotifications, clearRewardNotifications } = useFinanceStore();
  const [visible, setVisible] = useState(false);
  const latest = rewardNotifications[0];

  useEffect(() => {
    if (latest) {
      setVisible(true);
      const t = setTimeout(() => {
        setVisible(false);
        setTimeout(clearRewardNotifications, 400);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [latest?.id]);

  if (!latest || !visible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-400 ${
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-4 shadow-2xl border border-violet-400/30 max-w-lg mx-auto">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Sparkles className="text-yellow-300" size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white font-bold text-sm">¡Meta cumplida!</span>
              <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                <Coins size={12} className="text-yellow-300" />
                <span className="text-yellow-300 text-xs font-bold">+{latest.coins} Coins</span>
              </div>
            </div>
            <p className="text-white/90 text-xs leading-relaxed">{latest.message}</p>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(clearRewardNotifications, 400);
            }}
            className="flex-shrink-0 text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
