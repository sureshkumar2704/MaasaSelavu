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
      
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{currentUser.name.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Here is your financial summary separating personal spending from your 1/4th room share.
          </p>
        </div>

        <button
          onClick={() => setIsAddExpenseModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* 3 Core Highlight Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        
        {/* 1. Cash Physically Paid */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 border border-blue-500/20 bg-gradient-to-b from-slate-900/90 to-blue-950/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">1. Cash Paid Out</span>
            <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/30">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white tracking-tight">
              ₹{totalCashPaid.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Total physical cash/UPI sent from your bank
            </p>
          </div>
        </div>

        {/* 2. Actual Spend Burden */}
        <div className="glass-card glass-card-hover rounded-2xl p-5 sm:p-6 border border-emerald-500/20 bg-gradient-to-b from-slate-900/90 to-emerald-950/20 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">2. Your Actual Expense</span>
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400 tracking-tight">
              ₹{currentUserBurden.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Personal spending + your 1/4th room share
            </p>
          </div>
        </div>

        {/* 3. Net Recoverable / Roommate Balance */}
        <div className={`glass-card glass-card-hover rounded-2xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 ${currentUserRecoverable >= 0 ? 'border-teal-500/20 bg-gradient-to-b from-slate-900/90 to-teal-950/20' : 'border-rose-500/20 bg-gradient-to-b from-slate-900/90 to-rose-950/20'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">3. Net Room Balance</span>
            <div className={`p-2.5 rounded-xl border ${currentUserRecoverable >= 0 ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'}`}>
              {currentUserRecoverable >= 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
            </div>
          </div>
          <div>
            <div className={`text-3xl font-black tracking-tight ${currentUserRecoverable >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {currentUserRecoverable >= 0 ? `+₹${currentUserRecoverable.toLocaleString('en-IN')}` : `-₹${Math.abs(currentUserRecoverable).toLocaleString('en-IN')}`}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {currentUserRecoverable >= 0 
                ? 'Money roommates owe you for shared bills' 
                : 'Net amount you owe your roommates'}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Weekly/Monthly Overview & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly & Monthly Summary Table */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 sm:p-6 space-y-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Weekly & Monthly Overview</h3>
              <p className="text-xs text-slate-400">Shared room share vs personal spending</p>
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
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">This Week</th>
                  <th className="py-2.5 px-3 text-right">This Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-indigo-300 flex items-center space-x-2">
                    <Home className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>🏠 Your room share</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    ₹{thisWeekRoomShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    ₹{thisMonthRoomShare.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-semibold text-cyan-300 flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>👤 Personal expenses</span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    ₹{thisWeekPersonal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-200">
                    ₹{thisMonthPersonal.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-slate-900/60 font-bold">
                  <td className="py-3.5 px-3 text-white flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>💰 Total spending</span>
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-400 font-black">
                    ₹{thisWeekTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right text-emerald-400 font-black">
                    ₹{thisMonthTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Breakdown */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Category Spending</h3>
              <p className="text-xs text-slate-400">Total share per category</p>
            </div>
          </div>

          <div className="space-y-3">
            {categoriesList.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const percentage = Math.min(100, Math.round((amount / maxCategorySpend) * 100));
              const Icon = categoryIcons[cat] || ShoppingBag;

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300 flex items-center space-x-2">
                      <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{cat}</span>
                    </span>
                    <span className="text-slate-100 font-bold">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
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
      <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
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
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
            No expenses logged yet. Click "Add Expense" to record your first bill or personal purchase.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {expenses.slice(0, 5).map((exp) => {
              const payerMember = members.find((m) => m.id === exp.paidBy);
              const userSplit = exp.splits.find((s) => s.memberId === currentUser.id);

              return (
                <div key={exp.id} className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold ${exp.type === 'SHARED' ? 'badge-shared' : 'badge-personal'}`}>
                      {exp.type === 'SHARED' ? 'ROOM' : 'YOU'}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100">{exp.category}</h4>
                      <p className="text-[11px] text-slate-400">
                        Paid by {payerMember?.name.split(' ')[0]} • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-black text-white">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    {exp.type === 'SHARED' && (
                      <div className="text-[11px] text-slate-400">
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
