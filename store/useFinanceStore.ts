import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ExpenseCategory = "fijo" | "variable" | "gusto";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  icon?: string;
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDay: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  priority: "alta" | "media" | "baja";
  imageEmoji?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  weekNumber: number;
  year: number;
  completed: boolean;
  completedAt?: string;
}

export interface Distribution {
  fixed: number;
  variable: number;
  savings: number;
}

export interface RewardNotification {
  id: string;
  message: string;
  coins: number;
  timestamp: string;
}

interface FinanceStore {
  // Config
  salary: number;
  distribution: Distribution;
  coins: number;
  currentMonth: number;
  currentYear: number;
  rewardNotifications: RewardNotification[];

  // Data
  expenses: Expense[];
  debts: Debt[];
  wishlistItems: WishlistItem[];
  savingsGoals: SavingsGoal[];

  // Actions - Config
  setSalary: (amount: number) => void;
  setDistribution: (distribution: Distribution) => void;

  // Actions - Expenses
  addExpense: (expense: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;

  // Actions - Debts
  addDebt: (debt: Omit<Debt, "id">) => void;
  removeDebt: (id: string) => void;
  payDebt: (id: string, amount: number) => void;

  // Actions - Wishlist
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  removeWishlistItem: (id: string) => void;
  saveForWishlist: (id: string, amount: number) => void;

  // Actions - Savings Goals
  addSavingsGoal: (goal: Omit<SavingsGoal, "id" | "completed">) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  removeSavingsGoal: (id: string) => void;

  // Actions - Rewards
  addCoins: (amount: number, reason: string) => void;
  clearRewardNotifications: () => void;
}

const MOTIVATIONAL_PHRASES = [
  "¡Increíble! Cada peso ahorrado es un paso hacia tu libertad financiera. ¡Sigue así!",
  "¡Lo lograste! Tu disciplina financiera de hoy construye el futuro que mereces.",
  "¡Fantástico! Eres más fuerte que cualquier tentación de gasto. ¡Orgullo total!",
  "¡Excelente trabajo! El camino a la estabilidad financiera se construye con pequeños logros como este.",
  "¡Eres imparable! Tu constancia en el ahorro es admirable. ¡Sigue avanzando!",
  "¡Meta cumplida! Recuerda: los pequeños ahorros de hoy son las grandes inversiones de mañana.",
  "¡Brillante! Tu versión futura te agradecerá por cada esfuerzo que haces hoy.",
  "¡Campeón del ahorro! Esta semana demostraste que el control financiero es posible.",
];

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      salary: 750000,
      distribution: { fixed: 50, variable: 30, savings: 20 },
      coins: 0,
      currentMonth: new Date().getMonth(),
      currentYear: new Date().getFullYear(),
      rewardNotifications: [],
      expenses: [],
      debts: [
        {
          id: "debt-initial",
          name: "Tarjeta de Crédito",
          totalAmount: 250000,
          remainingAmount: 250000,
          interestRate: 2.5,
          minimumPayment: 25000,
          dueDay: 15,
        },
      ],
      wishlistItems: [],
      savingsGoals: [],

      setSalary: (amount) => set({ salary: amount }),
      setDistribution: (distribution) => set({ distribution }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: `exp-${Date.now()}` },
          ],
        })),

      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addDebt: (debt) =>
        set((state) => ({
          debts: [...state.debts, { ...debt, id: `debt-${Date.now()}` }],
        })),

      removeDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        })),

      payDebt: (id, amount) =>
        set((state) => ({
          debts: state.debts.map((d) =>
            d.id === id
              ? {
                  ...d,
                  remainingAmount: Math.max(0, d.remainingAmount - amount),
                }
              : d
          ),
        })),

      addWishlistItem: (item) =>
        set((state) => ({
          wishlistItems: [
            ...state.wishlistItems,
            { ...item, id: `wish-${Date.now()}` },
          ],
        })),

      removeWishlistItem: (id) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((w) => w.id !== id),
        })),

      saveForWishlist: (id, amount) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.map((w) =>
            w.id === id
              ? {
                  ...w,
                  savedAmount: Math.min(
                    w.targetAmount,
                    w.savedAmount + amount
                  ),
                }
              : w
          ),
        })),

      addSavingsGoal: (goal) =>
        set((state) => ({
          savingsGoals: [
            ...state.savingsGoals,
            { ...goal, id: `goal-${Date.now()}`, completed: false },
          ],
        })),

      updateSavingsGoal: (id, amount) => {
        const state = get();
        const goal = state.savingsGoals.find((g) => g.id === id);
        if (!goal) return;

        const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
        const isNowComplete = newAmount >= goal.targetAmount && !goal.completed;

        if (isNowComplete) {
          const phrase =
            MOTIVATIONAL_PHRASES[
              Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)
            ];
          const coinsEarned = Math.floor(goal.targetAmount / 1000) + 10;
          const notification: RewardNotification = {
            id: `notif-${Date.now()}`,
            message: phrase,
            coins: coinsEarned,
            timestamp: new Date().toISOString(),
          };
          set((s) => ({
            savingsGoals: s.savingsGoals.map((g) =>
              g.id === id
                ? {
                    ...g,
                    currentAmount: newAmount,
                    completed: true,
                    completedAt: new Date().toISOString(),
                  }
                : g
            ),
            coins: s.coins + coinsEarned,
            rewardNotifications: [notification, ...s.rewardNotifications].slice(0, 10),
          }));
        } else {
          set((s) => ({
            savingsGoals: s.savingsGoals.map((g) =>
              g.id === id ? { ...g, currentAmount: newAmount } : g
            ),
          }));
        }
      },

      removeSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        })),

      addCoins: (amount, reason) => {
        const phrase =
          MOTIVATIONAL_PHRASES[
            Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)
          ];
        const notification: RewardNotification = {
          id: `notif-${Date.now()}`,
          message: `${reason} - ${phrase}`,
          coins: amount,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          coins: state.coins + amount,
          rewardNotifications: [notification, ...state.rewardNotifications].slice(0, 10),
        }));
      },

      clearRewardNotifications: () => set({ rewardNotifications: [] }),
    }),
    {
      name: "finance-storage",
    }
  )
);

// Helpers
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getCurrentMonthExpenses(expenses: Expense[]): Expense[] {
  const now = new Date();
  return expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

export function getDebtAdvice(debts: Debt[]): string {
  if (debts.length === 0) return "¡Sin deudas! Eres un ejemplo a seguir.";
  const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const highInterest = [...debts].sort((a, b) => b.interestRate - a.interestRate)[0];
  const smallestDebt = [...debts].sort((a, b) => a.remainingAmount - b.remainingAmount)[0];

  if (highInterest.interestRate > 1.5) {
    return `Método Avalancha recomendado: Prioriza pagar "${highInterest.name}" (${highInterest.interestRate}% mensual). Pagas menos intereses a largo plazo.`;
  }
  return `Método Bola de Nieve: Elimina primero "${smallestDebt.name}" (${formatCLP(smallestDebt.remainingAmount)}). Te dará motivación para seguir.`;
}

export function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7);
}
