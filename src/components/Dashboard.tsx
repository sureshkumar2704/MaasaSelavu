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
  ShoppingBag, 
  Car, 
  Plus, 
  ChevronRight,
  Film,
  Sparkles,
  ShoppingBasket,
  Droplets,
  Calendar
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
    Water: Droplets,
    Groceries: ShoppingBag,
    Shopping: ShoppingBasket,
    Travel: Car,
    Cleaning: Home,
    Entertainment: Film,
  };

  const categoriesList: Category[] = [
    'Food',
    'Electricity',
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
      
      {/* Top Greeting & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-3xl p-6 border border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-emerald-950/20 to-slate-900/90 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Financial Ledger</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">{currentUser.name.split(' ')[0]}</span> 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl font-medium">
            Track your personal spending alongside your <strong className="text-slate-200">1/{members.length}th room share</strong> with automatic debt calculation.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 3 Core Highlight Metric Cards - Side by Side Grid on Mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        
        {/* 1. Cash Physically Paid */}
        <div className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-blue-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-blue-950/25 flex flex-col justify-between space-y-2 sm:space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-blue-500/20 truncate">
              Cash Paid
            </span>
            <div className="p-1.5 sm:p-2.5 bg-blue-500/15 text-blue-400 rounded-xl sm:rounded-2xl border border-blue-500/30 shadow-md shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-sm xs:text-base sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-mono truncate">
              ₹{totalCashPaid.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 hidden sm:block">
              Physical cash/UPI sent directly from your bank
            </p>
          </div>
        </div>

        {/* 2. Actual Spend Burden */}
        <div className="glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-emerald-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-emerald-950/25 flex flex-col justify-between space-y-2 sm:space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-500/20 truncate">
              Your Expense
            </span>
            <div className="p-1.5 sm:p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl sm:rounded-2xl border border-emerald-500/30 shadow-md shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div>
            <div className="text-sm xs:text-base sm:text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight font-mono truncate">
              ₹{currentUserBurden.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 hidden sm:block">
              Personal expenses + your calculated room share
            </p>
          </div>
        </div>

        {/* 3. Net Recoverable / Roommate Balance */}
        <div className={`glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-3 sm:p-6 border flex flex-col justify-between space-y-2 sm:space-y-4 shadow-xl ${currentUserRecoverable >= 0 ? 'border-teal-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-teal-950/25' : 'border-rose-500/30 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-rose-950/25'}`}>
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border truncate ${currentUserRecoverable >= 0 ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'}`}>
              Room Balance
            </span>
            <div className={`p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl border shadow-md shrink-0 ${currentUserRecoverable >= 0 ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : 'bg-rose-500/15 text-rose-400 border-rose-500/30'}`}>
              {currentUserRecoverable >= 0 ? <ArrowDownLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />}
            </div>
          </div>
          <div>
            <div className={`text-sm xs:text-base sm:text-3xl lg:text-4xl font-black tracking-tight font-mono truncate ${currentUserRecoverable >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              {currentUserRecoverable >= 0 ? `+₹${currentUserRecoverable.toLocaleString('en-IN')}` : `-₹${Math.abs(currentUserRecoverable).toLocaleString('en-IN')}`}
            </div>
            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-1 hidden sm:block">
              {currentUserRecoverable >= 0 
                ? 'Net money roommates owe you for shared bills' 
                : 'Net balance you owe to your roommates'}
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Weekly/Monthly Overview & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly & Monthly Summary Table */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 space-y-5 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Weekly & Monthly Overview</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Shared room share vs personal spending breakdown</p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer transition"
            >
              <span>Full Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Expense Type</th>
                  <th className="py-3 px-3 text-right">This Week</th>
                  <th className="py-3 px-3 text-right">This Month</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-3 font-bold text-indigo-300 flex items-center space-x-2.5">
                    <div className="p-1.5 bg-indigo-500/15 rounded-lg border border-indigo-500/30 text-indigo-400">
                      <Home className="w-4 h-4" />
                    </div>
                    <span>🏠 Room Share (1/{members.length})</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-200 font-mono">
                    ₹{thisWeekRoomShare.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-200 font-mono">
                    ₹{thisMonthRoomShare.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 px-3 font-bold text-cyan-300 flex items-center space-x-2.5">
                    <div className="p-1.5 bg-cyan-500/15 rounded-lg border border-cyan-500/30 text-cyan-400">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <span>👤 Personal Expenses</span>
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-200 font-mono">
                    ₹{thisWeekPersonal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 text-right font-black text-slate-200 font-mono">
                    ₹{thisMonthPersonal.toLocaleString('en-IN')}
                  </td>
                </tr>

                <tr className="bg-slate-900/80 font-black rounded-2xl">
                  <td className="py-4 px-3 text-white flex items-center space-x-2.5">
                    <div className="p-1.5 bg-amber-500/15 rounded-lg border border-amber-500/30 text-amber-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <span>💰 Total Spending</span>
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-400 font-black font-mono text-base">
                    ₹{thisWeekTotal.toLocaleString('en-IN')}
                  </td>
                  <td className="py-4 px-3 text-right text-emerald-400 font-black font-mono text-base">
                    ₹{thisMonthTotal.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Category Breakdown */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 space-y-4 border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-lg font-black text-white">Category Spending</h3>
              <p className="text-xs text-slate-400 font-medium">Itemized spend ratio across categories</p>
            </div>
          </div>

          <div className="space-y-3.5">
            {categoriesList.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const percentage = Math.min(100, Math.round((amount / maxCategorySpend) * 100));
              const Icon = categoryIcons[cat] || ShoppingBag;

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300 flex items-center space-x-2">
                      <div className="p-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-emerald-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{cat}</span>
                    </span>
                    <span className="text-slate-100 font-black font-mono">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800/80 p-0.5">
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
      <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div>
            <h3 className="text-lg font-black text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400 font-medium">Latest shared and personal expenses</p>
          </div>
          <button
            onClick={() => setActiveTab('expenses')}
            className="text-xs font-extrabold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer transition"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 border border-slate-800 rounded-2xl font-medium">
            No expenses logged yet. Click "Add Expense" to record your first bill or personal purchase.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {expenses.slice(0, 5).map((exp) => {
              const payerMember = members.find((m) => m.id === exp.paidBy);
              const userSplit = exp.splits.find((s) => s.memberId === currentUser.id);

              return (
                <div key={exp.id} className="py-3.5 flex items-center justify-between hover:bg-slate-800/30 px-3 rounded-2xl transition-all">
                  <div className="flex items-center space-x-3.5">
                    <div className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${exp.type === 'SHARED' ? 'badge-shared' : 'badge-personal'}`}>
                      {exp.type === 'SHARED' ? 'ROOM' : 'YOU'}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-100">{exp.category}</h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Paid by <strong className="text-slate-300">{payerMember?.name.split(' ')[0]}</strong> • {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs sm:text-base font-black text-white font-mono">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    {exp.type === 'SHARED' && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        Your share: <span className="text-emerald-400 font-black font-mono">₹{userSplit?.shareAmount || 0}</span>
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

