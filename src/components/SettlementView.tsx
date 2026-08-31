import React, { useState } from 'react';
import { 
  CheckCircle, 
  Send, 
  Users, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { DebtTransaction } from '../types';

export const SettlementView: React.FC = () => {
  const { 
    members, 
    balances, 
    debts, 
    addSettlement, 
    settlements 
  } = useExpense();

  const [settleTarget, setSettleTarget] = useState<DebtTransaction | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>('');
  const [settleNote, setSettleNote] = useState<string>('');

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  const handleOpenSettleModal = (debt: DebtTransaction) => {
    setSettleTarget(debt);
    setSettleAmount(debt.amount.toString());
    setSettleNote(`Settlement for room expenses`);
  };

  const handleConfirmSettle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleTarget || !settleAmount) return;

    addSettlement({
      fromMemberId: settleTarget.fromMemberId,
      toMemberId: settleTarget.toMemberId,
      amount: parseFloat(settleAmount),
      date: new Date().toISOString().split('T')[0],
      note: settleNote,
    });

    setSettleTarget(null);
    setSettleAmount('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Debt Simplification Ledger</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white">Who Owes Whom?</h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-medium">
          Calculates the minimum necessary transactions required to clear room debts between all roommates without circular transfers.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center space-x-3">
            <span>Recommended Transfers</span>
            <span className="px-3 py-1 text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full shadow-sm">
              {debts.length} Pending
            </span>
          </h3>
        </div>

        {debts.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-slate-800 space-y-3 shadow-xl">
            <CheckCircle className="w-14 h-14 text-emerald-400 mx-auto" />
            <h4 className="text-xl font-black text-white">All Room Expenses Settled!</h4>
            <p className="text-xs text-slate-400 font-medium">No active debts pending. Everyone is completely squared up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {debts.map((debt) => {
              const debtor = members.find((m) => m.id === debt.fromMemberId);
              const creditor = members.find((m) => m.id === debt.toMemberId);
              const isYouDebtor = debt.fromMemberId === currentUser.id;
              const isYouCreditor = debt.toMemberId === currentUser.id;

              return (
                <div
                  key={debt.id}
                  className={`glass-card glass-card-hover rounded-3xl p-6 border relative overflow-hidden flex flex-col justify-between space-y-5 shadow-xl ${
                    isYouDebtor
                      ? 'border-rose-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-rose-950/35 shadow-rose-950/20'
                      : isYouCreditor
                      ? 'border-emerald-500/40 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-emerald-950/35 shadow-emerald-950/20'
                      : 'border-slate-800/80 bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wider ${isYouDebtor ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : isYouCreditor ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {isYouDebtor ? 'YOU OWE' : isYouCreditor ? 'YOU RECEIVE' : 'ROOMMATE DEBT'}
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  {/* Flow Connector Visual */}
                  <div className="flex items-center justify-between bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-md border border-slate-700/60 ${debtor?.avatar}`}>
                        {debtor?.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-extrabold text-slate-100 block">
                          {isYouDebtor ? 'You' : debtor?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Pays</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse-slow" />
                      <span className="text-[9px] font-mono font-bold text-slate-500">₹{debt.amount}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-slate-100 block">
                          {isYouCreditor ? 'You' : creditor?.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Gets</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-md border border-slate-700/60 ${creditor?.avatar}`}>
                        {creditor?.name.substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleOpenSettleModal(debt)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center space-x-2 cursor-pointer transition-all shadow-lg transform hover:scale-105 active:scale-95 ${
                        isYouDebtor
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-slate-950 shadow-rose-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isYouDebtor ? 'Settle Up Now' : 'Record Settlement'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Complete Roommate Balance Table */}
      <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Roommate Balance Ledger</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium">Complete summary of total room payments vs calculated 1/Nth shares</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">Room Member</th>
                <th className="py-3 px-3 text-right">Cash Paid (Shared)</th>
                <th className="py-3 px-3 text-right">Calculated Share</th>
                <th className="py-3 px-3 text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {balances.map((b) => {
                const isPositive = b.netBalance >= 0;
                return (
                  <tr key={b.member.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-3 font-bold text-slate-100 flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${b.member.avatar}`}>
                        {b.member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{b.member.name} {b.member.isCurrentUser && '(You)'}</span>
                    </td>
                    <td className="py-4 px-3 text-right text-slate-300 font-black font-mono">
                      ₹{b.sharedPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-3 text-right text-slate-300 font-black font-mono">
                      ₹{b.sharedShare.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-4 px-3 text-right font-black font-mono text-base ${isPositive ? 'text-teal-400' : 'text-rose-400'}`}>
                      {isPositive ? `+₹${Math.round(b.netBalance).toLocaleString('en-IN')}` : `-₹${Math.abs(Math.round(b.netBalance)).toLocaleString('en-IN')}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {settlements.length > 0 && (
        <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-4 shadow-xl">
          <h3 className="text-lg font-black text-white">Settlement Payment Log</h3>
          <div className="divide-y divide-slate-800/60 text-xs">
            {settlements.map((s) => {
              const fromM = members.find((m) => m.id === s.fromMemberId);
              const toM = members.find((m) => m.id === s.toMemberId);
              return (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-200">{fromM?.name}</span> paid{' '}
                    <span className="font-bold text-slate-200">{toM?.name}</span>
                    {s.note && <p className="text-slate-500 italic mt-0.5">{s.note}</p>}
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-black text-emerald-400">₹{s.amount}</span>
                    <p className="text-slate-500 text-[10px]">{s.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {settlementModal()}
    </div>
  );

  function settlementModal() {
    if (!settleTarget) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
        <div className="glass-modal rounded-3xl w-full max-w-md p-6 border border-slate-700/60 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white">Record Settlement</h3>
            <button
              onClick={() => setSettleTarget(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleConfirmSettle} className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-1.5 text-slate-300">
              <p>
                From: <strong className="text-white font-extrabold">{members.find((m) => m.id === settleTarget.fromMemberId)?.name}</strong>
              </p>
              <p>
                To: <strong className="text-white font-extrabold">{members.find((m) => m.id === settleTarget.toMemberId)?.name}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Settlement Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white font-black text-xl font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Note / Details
              </label>
              <input
                type="text"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSettleTarget(null)}
                className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition transform hover:scale-105"
              >
                Confirm Settlement
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
};

