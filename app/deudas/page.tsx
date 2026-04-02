"use client";
import { useState } from "react";
import {
  useFinanceStore,
  formatCLP,
  getDebtAdvice,
} from "@/store/useFinanceStore";
import {
  Plus,
  Trash2,
  CreditCard,
  Lightbulb,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function DeudasPage() {
  const { debts, addDebt, removeDebt, payDebt, salary, distribution } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("2.5");
  const [minimumPayment, setMinimumPayment] = useState("");
  const [dueDay, setDueDay] = useState("15");

  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0);
  const savingsBudget = Math.round(salary * (distribution.savings / 100));
  const advice = getDebtAdvice(debts);

  // Avalanche order (highest interest first)
  const sortedAvalanche = [...debts].sort((a, b) => b.interestRate - a.interestRate);
  // Snowball order (smallest balance first)
  const sortedSnowball = [...debts].sort((a, b) => a.remainingAmount - b.remainingAmount);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const total = parseInt(totalAmount.replace(/\D/g, ""));
    const min = parseInt(minimumPayment.replace(/\D/g, ""));
    if (!name.trim() || !total) return;
    addDebt({
      name: name.trim(),
      totalAmount: total,
      remainingAmount: total,
      interestRate: parseFloat(interestRate),
      minimumPayment: min || Math.round(total * 0.1),
      dueDay: parseInt(dueDay),
    });
    setName("");
    setTotalAmount("");
    setInterestRate("2.5");
    setMinimumPayment("");
    setDueDay("15");
    setShowForm(false);
  }

  function handlePay(id: string) {
    const amt = parseInt((payAmounts[id] || "0").replace(/\D/g, ""));
    if (amt <= 0) return;
    payDebt(id, amt);
    setPayAmounts((prev) => ({ ...prev, [id]: "" }));
  }

  function estimateMonthsToPayoff(remaining: number, monthly: number, rate: number): string {
    if (monthly <= 0) return "—";
    if (rate === 0) {
      const months = Math.ceil(remaining / monthly);
      return `~${months} mes${months !== 1 ? "es" : ""}`;
    }
    const r = rate / 100;
    if (monthly <= remaining * r) return "⚠️ Pago insuficiente";
    const months = Math.ceil(
      Math.log(monthly / (monthly - remaining * r)) / Math.log(1 + r)
    );
    return `~${months} mes${months !== 1 ? "es" : ""}`;
  }

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">Control de</p>
          <h1 className="text-2xl font-bold text-white">Deudas</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </div>

      {/* Total debt card */}
      {totalDebt > 0 && (
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-red-600/50 to-rose-800/50 border border-red-500/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-red-200 text-sm mb-1">Deuda total</p>
              <p className="text-3xl font-bold text-white">{formatCLP(totalDebt)}</p>
              <p className="text-red-300 text-xs mt-1">
                Asignado para pago: {formatCLP(savingsBudget)}/mes
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <TrendingDown size={24} className="text-red-400" />
            </div>
          </div>
          {savingsBudget > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-red-200 mb-1">
                <span>Progreso estimado por mes</span>
                <span>{Math.round((savingsBudget / totalDebt) * 100)}%</span>
              </div>
              <div className="bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${Math.min(100, (savingsBudget / totalDebt) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Advice box */}
      {debts.length > 0 && (
        <div className="glass-card rounded-2xl p-4 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Lightbulb size={16} className="text-amber-400" />
            </div>
            <div>
              <p className="text-amber-400 text-xs font-semibold mb-1">Consejo financiero</p>
              <p className="text-white/80 text-sm leading-relaxed">{advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Strategy comparison */}
      {debts.length >= 2 && (
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Estrategias de pago</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <p className="text-blue-400 text-xs font-bold mb-1">🏔️ Avalancha</p>
              <p className="text-slate-300 text-xs mb-2">Menor interés total</p>
              {sortedAvalanche.slice(0, 2).map((d, i) => (
                <p key={d.id} className="text-white text-xs">
                  {i + 1}. {d.name} ({d.interestRate}%)
                </p>
              ))}
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-emerald-400 text-xs font-bold mb-1">⛄ Bola de Nieve</p>
              <p className="text-slate-300 text-xs mb-2">Mayor motivación</p>
              {sortedSnowball.slice(0, 2).map((d, i) => (
                <p key={d.id} className="text-white text-xs">
                  {i + 1}. {d.name} ({formatCLP(d.remainingAmount)})
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-4 animate-slide-up space-y-3"
        >
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <CreditCard size={16} className="text-violet-400" />
            Nueva deuda
          </h3>

          <div>
            <label className="text-slate-400 text-xs mb-1 block">Nombre de la deuda</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Tarjeta Falabella, Préstamo..."
              className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Monto total (CLP)</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Tasa mensual (%)</label>
              <input
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="2.5"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Pago mínimo (CLP)</label>
              <input
                type="number"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                placeholder="0"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Día de vencimiento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="15"
                className="w-full rounded-xl px-3 py-2.5 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
              />
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

      {/* Debt list */}
      {debts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-slate-400 text-sm">¡Sin deudas registradas!</p>
          <p className="text-slate-500 text-xs mt-1">Eso es excelente. Si tienes una, agrégala arriba.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {debts.map((debt) => {
            const progress = Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100);
            const isExpanded = expandedId === debt.id;
            const isPaidOff = debt.remainingAmount === 0;
            const monthsToPayoff = estimateMonthsToPayoff(
              debt.remainingAmount,
              debt.minimumPayment,
              debt.interestRate
            );

            return (
              <div
                key={debt.id}
                className={`glass-card rounded-2xl overflow-hidden border ${
                  isPaidOff ? "border-green-500/30" : "border-red-500/15"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : debt.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isPaidOff ? "bg-green-500/20" : "bg-red-500/20"
                    }`}
                  >
                    <CreditCard
                      size={20}
                      className={isPaidOff ? "text-green-400" : "text-red-400"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold text-sm truncate">{debt.name}</p>
                      <p
                        className={`font-bold text-sm ml-2 ${
                          isPaidOff ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {isPaidOff ? "✓ Pagado" : formatCLP(debt.remainingAmount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div
                          className={`rounded-full h-1.5 transition-all ${
                            isPaidOff ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">{progress}%</span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-slate-500 text-[10px]">Total original</p>
                        <p className="text-white text-xs font-semibold">{formatCLP(debt.totalAmount)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 text-[10px]">Tasa mensual</p>
                        <p className="text-amber-400 text-xs font-semibold">{debt.interestRate}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-500 text-[10px]">Vence día</p>
                        <p className="text-white text-xs font-semibold flex items-center justify-center gap-1">
                          <Calendar size={10} />
                          {debt.dueDay}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-slate-400 text-xs mb-0.5">Tiempo estimado para liquidar</p>
                      <p className="text-white font-semibold text-sm">{monthsToPayoff}</p>
                      <p className="text-slate-500 text-xs">pagando {formatCLP(debt.minimumPayment)}/mes</p>
                    </div>

                    {!isPaidOff && (
                      <div>
                        <label className="text-slate-400 text-xs mb-1 block">Registrar abono (CLP)</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={payAmounts[debt.id] || ""}
                            onChange={(e) =>
                              setPayAmounts((prev) => ({
                                ...prev,
                                [debt.id]: e.target.value,
                              }))
                            }
                            placeholder={formatCLP(debt.minimumPayment)}
                            className="flex-1 rounded-xl px-3 py-2 text-sm border border-white/10 bg-white/5 text-white focus:outline-none focus:border-violet-500"
                          />
                          <button
                            onClick={() => handlePay(debt.id)}
                            className="px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
                          >
                            Pagar
                          </button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {[debt.minimumPayment, Math.round(debt.minimumPayment * 1.5), Math.round(debt.minimumPayment * 2)].map(
                            (amt) => (
                              <button
                                key={amt}
                                onClick={() =>
                                  setPayAmounts((prev) => ({
                                    ...prev,
                                    [debt.id]: amt.toString(),
                                  }))
                                }
                                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg py-1.5 text-xs transition-colors"
                              >
                                {formatCLP(amt)}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => removeDebt(debt.id)}
                      className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 text-xs py-2 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={14} />
                      Eliminar deuda
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
