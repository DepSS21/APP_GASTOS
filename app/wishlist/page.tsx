"use client";
import { useState } from "react";
import { useFinanceStore, formatCLP } from "@/store/useFinanceStore";
import { Plus, Trash2, Heart, Star, TrendingUp } from "lucide-react";

const WISH_EMOJIS = ["🎮", "👟", "📱", "💻", "🎧", "📸", "🚗", "✈️", "🏠", "⌚", "👜", "🎸", "🏋️", "🍕", "🎉"];
const PRIORITY_CONFIG = {
  alta: { label: "Alta", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-400" },
  media: { label: "Media", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-400" },
  baja: { label: "Baja", color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400" },
};

export default function WishlistPage() {
  const { wishlistItems, salary, addWishlistItem, removeWishlistItem, saveForWishlist } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [saveAmounts, setSaveAmounts] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [priority, setPriority] = useState<"alta" | "media" | "baja">("media");
  const [selectedEmoji, setSelectedEmoji] = useState("🎮");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseInt(targetAmount.replace(/\D/g, ""));
    if (!name.trim() || !amt) return;
    addWishlistItem({
      name: name.trim(),
      targetAmount: amt,
      savedAmount: 0,
      priority,
      imageEmoji: selectedEmoji,
    });
    setName("");
    setTargetAmount("");
    setPriority("media");
    setSelectedEmoji("🎮");
    setShowForm(false);
  }

  function handleSave(id: string) {
    const amt = parseInt((saveAmounts[id] || "0").replace(/\D/g, ""));
    if (amt <= 0) return;
    saveForWishlist(id, amt);
    setSaveAmounts((prev) => ({ ...prev, [id]: "" }));
  }

  const sorted = [...wishlistItems].sort((a, b) => {
    const order = { alta: 0, media: 1, baja: 2 };
    return order[a.priority] - order[b.priority];
  });

  const totalWishAmount = wishlistItems.reduce((s, w) => s + w.targetAmount, 0);
  const totalSaved = wishlistItems.reduce((s, w) => s + w.savedAmount, 0);
  const completedItems = wishlistItems.filter((w) => w.savedAmount >= w.targetAmount);

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Tus</p>
          <h1 className="text-2xl font-bold text-white">Deseos 💜</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Summary */}
      {wishlistItems.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-pink-600/40 to-violet-700/40 border border-pink-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Heart size={16} className="text-pink-400" />
            <span className="text-white font-semibold text-sm">Resumen de deseos</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-slate-400 text-[10px]">Objetivos</p>
              <p className="text-white font-bold">{wishlistItems.length}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px]">Total meta</p>
              <p className="text-white font-bold text-xs">{formatCLP(totalWishAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-[10px]">Logrados</p>
              <p className="text-green-400 font-bold">{completedItems.length}</p>
            </div>
          </div>
          {totalWishAmount > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Ahorro total</span>
                <span>{Math.round((totalSaved / totalWishAmount) * 100)}%</span>
              </div>
              <div className="bg-white/10 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-500 to-violet-500 rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (totalSaved / totalWishAmount) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-4 animate-slide-up space-y-3"
        >
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Star size={16} className="text-pink-400" />
            Nuevo deseo
          </h3>

          {/* Emoji picker */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {WISH_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-xl w-9 h-9 rounded-xl transition-colors ${
                    selectedEmoji === emoji
                      ? "bg-violet-600 border border-violet-400"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">¿Qué deseas comprar?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: iPhone 16, viaje a Argentina..."
              className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Precio estimado (CLP)</label>
              <input
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "alta" | "media" | "baja")}
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-violet-500"
              >
                <option value="alta">🔴 Alta</option>
                <option value="media">🟡 Media</option>
                <option value="baja">⚪ Baja</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-white/10 text-slate-400 rounded-xl py-2.5 text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              Agregar
            </button>
          </div>
        </form>
      )}

      {/* Wishlist items */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💭</div>
          <p className="text-slate-400 text-sm">Tu lista de deseos está vacía</p>
          <p className="text-slate-500 text-xs mt-1">Agrega lo que quieres lograr comprar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((item) => {
            const progress = Math.round((item.savedAmount / item.targetAmount) * 100);
            const isComplete = item.savedAmount >= item.targetAmount;
            const monthsNeeded = salary > 0
              ? Math.ceil((item.targetAmount - item.savedAmount) / (salary * 0.1))
              : 0;
            const cfg = PRIORITY_CONFIG[item.priority];

            return (
              <div
                key={item.id}
                className={`glass-card rounded-2xl p-4 border ${
                  isComplete ? "border-green-500/30" : "border-white/8"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl flex-shrink-0">{item.imageEmoji || "🎯"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-white font-semibold text-sm">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs flex items-center gap-1 ${cfg.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          {!isComplete && monthsNeeded > 0 && (
                            <span className="text-slate-500 text-xs">
                              ~{monthsNeeded} mes{monthsNeeded !== 1 ? "es" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{formatCLP(item.targetAmount)}</p>
                        {isComplete ? (
                          <span className="text-green-400 text-xs">✓ ¡Listo!</span>
                        ) : (
                          <p className="text-slate-400 text-xs">{formatCLP(item.savedAmount)} ahorrado</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{progress}% completado</span>
                    <span>Faltan {formatCLP(Math.max(0, item.targetAmount - item.savedAmount))}</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 transition-all ${
                        isComplete
                          ? "bg-gradient-to-r from-green-500 to-emerald-400"
                          : "bg-gradient-to-r from-pink-500 to-violet-500"
                      }`}
                      style={{ width: `${Math.min(100, progress)}%` }}
                    />
                  </div>
                </div>

                {/* Add savings */}
                {!isComplete && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={saveAmounts[item.id] || ""}
                      onChange={(e) =>
                        setSaveAmounts((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder="Abono..."
                      className="flex-1 rounded-xl px-3 py-2 text-xs border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                    />
                    <button
                      onClick={() => handleSave(item.id)}
                      className="px-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <TrendingUp size={12} />
                      Abonar
                    </button>
                    <button
                      onClick={() => removeWishlistItem(item.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}

                {isComplete && (
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 text-xs font-medium">🎉 ¡Meta alcanzada! Ya puedes comprarlo.</span>
                    <button
                      onClick={() => removeWishlistItem(item.id)}
                      className="p-1.5 rounded-xl hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={14} className="text-slate-500 hover:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
