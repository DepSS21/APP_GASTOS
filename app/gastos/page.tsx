"use client";
import { useState } from "react";
import {
  useFinanceStore,
  formatCLP,
  getCurrentMonthExpenses,
  type ExpenseCategory,
} from "@/store/useFinanceStore";
import { Plus, Trash2, Receipt, Filter } from "lucide-react";

const CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; color: string; bg: string; icon: string }
> = {
  fijo: { label: "Gasto Fijo", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: "🏠" },
  variable: { label: "Variable", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: "🎯" },
  gusto: { label: "Gusto", color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20", icon: "✨" },
};

const EXPENSE_ICONS = ["🛒", "🍕", "🚌", "💊", "📱", "☕", "🎬", "👕", "🏋️", "⛽", "🎮", "🍺", "✈️", "📚", "🎁"];

export default function GastosPage() {
  const { expenses, salary, distribution, addExpense, removeExpense } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | ExpenseCategory>("all");

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("variable");
  const [selectedIcon, setSelectedIcon] = useState("🛒");

  const monthlyExpenses = getCurrentMonthExpenses(expenses);
  const filtered = filter === "all" ? monthlyExpenses : monthlyExpenses.filter((e) => e.category === filter);

  const totalMonth = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  const fixedTotal = monthlyExpenses.filter((e) => e.category === "fijo").reduce((s, e) => s + e.amount, 0);
  const variableTotal = monthlyExpenses.filter((e) => e.category !== "fijo").reduce((s, e) => s + e.amount, 0);

  const fixedBudget = Math.round(salary * (distribution.fixed / 100));
  const variableBudget = Math.round(salary * (distribution.variable / 100));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseInt(amount.replace(/\D/g, ""));
    if (!name.trim() || !amt) return;
    addExpense({
      name: name.trim(),
      amount: amt,
      category,
      date: new Date().toISOString(),
      icon: selectedIcon,
    });
    setName("");
    setAmount("");
    setCategory("variable");
    setSelectedIcon("🛒");
    setShowForm(false);
  }

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, exp) => {
    const dateKey = new Date(exp.date).toLocaleDateString("es-CL", {
      weekday: "long", day: "numeric", month: "long"
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(exp);
    return acc;
  }, {});

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Este mes</p>
          <h1 className="text-2xl font-bold text-white">Gastos</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-slate-400 text-[10px] mb-1">Total gastado</p>
          <p className="text-white font-bold text-sm">{formatCLP(totalMonth)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center bg-blue-500/10 border border-blue-500/20">
          <p className="text-blue-400 text-[10px] mb-1">Fijos</p>
          <p className="text-white font-bold text-sm">{formatCLP(fixedTotal)}</p>
          <p className="text-blue-400 text-[10px]">de {formatCLP(fixedBudget)}</p>
        </div>
        <div className="rounded-2xl p-3 text-center bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-emerald-400 text-[10px] mb-1">Variables</p>
          <p className="text-white font-bold text-sm">{formatCLP(variableTotal)}</p>
          <p className="text-emerald-400 text-[10px]">de {formatCLP(variableBudget)}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-4 animate-slide-up space-y-3"
        >
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Receipt size={16} className="text-violet-400" />
            Nuevo gasto
          </h3>

          {/* Icon picker */}
          <div>
            <label className="text-slate-400 text-xs mb-2 block">Ícono</label>
            <div className="flex flex-wrap gap-2">
              {EXPENSE_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`text-xl w-9 h-9 rounded-xl transition-colors ${
                    selectedIcon === icon
                      ? "bg-violet-600 border border-violet-400"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Descripción</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Arriendo, supermercado..."
              className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Monto (CLP)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-[#0f172a] text-white focus:outline-none focus:border-violet-500"
              >
                <option value="fijo">🏠 Gasto Fijo</option>
                <option value="variable">🎯 Variable</option>
                <option value="gusto">✨ Gusto</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border border-white/10 text-slate-400 rounded-xl py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
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

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "fijo", "variable", "gusto"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              filter === f
                ? "bg-violet-600 text-white"
                : "bg-white/5 text-slate-400 hover:bg-white/10"
            }`}
          >
            {f === "all" ? "Todos" : CATEGORY_CONFIG[f].icon + " " + CATEGORY_CONFIG[f].label}
          </button>
        ))}
      </div>

      {/* Expense list grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🧾</div>
          <p className="text-slate-400 text-sm">Sin gastos registrados</p>
          <p className="text-slate-500 text-xs mt-1">Toca el + para agregar uno</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => {
              const dateA = new Date(filtered.find(e =>
                new Date(e.date).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }) === a
              )?.date || "").getTime();
              const dateB = new Date(filtered.find(e =>
                new Date(e.date).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" }) === b
              )?.date || "").getTime();
              return dateB - dateA;
            })
            .map(([date, exps]) => (
              <div key={date}>
                <p className="text-slate-500 text-xs capitalize mb-2 px-1">{date}</p>
                <div className="space-y-2">
                  {exps.map((exp) => {
                    const cfg = CATEGORY_CONFIG[exp.category];
                    return (
                      <div
                        key={exp.id}
                        className="glass-card rounded-xl p-3 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
                          {exp.icon || cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{exp.name}</p>
                          <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold text-sm">{formatCLP(exp.amount)}</p>
                          <button
                            onClick={() => removeExpense(exp.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 size={14} className="text-slate-500 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
