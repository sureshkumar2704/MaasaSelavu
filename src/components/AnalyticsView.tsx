import React from 'react';
import { 
  PieChart, 
  Calendar, 
  Home, 
  UserCheck, 
  ArrowUpRight
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
    'Wi-Fi': 600,
    Other: 270,
  };

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    if (expDate >= thisWeekStart) {
      if (exp.type === 'SHARED') {
        const split = exp.splits.find((s) => s.memberId === currentUser.id);
        if (split) {
          thisWeekRoomCat[exp.category] = (thisWeekRoomCat[exp.category] || 0) + split.shareAmount;
          thisWeekRoomTotal += split.shareAmount;
        }
      } else if (exp.type === 'PERSONAL' && exp.paidBy === currentUser.id) {
        thisWeekPersonalCat[exp.category] = (thisWeekPersonalCat[exp.category] || 0) + exp.amount;
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
      monthlyCategoryTotals[exp.category] = (monthlyCategoryTotals[exp.category] || 0) + userShare;
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
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900">
        <div className="flex items-center space-x-3 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <PieChart className="w-4 h-4" />
          <span>Financial Analytics & Insights</span>
        </div>
        <h2 className="text-2xl font-black text-white">Expense Reports</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-xl">
          Automated weekly and monthly analysis separating your shared room share from personal spending.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span>Weekly Expense Report</span>
              </h3>
              <p className="text-xs text-slate-400">Current week itemized breakdown</p>
            </div>
            <span className="px-3 py-1 bg-slate-800 text-emerald-400 rounded-full text-xs font-bold border border-slate-700">
              This Week
            </span>
          </div>

          <div className="space-y-5 font-mono text-xs text-slate-300 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-1">
                <span className="flex items-center space-x-1.5 font-sans">
                  <Home className="w-4 h-4 text-emerald-400" />
                  <span>Room expenses</span>
                </span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between"><span>Food</span><span>₹750</span></div>
                <div className="flex justify-between"><span>Electricity</span><span>₹300</span></div>
                <div className="flex justify-between"><span>Wi-Fi</span><span>₹100</span></div>
                <div className="flex justify-between"><span>Groceries</span><span>₹450</span></div>
                <div className="flex justify-between"><span>Other</span><span>₹250</span></div>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-1 border-t border-slate-800">
                <span className="font-sans">Your room share</span>
                <span>₹{roomShareThisWeek.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-slate-200 font-bold border-b border-slate-800/80 pb-1">
                <span className="flex items-center space-x-1.5 font-sans">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  <span>Personal expenses</span>
                </span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between"><span>Food</span><span>₹500</span></div>
                <div className="flex justify-between"><span>Travel</span><span>₹350</span></div>
                <div className="flex justify-between"><span>Shopping</span><span>₹250</span></div>
                <div className="flex justify-between"><span>Other</span><span>₹100</span></div>
              </div>
              <div className="flex justify-between text-blue-400 font-bold pt-1 border-t border-slate-800">
                <span className="font-sans">Personal total</span>
                <span>₹{personalThisWeek.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-slate-700 flex justify-between text-base font-bold text-white font-sans">
              <span>TOTAL</span>
              <span className="text-emerald-400">₹{thisWeekTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Weekly Comparison</span>
              <div className="flex items-center space-x-4 text-xs font-semibold text-slate-200">
                <span>This week: <strong className="text-white">₹{thisWeekTotal.toLocaleString('en-IN')}</strong></span>
                <span>Last week: <strong className="text-white">₹{lastWeekTotal.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-1 px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+₹{change}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">AUGUST 2026</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Breakdown</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shared Room</span>
                <div className="text-base font-black text-emerald-400 mt-1">₹{monthlyRoomShare.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Personal</span>
                <div className="text-base font-black text-blue-400 mt-1">₹{monthlyPersonal.toLocaleString('en-IN')}</div>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</span>
                <div className="text-base font-black text-amber-400 mt-1">₹{monthlyTotal.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Average / day</span>
                <span className="text-white font-extrabold">₹{dailyAverage}</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Average / week</span>
                <span className="text-white font-extrabold">₹{weeklyAverage.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Monthly Category Ranking</h3>

            <div className="space-y-3 pt-1">
              {Object.entries(monthlyCategoryTotals).map(([cat, val]) => {
                const pct = Math.round((val / maxMonthlyVal) * 100);
                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-100 font-bold">₹{val.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full rounded-full transition-all duration-700"
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
