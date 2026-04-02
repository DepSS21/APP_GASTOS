"use client";
import { useState } from "react";
import {
  useFinanceStore,
  formatCLP,
  getWeekNumber,
} from "@/store/useFinanceStore";
import {
  Plus,
  Trash2,
  PiggyBank,
  Trophy,
  Coins,
  Target,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const SUGGESTED_GOALS = [
  { name: "Semana 1 - Inicio del ahorro", amount: 10000 },
  { name: "Semana 2 - Constancia", amount: 15000 },
  { name: "Semana 3 - Disciplina", amount: 20000 },
  { name: "Semana 4 - Meta mensual", amount: 30000 },
];

export default function AhorroPage() {
  const {
    savingsGoals,
    coins,
    salary,
    distribution,
    addSavingsGoal,
    updateSavingsGoal,
    removeSavingsGoal,
  } = useFinanceStore();

  const [showForm, setShowForm] = useState(false);
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");

  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const currentYear = now.getFullYear();

  const activeGoals = savingsGoals.filter((g) => !g.completed);
  const completedGoals = savingsGoals.filter((g) => g.completed);
  const savingsBudget = Math.round(salary * (distribution.savings / 100));
  const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseInt(targetAmount.replace(/\D/g, ""));
    if (!name.trim() || !amt) return;
    addSavingsGoal({
      name: name.trim(),
      targetAmount: amt,
      currentAmount: 0,
      weekNumber: currentWeek,
      year: currentYear,
    });
    setName("");
    setTargetAmount("");
    setShowForm(false);
  }

  function handleSuggestedGoal(goal: { name: string; amount: number }) {
    addSavingsGoal({
      name: goal.name,
      targetAmount: goal.amount,
      currentAmount: 0,
      weekNumber: currentWeek,
      year: currentYear,
    });
  }

  function handleAddAmount(id: string) {
    const amt = parseInt((addAmounts[id] || "0").replace(/\D/g, ""));
    if (amt <= 0) return;
    updateSavingsGoal(id, amt);
    setAddAmounts((prev) => ({ ...prev, [id]: "" }));
  }

  const coinLevel = coins < 50 ? "Principiante" : coins < 150 ? "Ahorrista" : coins < 300 ? "Inversor" : "Maestro Financiero";
  const coinLevelEmoji = coins < 50 ? "🌱" : coins < 150 ? "💰" : coins < 300 ? "🏆" : "👑";
  const nextLevelCoins = coins < 50 ? 50 : coins < 150 ? 150 : coins < 300 ? 300 : 999;

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Semana {currentWeek}</p>
          <h1 className="text-2xl font-bold text-white">Ahorro</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Coins / Level Card */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-yellow-600/40 to-amber-700/40 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-yellow-200 text-xs mb-0.5">Nivel actual</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{coinLevelEmoji}</span>
              <p className="text-white font-bold text-lg">{coinLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <Coins size={20} className="text-yellow-400" />
              <span className="text-yellow-400 font-bold text-2xl">{coins}</span>
            </div>
            <p className="text-yellow-200 text-xs">FinCoins</p>
          </div>
        </div>
        {coins < 999 && (
          <>
            <div className="flex justify-between text-xs text-yellow-200 mb-1">
              <span>Próximo nivel: {nextLevelCoins} coins</span>
              <span>{Math.round((coins / nextLevelCoins) * 100)}%</span>
            </div>
            <div className="bg-white/20 rounded-full h-2">
              <div
                className="bg-yellow-400 rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, (coins / nextLevelCoins) * 100)}%` }}
              />
            </div>
          </>
        )}
        {coins >= 999 && (
          <p className="text-yellow-300 text-xs text-center">👑 ¡Nivel máximo alcanzado!</p>
        )}
      </div>

      {/* Budget info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-slate-400 text-[10px] mb-1">Presupuesto ahorro/mes</p>
          <p className="text-amber-400 font-bold text-sm">{formatCLP(savingsBudget)}</p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-slate-400 text-[10px] mb-1">Total ahorrado</p>
          <p className="text-green-400 font-bold text-sm">{formatCLP(totalSaved)}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-4 animate-slide-up space-y-3"
        >
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Target size={16} className="text-violet-400" />
            Nueva meta de ahorro
          </h3>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Nombre de la meta</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ahorro semana 1..."
              className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Meta de ahorro (CLP)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              required
            />
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
              Crear meta
            </button>
          </div>
        </form>
      )}

      {/* Suggested goals */}
      {activeGoals.length === 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Sparkles size={16} className="text-violet-400" />
            Metas sugeridas para esta semana
          </h3>
          {SUGGESTED_GOALS.map((goal) => (
            <button
              key={goal.name}
              onClick={() => handleSuggestedGoal(goal)}
              className="w-full glass-card rounded-xl p-3 flex items-center gap-3 hover:border-violet-500/30 transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-violet-600/20 flex items-center justify-center">
                <Target size={16} className="text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm">{goal.name}</p>
                <p className="text-violet-400 text-xs">{formatCLP(goal.amount)}</p>
              </div>
              <span className="text-violet-400 text-xs">+ Agregar</span>
            </button>
          ))}
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <PiggyBank size={16} className="text-violet-400" />
            Metas activas ({activeGoals.length})
          </h3>
          {activeGoals.map((goal) => {
            const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const coinsToEarn = Math.floor(goal.targetAmount / 1000) + 10;

            return (
              <div key={goal.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold text-sm">{goal.name}</p>
                    <p className="text-slate-500 text-xs">Semana {goal.weekNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{formatCLP(goal.targetAmount)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      <Coins size={10} className="text-yellow-400" />
                      <span className="text-yellow-400 text-xs">+{coinsToEarn} al completar</span>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>{formatCLP(goal.currentAmount)} ahorrado</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full h-3 transition-all relative overflow-hidden"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    >
                      {progress > 20 && (
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">
                    Faltan {formatCLP(Math.max(0, goal.targetAmount - goal.currentAmount))}
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="number"
                    value={addAmounts[goal.id] || ""}
                    onChange={(e) =>
                      setAddAmounts((prev) => ({ ...prev, [goal.id]: e.target.value }))
                    }
                    placeholder="Monto a abonar..."
                    className="flex-1 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => handleAddAmount(goal.id)}
                    className="px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Abonar
                  </button>
                  <button
                    onClick={() => removeSavingsGoal(goal.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={14} className="text-slate-500 hover:text-red-400" />
                  </button>
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[
                    Math.round(goal.targetAmount * 0.25),
                    Math.round(goal.targetAmount * 0.5),
                    goal.targetAmount - goal.currentAmount,
                  ]
                    .filter((v) => v > 0)
                    .map((amt, i) => (
                      <button
                        key={i}
                        onClick={() =>
                          setAddAmounts((prev) => ({ ...prev, [goal.id]: amt.toString() }))
                        }
                        className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg py-1.5 text-xs transition-colors"
                      >
                        {i === 2 ? "Todo" : `${i === 0 ? "25" : "50"}%`}
                        <br />
                        <span className="text-slate-500 text-[10px]">{formatCLP(amt)}</span>
                      </button>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" />
            Metas completadas ({completedGoals.length})
          </h3>
          {completedGoals.map((goal) => (
            <div
              key={goal.id}
              className="glass-card rounded-xl p-3 border border-green-500/20 flex items-center gap-3"
            >
              <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{goal.name}</p>
                <p className="text-green-400 text-xs">{formatCLP(goal.targetAmount)} ✓</p>
              </div>
              <button
                onClick={() => removeSavingsGoal(goal.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={13} className="text-slate-600 hover:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="glass-card rounded-2xl p-4 border border-violet-500/15">
        <h3 className="text-violet-400 text-xs font-bold mb-2 flex items-center gap-2">
          <Sparkles size={14} />
          Tips de ahorro
        </h3>
        <div className="space-y-2">
          {[
            `Con tu sueldo de ${formatCLP(salary)}, ahorrar el ${distribution.savings}% = ${formatCLP(savingsBudget)}/mes.`,
            "Divide el ahorro mensual en metas semanales para mayor control.",
            "Por cada meta cumplida ganas FinCoins que miden tu disciplina financiera.",
            "Aumenta gradualmente tus metas: +5.000 CLP por semana para generar hábito.",
          ].map((tip, i) => (
            <p key={i} className="text-slate-400 text-xs flex gap-2">
              <span className="text-violet-500 flex-shrink-0">•</span>
              {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
