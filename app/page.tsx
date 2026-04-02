"use client";
import { useState } from "react";
import {
  useFinanceStore,
  formatCLP,
  getCurrentMonthExpenses,
} from "@/store/useFinanceStore";
import {
  Coins,
  Settings,
  TrendingDown,
  TrendingUp,
  Wallet,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const {
    salary,
    distribution,
    expenses,
    debts,
    savingsGoals,
    coins,
    setSalary,
    setDistribution,
  } = useFinanceStore();

  const [showConfig, setShowConfig] = useState(false);
  const [newSalary, setNewSalary] = useState(salary.toString());
  const [newFixed, setNewFixed] = useState(distribution.fixed.toString());
  const [newVariable, setNewVariable] = useState(distribution.variable.toString());
  const [newSavings, setNewSavings] = useState(distribution.savings.toString());

  const monthlyExpenses = getCurrentMonthExpenses(expenses);
  const totalSpent = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const activeGoals = savingsGoals.filter((g) => !g.completed);
  const completedGoals = savingsGoals.filter((g) => g.completed);

  const fixedBudget = Math.round(salary * (distribution.fixed / 100));
  const variableBudget = Math.round(salary * (distribution.variable / 100));
  const savingsBudget = Math.round(salary * (distribution.savings / 100));

  const fixedSpent = monthlyExpenses
    .filter((e) => e.category === "fijo")
    .reduce((s, e) => s + e.amount, 0);
  const variableSpent = monthlyExpenses
    .filter((e) => e.category === "variable" || e.category === "gusto")
    .reduce((s, e) => s + e.amount, 0);

  const availableFixed = fixedBudget - fixedSpent;
  const availableVariable = variableBudget - variableSpent;
  const availableSavings = savingsBudget;
  const totalAvailable = salary - totalSpent;

  function saveConfig() {
    const s = parseInt(newSalary.replace(/\D/g, ""));
    const f = parseInt(newFixed);
    const v = parseInt(newVariable);
    const sv = parseInt(newSavings);
    if (s > 0) setSalary(s);
    if (f + v + sv === 100) setDistribution({ fixed: f, variable: v, savings: sv });
    setShowConfig(false);
  }

  const now = new Date();
  const monthName = now.toLocaleString("es-CL", { month: "long" });
  const year = now.getFullYear();

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm capitalize">{monthName} {year}</p>
          <h1 className="text-2xl font-bold gradient-text">Mis Finanzas</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{coins}</span>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Settings size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="glass-card rounded-2xl p-4 animate-slide-up space-y-3">
          <h3 className="text-white font-semibold text-sm">Configuración mensual</h3>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Sueldo mensual (CLP)</label>
            <input
              type="number"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <p className="text-slate-400 text-xs">Distribución (debe sumar 100%)</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Fijos %", val: newFixed, set: setNewFixed },
              { label: "Variables %", val: newVariable, set: setNewVariable },
              { label: "Ahorro %", val: newSavings, set: setNewSavings },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="text-slate-400 text-xs mb-1 block">{label}</label>
                <input
                  type="number"
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            ))}
          </div>
          <button
            onClick={saveConfig}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      )}

      {/* Sueldo Card */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-violet-600/80 to-indigo-700/80 border border-violet-500/30">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-transparent" />
        <div className="relative">
          <p className="text-violet-200 text-sm mb-1">Sueldo del mes</p>
          <p className="text-3xl font-bold text-white mb-3">{formatCLP(salary)}</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${Math.min(100, (totalSpent / salary) * 100)}%` }}
              />
            </div>
            <span className="text-violet-200 text-xs">
              {Math.round((totalSpent / salary) * 100)}% gastado
            </span>
          </div>
          <div className="flex gap-4 mt-3">
            <div>
              <p className="text-violet-300 text-xs">Gastado</p>
              <p className="text-white font-semibold text-sm">{formatCLP(totalSpent)}</p>
            </div>
            <div>
              <p className="text-violet-300 text-xs">Disponible</p>
              <p className={`font-semibold text-sm ${totalAvailable < 0 ? "text-red-300" : "text-green-300"}`}>
                {formatCLP(totalAvailable)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-3 gap-3">
        <BudgetCard
          label="Gastos Fijos"
          icon="🏠"
          budget={fixedBudget}
          spent={fixedSpent}
          available={availableFixed}
          color="blue"
          pct={distribution.fixed}
        />
        <BudgetCard
          label="Variables"
          icon="🎯"
          budget={variableBudget}
          spent={variableSpent}
          available={availableVariable}
          color="emerald"
          pct={distribution.variable}
        />
        <BudgetCard
          label="Ahorro"
          icon="💰"
          budget={savingsBudget}
          spent={0}
          available={availableSavings}
          color="amber"
          pct={distribution.savings}
        />
      </div>

      {/* Deuda Alert */}
      {totalDebt > 0 && (
        <Link href="/deudas">
          <div className="glass-card rounded-2xl p-4 border border-red-500/20 flex items-center gap-3 hover:border-red-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingDown size={20} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Deuda activa</p>
              <p className="text-red-400 font-bold">{formatCLP(totalDebt)}</p>
            </div>
            <ArrowRight size={18} className="text-slate-500" />
          </div>
        </Link>
      )}

      {/* Metas activas */}
      {activeGoals.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <Target size={16} className="text-violet-400" />
              Metas de ahorro activas
            </h3>
            <Link href="/ahorro" className="text-violet-400 text-xs hover:text-violet-300">
              Ver todas →
            </Link>
          </div>
          {activeGoals.slice(0, 2).map((goal) => {
            const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            return (
              <Link href="/ahorro" key={goal.id}>
                <div className="glass-card rounded-xl p-3 flex items-center gap-3 hover:border-violet-500/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-white text-xs font-medium truncate">{goal.name}</p>
                      <p className="text-slate-400 text-xs">{pct}%</p>
                    </div>
                    <div className="bg-white/10 rounded-full h-1.5">
                      <div
                        className="bg-violet-500 rounded-full h-1.5 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-500 text-xs">{formatCLP(goal.currentAmount)}</span>
                      <span className="text-slate-400 text-xs">{formatCLP(goal.targetAmount)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/gastos">
          <div className="glass-card rounded-2xl p-4 hover:border-white/15 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-blue-400" />
              <span className="text-slate-400 text-xs">Gastos este mes</span>
            </div>
            <p className="text-white font-bold text-lg">{monthlyExpenses.length}</p>
            <p className="text-slate-500 text-xs">registros</p>
          </div>
        </Link>
        <Link href="/ahorro">
          <div className="glass-card rounded-2xl p-4 hover:border-white/15 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={16} className="text-green-400" />
              <span className="text-slate-400 text-xs">Metas logradas</span>
            </div>
            <p className="text-white font-bold text-lg">{completedGoals.length}</p>
            <p className="text-slate-500 text-xs">completadas</p>
          </div>
        </Link>
      </div>

      {/* Wallet summary */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={16} className="text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Resumen del mes</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Sueldo total", value: salary, color: "text-white" },
            { label: "Gastos fijos", value: -fixedSpent, color: "text-blue-400" },
            { label: "Gastos variables", value: -variableSpent, color: "text-emerald-400" },
            { label: "Balance neto", value: totalAvailable, color: totalAvailable >= 0 ? "text-green-400" : "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-slate-400 text-sm">{label}</span>
              <span className={`font-semibold text-sm ${color}`}>
                {value < 0 ? `-${formatCLP(Math.abs(value))}` : formatCLP(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BudgetCard({
  label,
  icon,
  budget,
  spent,
  available,
  color,
  pct,
}: {
  label: string;
  icon: string;
  budget: number;
  spent: number;
  available: number;
  color: string;
  pct: number;
}) {
  const spentPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const isOver = available < 0;
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  const bgMap: Record<string, string> = {
    blue: "bg-blue-500/10 border-blue-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/20",
    amber: "bg-amber-500/10 border-amber-500/20",
  };

  return (
    <div className={`rounded-2xl p-3 border ${bgMap[color]}`}>
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-slate-300 text-[10px] leading-tight mb-1">{label}</p>
      <p className="text-white font-bold text-xs">{pct}%</p>
      <div className="bg-white/10 rounded-full h-1 mt-2 mb-1">
        <div
          className={`${isOver ? "bg-red-500" : colorMap[color]} rounded-full h-1 transition-all`}
          style={{ width: `${spentPct}%` }}
        />
      </div>
      <p className={`text-[10px] font-medium ${isOver ? "text-red-400" : "text-slate-300"}`}>
        {formatCLP(Math.abs(available))}
        {isOver ? " excedido" : " libre"}
      </p>
    </div>
  );
}
