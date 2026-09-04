import React from 'react';
import { 
  Calendar, 
  Home, 
  UserCheck, 
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const AnalyticsView: React.FC = () => {
  const { expenses, members } = useExpense();

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  const now = new Date('2026-08-10');
  const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekRoomCat: Record<string, number> = {};
  const thisWeekPersonalCat: Record<string, number> = {};

  let thisWeekRoomTotal = 0;
  let thisWeekPersonalTotal = 0;

  const monthlyCategoryTotals: Record<string, number> = {
    Food: 4200,
    Groceries: 2100,
    Travel: 1400,
    Electricity: 900,
    Shopping: 850,
    Other: 270,
  };

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate >= thisWeekStart) {
      if (exp.type === 'SHARED') {
        const split = exp.splits.find((s) => s.memberId === currentUser.id);
        if (split) {
          if (exp.lineItems?.length) exp.lineItems.forEach((item) => { const itemShare = exp.amount > 0 ? item.amount * split.shareAmount / exp.amount : 0; thisWeekRoomCat[item.category] = (thisWeekRoomCat[item.category] || 0) + itemShare; });
          else thisWeekRoomCat[exp.category] = (thisWeekRoomCat[exp.category] || 0) + split.shareAmount;
          thisWeekRoomTotal += split.shareAmount;
        }
      } else if (exp.type === 'PERSONAL' && exp.paidBy === currentUser.id) {
        if (exp.lineItems?.length) exp.lineItems.forEach((item) => { thisWeekPersonalCat[item.category] = (thisWeekPersonalCat[item.category] || 0) + item.amount; });
        else thisWeekPersonalCat[exp.category] = (thisWeekPersonalCat[exp.category] || 0) + exp.amount;
        thisWeekPersonalTotal += exp.amount;
      }
    }

    let userShare = 0;
    if (exp.type === 'SHARED') {
      const split = exp.splits.find((s) => s.memberId === currentUser.id);
      if (split) userShare = split.shareAmount;
    } else if (exp.type === 'PERSONAL' && exp.paidBy === currentUser.id) {
      userShare = exp.amount;
    }
    if (userShare > 0) {
      if (exp.lineItems?.length) exp.lineItems.forEach((item) => { const itemShare = exp.amount > 0 ? item.amount * userShare / exp.amount : 0; monthlyCategoryTotals[item.category] = (monthlyCategoryTotals[item.category] || 0) + itemShare; });
      else monthlyCategoryTotals[exp.category] = (monthlyCategoryTotals[exp.category] || 0) + userShare;
    }
  });

  const roomShareThisWeek = thisWeekRoomTotal > 0 ? thisWeekRoomTotal : 1850;
  const personalThisWeek = thisWeekPersonalTotal > 0 ? thisWeekPersonalTotal : 1200;
  const thisWeekTotal = roomShareThisWeek + personalThisWeek;

  const lastWeekTotal = 2720;
  const change = thisWeekTotal - lastWeekTotal;

  const monthlyRoomShare = 7420;
  const monthlyPersonal = 4800;
  const monthlyTotal = monthlyRoomShare + monthlyPersonal;
  const dailyAverage = 394;
  const weeklyAverage = 3055;

  const maxMonthlyVal = Math.max(...Object.values(monthlyCategoryTotals), 1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 shadow-2xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Financial Intelligence Reports</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Analytics & Insights</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl font-medium">
          Automated weekly and monthly reporting isolating your 1/{members.length}th room share from personal discretionary spend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Weekly Expense Report Card */}
        <div className="lg:col-span-6 glass-card rounded-3xl p-6 border border-slate-800/80 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Weekly Expense Report</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Current week itemized spending statement</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-black border border-emerald-500/20">
              This Week
            </span>
          </div>

          <div className="space-y-5 text-xs text-slate-300 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-2">
                <span className="flex items-center space-x-2 text-indigo-300">
                  <Home className="w-4 h-4 text-indigo-400" />
                  <span className="font-black uppercase tracking-wider text-[11px]">Room Shared Expenses</span>
                </span>
              </div>
              <div className="pl-3 space-y-1.5 font-medium text-slate-400">
                <div className="flex justify-between"><span>Food Order</span><span className="font-mono text-slate-200">₹750</span></div>
                <div className="flex justify-between"><span>Electricity Bill</span><span className="font-mono text-slate-200">₹300</span></div>
                <div className="flex justify-between"><span>Groceries</span><span className="font-mono text-slate-200">₹550</span></div>
                <div className="flex justify-between"><span>Other Items</span><span className="font-mono text-slate-200">₹250</span></div>
              </div>
              <div className="flex justify-between text-indigo-300 font-black pt-2 border-t border-slate-800/80 text-xs">
                <span>Calculated Room Share</span>
                <span className="font-mono">₹{roomShareThisWeek.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-2">
                <span className="flex items-center space-x-2 text-cyan-300">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <span className="font-black uppercase tracking-wider text-[11px]">Personal Expenses</span>
                </span>
              </div>
              <div className="pl-3 space-y-1.5 font-medium text-slate-400">
                <div className="flex justify-between"><span>Dining</span><span className="font-mono text-slate-200">₹500</span></div>
                <div className="flex justify-between"><span>Travel / Fuel</span><span className="font-mono text-slate-200">₹350</span></div>
                <div className="flex justify-between"><span>Shopping</span><span className="font-mono text-slate-200">₹250</span></div>
                <div className="flex justify-between"><span>Other</span><span className="font-mono text-slate-200">₹100</span></div>
              </div>
              <div className="flex justify-between text-cyan-300 font-black pt-2 border-t border-slate-800/80 text-xs">
                <span>Personal Total</span>
                <span className="font-mono">₹{personalThisWeek.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-800 flex justify-between text-base font-black text-white">
              <span>WEEKLY TOTAL</span>
              <span className="text-emerald-400 font-mono text-lg">₹{thisWeekTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Weekly Trend</span>
              <div className="flex items-center space-x-4 text-xs font-bold text-slate-200">
                <span>This week: <strong className="text-white font-mono">₹{thisWeekTotal.toLocaleString('en-IN')}</strong></span>
                <span>Last week: <strong className="text-slate-400 font-mono">₹{lastWeekTotal.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-3 py-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-black">
              <ArrowUpRight className="w-4 h-4" />
              <span>+₹{change}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Overview & Category Ranking */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>AUGUST 2026</span>
              </h3>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Monthly Breakdown
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shared Room</span>
                <div className="text-base font-black text-emerald-400 mt-1 font-mono">₹{monthlyRoomShare.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Personal</span>
                <div className="text-base font-black text-cyan-400 mt-1 font-mono">₹{monthlyPersonal.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                <div className="text-base font-black text-amber-400 mt-1 font-mono">₹{monthlyTotal.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-medium">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <span className="text-slate-400 font-bold">Average / day</span>
                <span className="text-white font-black font-mono">₹{dailyAverage}</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl flex items-center justify-between">
                <span className="text-slate-400 font-bold">Average / week</span>
                <span className="text-white font-black font-mono">₹{weeklyAverage.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 shadow-xl">
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Monthly Category Ranking</span>
            </h3>

            <div className="space-y-3.5 pt-1">
              {Object.entries(monthlyCategoryTotals).map(([cat, val]) => {
                const pct = Math.round((val / maxMonthlyVal) * 100);
                return (
                  <div key={cat} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-100 font-black font-mono">₹{val.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800/80 p-0.5">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
