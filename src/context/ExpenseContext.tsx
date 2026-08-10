import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Member, Expense, Settlement, MemberBalance, DebtTransaction } from '../types';
import { DEFAULT_MEMBERS, DEFAULT_EXPENSES, DEFAULT_SETTLEMENTS } from '../utils/sampleData';
import { calculateBalancesAndDebts } from '../utils/settlement';

interface ExpenseContextType {
  members: Member[];
  expenses: Expense[];
  settlements: Settlement[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteExpense: (id: string) => void;
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void;
  addMember: (name: string) => void;
  updateMember: (member: Member) => void;
  resetToDemoData: () => void;
  balances: MemberBalance[];
  debts: DebtTransaction[];
  totalCashPaid: number;
  currentUserBurden: number;
  currentUserRecoverable: number;
  isAddExpenseModalOpen: boolean;
  setIsAddExpenseModalOpen: (open: boolean) => void;
}

const STORAGE_KEYS = {
  MEMBERS: 'maasaselavu_members_v1',
  EXPENSES: 'maasaselavu_expenses_v1',
  SETTLEMENTS: 'maasaselavu_settlements_v1',
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
  });

  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTLEMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_SETTLEMENTS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTLEMENTS, JSON.stringify(settlements));
  }, [settlements]);

  const { balances, debts, totalCashPaidByCurrentUser, currentUserBurden, currentUserRecoverable } =
    calculateBalancesAndDebts(members, expenses, settlements);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExp: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addSettlement = (settlementData: Omit<Settlement, 'id'>) => {
    const newSettlement: Settlement = {
      ...settlementData,
      id: `settle-${Date.now()}`,
    };
    setSettlements((prev) => [newSettlement, ...prev]);
  };

  const addMember = (name: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-rose-500 text-white',
      'bg-amber-500 text-white',
      'bg-teal-500 text-white',
      'bg-indigo-500 text-white',
    ];
    const color = colors[members.length % colors.length];
    const newMember: Member = {
      id: `mem-${Date.now()}`,
      name,
      avatar: color,
      isCurrentUser: false,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const updateMember = (updated: Member) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const resetToDemoData = () => {
    setMembers(DEFAULT_MEMBERS);
    setExpenses(DEFAULT_EXPENSES);
    setSettlements(DEFAULT_SETTLEMENTS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.SETTLEMENTS);
  };

  return (
    <ExpenseContext.Provider
      value={{
        members,
        expenses,
        settlements,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        addExpense,
        deleteExpense,
        addSettlement,
        addMember,
        updateMember,
        resetToDemoData,
        balances,
        debts,
        totalCashPaid: totalCashPaidByCurrentUser,
        currentUserBurden,
        currentUserRecoverable,
        isAddExpenseModalOpen,
        setIsAddExpenseModalOpen,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpense must be used within ExpenseProvider');
  return context;
};
