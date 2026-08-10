import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Home, 
  UserCheck, 
  Utensils, 
  Zap, 
  Wifi, 
  ShoppingBag, 
  Car, 
  Plus, 
  ChevronRight,
  ShieldCheck,
  Film
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { Category } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    expenses, 
    members, 
    totalCashPaid, 
    currentUserBurden, 
    currentUserRecoverable,
    setActiveTab,
    setIsAddExpenseModalOpen
  } = useExpense();

  const now = new Date('2026-08-10');
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  let thisWeekRoomShare = 0;
  let thisWeekPersonal = 0;
  let thisMonthRoomShare = 0;
  let thisMonthPersonal = 0;

  const categoryTotals: Record<string, number> = {};

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    const isThisWeek = expDate >= oneWeekAgo;
    const isThisMonth = expDate >= oneMonthAgo;

    let userShare = 0;
    if (exp.type === 'PERSONAL' && exp.paidBy === currentUser.id) {
      userShare = exp.amount;
      if (isThisWeek) thisWeekPersonal += userShare;
      if (isThisMonth) thisMonthPersonal += userShare;
    } else if (exp.type === 'SHARED') {
      const split = exp.splits.find((s) => s.memberId === currentUser.id);
      if (split) {
        userShare = split.shareAmount;
        if (isThisWeek) thisWeekRoomShare += userShare;
        if (isThisMonth) thisMonthRoomShare += userShare;
      }
    }

    if (userShare > 0) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + userShare;
    }
  });

  const thisWeekTotal = thisWeekRoomShare + thisWeekPersonal;
  const thisMonthTotal = thisMonthRoomShare + thisMonthPersonal;

  const categoryIcons: Record<string, any> = {
    Food: Utensils,
    Electricity: Zap,
    'Wi-Fi': Wifi,
    Groceries: ShoppingBag,
    Shopping: ShoppingBag,
    Travel: Car,
    Cleaning: Home,
    Entertainment: Film,
  };

  const categoriesList: Category[] = [
    'Food',
    'Electricity',
    'Wi-Fi',
    'Groceries',
    'Cleaning',
    'Shopping',
    'Travel',
    'Entertainment',
    'Other',
  ];

  const maxCategorySpend = Math.max(...Object.values(categoryTotals), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Welcome Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/20 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 -top-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Smart Roommate & Personal Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent">{currentUser.name.split(' ')[0]}</span> 👋
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Track actual cash paid out versus your real share of room expenses. Never guess who owes whom at month end.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 text-sm transition transform hover:scale-[1.03] flex items-center space-x-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 1. Cash Physically Paid */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden border border-blue-500/20 bg-gradient-to-b from-slate-900/90 to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">1. Cash Paid Out</span>
            <div className="p-3 bg-blue-500/15 text-blue-400 rounded-2xl border border-blue-500/30">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white tracking-tight">
              ₹{totalCashPaid.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Total physical cash/UPI sent from your bank account
            </p>
          </div>
        </div>

        {/* 2. Actual Spend Burden */}
        <div className="glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-slate-900/90 to-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">2. Your Actual Expense</span>
            <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              ₹{currentUserBurden.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Personal expenses + your 1/4th room share
            </p>
          </div>
        </div>

        {/* 3. Net Recoverable / Roommate Balance */}
        <div className={`glass-card glass-card-hover rounded-3xl p-6 relative overflow-hidden border ${currentUserRecoverable >= 0 ? 'border-teal-500/20 bg-gradient-to-b from-slate-900/90 to-teal-950/20' : 'border-rose-500/20 bg-gradient-to-b from-slate-900/90 to-rose-950/20'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Net Room Balance</span>
            <div className={`p-3 rounded-2xl border ${currentUserRecoverable >= 0 ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'}`}>
              {currentUserRecoverable >= 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-3xl font-black tracking-tight ${currentUserRecoverable >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {currentUserRecoverable >= 0 ? `+₹${currentUserRecoverable.toLocaleString('en-IN')}` : `-₹${Math.abs(currentUserRecoverable).toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentUserRecoverable >= 0 
                ? 'Money roommates owe you for shared payments' 
                : 'Net amount you owe your roommates'}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Weekly/Monthly Overview & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly & Monthly Summary Table */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 space-y-6 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Weekly & Monthly Overview</span>
              </h3>
              <p className="text-xs text-slate-400">Separation between shared room share and personal spending</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">This Week</th>
                  <th className="py-3 px-3 text-right">This Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-3 font-semibold text-indigo-300 flex items-center space-x-2">
                    <Home className="w-4 h-4 text-indigo-400" />
                    <span>🏠 Your room share</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                    ₹{thisWeekRoomShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                    ₹{thisMonthRoomShare.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-3 font-semibold text-cyan-300 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>👤 Personal expenses</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                    ₹{thisWeekPersonal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-200">
                    ₹{thisMonthPersonal.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900 font-bold">
                  <td className="py-4 px-3 text-white flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>💰 Total spending</span>
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-400 text-base font-black">
                    ₹{thisWeekTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-400 text-base font-black">
                    ₹{thisMonthTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-start space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-slate-100">Calculated Expense Share</p>
              <p className="text-slate-400">
                Shared expenses paid by any roommate are automatically divided into 4 equal shares (or custom splits). Your calculated room share is added to your personal spending.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Category Breakdown */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 space-y-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Category Spending</h3>
              <p className="text-xs text-slate-400">Your total share per category</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {categoriesList.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const percentage = Math.min(100, Math.round((amount / maxCategorySpend) * 100));
              const Icon = categoryIcons[cat] || ShoppingBag;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{cat}</span>
                    </span>
                    <span className="text-slate-100 font-bold">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Activity Feed */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest shared and personal expenses</p>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl">
            No expenses logged yet. Click "Log Expense" to add your first transaction.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {expenses.slice(0, 5).map((exp) => {
              const payerMember = members.find((m) => m.id === exp.paidBy);
              const userSplit = exp.splits.find((s) => s.memberId === currentUser.id);

              return (
                <div key={exp.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-2xl transition">
                  <div className="flex items-center space-x-3.5">
                    <div className={`px-3 py-2 rounded-xl text-xs font-extrabold ${exp.type === 'SHARED' ? 'badge-shared' : 'badge-personal'}`}>
                      {exp.type === 'SHARED' ? 'ROOM' : 'YOU'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{exp.category}</h4>
                      <p className="text-xs text-slate-400">
                        Paid by {payerMember?.name.split(' ')[0]} • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-white">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    {exp.type === 'SHARED' && (
                      <div className="text-xs text-slate-400">
                        Your share: <span className="text-emerald-400 font-bold">₹{userSplit?.shareAmount || 0}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
