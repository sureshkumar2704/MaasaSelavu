import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  CheckCircle, 
  Send, 
  Users, 
  ChevronRight,
  X
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
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900">
        <div className="flex items-center space-x-3 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ArrowLeftRight className="w-4 h-4" />
          <span>Smart Debt Simplification Algorithm</span>
        </div>
        <h2 className="text-2xl font-black text-white">Who Owes Whom?</h2>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Calculates the minimum possible transactions required to balance the room ledger between roommates.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Recommended Transfers</span>
            <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              {debts.length} Pending
            </span>
          </h3>
        </div>

        {debts.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">All Room Expenses Settled!</h4>
            <p className="text-xs text-slate-400">No one owes anyone anything right now. Everyone is all squared up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {debts.map((debt) => {
              const debtor = members.find((m) => m.id === debt.fromMemberId);
              const creditor = members.find((m) => m.id === debt.toMemberId);
              const isYouDebtor = debt.fromMemberId === currentUser.id;
              const isYouCreditor = debt.toMemberId === currentUser.id;

              return (
                <div
                  key={debt.id}
                  className={`glass-card glass-card-hover rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between space-y-4 ${
                    isYouDebtor
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : isYouCreditor
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-xl font-bold text-xs ${isYouDebtor ? 'bg-rose-500/20 text-rose-300' : isYouCreditor ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                        {isYouDebtor ? 'YOU OWE' : isYouCreditor ? 'YOU RECEIVE' : 'ROOMMATE'}
                      </div>
                    </div>
                    <div className="text-xl font-black text-white">
                      ₹{debt.amount.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${debtor?.avatar}`}>
                        {debtor?.name.substring(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-slate-200">
                        {isYouDebtor ? 'You' : debtor?.name.split(' ')[0]}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-500 text-xs font-bold space-x-1">
                      <span>owes</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-200">
                        {isYouCreditor ? 'You' : creditor?.name.split(' ')[0]}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${creditor?.avatar}`}>
                        {creditor?.name.substring(0, 2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <button
                      onClick={() => handleOpenSettleModal(debt)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition ${
                        isYouDebtor
                          ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-md shadow-rose-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isYouDebtor ? 'Settle Up' : 'Mark Settled'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>Roommate Balance Ledger</span>
          </h3>
          <p className="text-xs text-slate-400">Complete summary of room payments vs actual 1/4th shares</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
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
                    <td className="py-3.5 px-3 font-semibold text-slate-100 flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${b.member.avatar}`}>
                        {b.member.name.substring(0, 2)}
                      </div>
                      <span>{b.member.name} {b.member.isCurrentUser && '(You)'}</span>
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 font-medium">
                      ₹{b.sharedPaid.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-300 font-medium">
                      ₹{b.sharedShare.toLocaleString('en-IN')}
                    </td>
                    <td className={`py-3.5 px-3 text-right font-black ${isPositive ? 'text-teal-400' : 'text-rose-400'}`}>
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
        <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white">Settlement Payment Log</h3>
          <div className="divide-y divide-slate-800 text-xs">
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
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">₹{s.amount}</span>
                    <p className="text-slate-500">{s.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {settleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-modal rounded-3xl w-full max-w-md p-6 border border-slate-700/60 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record Settlement</h3>
              <button
                onClick={() => setSettleTarget(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSettle} className="space-y-4">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
                <p>
                  From: <strong className="text-white">{members.find((m) => m.id === settleTarget.fromMemberId)?.name}</strong>
                </p>
                <p>
                  To: <strong className="text-white">{members.find((m) => m.id === settleTarget.toMemberId)?.name}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Settlement Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Note / Ref Details
                </label>
                <input
                  type="text"
                  value={settleNote}
                  onChange={(e) => setSettleNote(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleTarget(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
