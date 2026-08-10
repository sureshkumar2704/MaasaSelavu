import React, { useState } from 'react';
import { X, Users, User, Calculator, Check, AlertCircle } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { Category, ExpenseType, ExpenseSplit } from '../types';

export const AddExpenseModal: React.FC = () => {
  const { 
    members, 
    addExpense, 
    isAddExpenseModalOpen, 
    setIsAddExpenseModalOpen 
  } = useExpense();

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  const [type, setType] = useState<ExpenseType>('SHARED');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Groceries');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  if (!isAddExpenseModalOpen) return null;

  const categories: Category[] = [
    'Food',
    'Electricity',
    'Wi-Fi',
    'Water',
    'Groceries',
    'Cleaning',
    'Shopping',
    'Travel',
    'Entertainment',
    'Rent',
    'Other',
  ];

  const numAmount = parseFloat(amount) || 0;
  const equalShare = members.length > 0 ? Math.round(numAmount / members.length) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    let splits: ExpenseSplit[] = [];

    if (type === 'SHARED') {
      if (isCustomSplit) {
        splits = members.map((m) => ({
          memberId: m.id,
          shareAmount: parseFloat(customShares[m.id]) || 0,
        }));
      } else {
        splits = members.map((m) => ({
          memberId: m.id,
          shareAmount: equalShare,
        }));
      }
    }

    addExpense({
      title: category, // Title defaults directly to Category!
      amount: numAmount,
      type,
      category,
      paidBy,
      date,
      description,
      splits,
    });

    setAmount('');
    setDescription('');
    setIsAddExpenseModalOpen(false);
  };

  const selectedPayer = members.find((m) => m.id === paidBy);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-lg font-bold text-white">Log Expense</h3>
            <p className="text-xs text-slate-400">Select category and amount to record expense</p>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expense Type Switcher Tabs */}
        <div className="px-6 pt-4 bg-slate-900/40">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('SHARED')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                type === 'SHARED'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared Room Expense</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('PERSONAL');
                setPaidBy(currentUser.id);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                type === 'PERSONAL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Expense</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Category & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-bold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 2400"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-bold"
              />
            </div>
          </div>

          {/* Paid By & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                disabled={type === 'PERSONAL'}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm disabled:opacity-60"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
              />
            </div>
          </div>

          {/* Shared Split Strategy (If SHARED) */}
          {type === 'SHARED' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>Split Strategy ({members.length} Roommates)</span>
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCustomSplit}
                    onChange={(e) => setIsCustomSplit(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Custom Split</span>
                </label>
              </div>

              {!isCustomSplit ? (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                  <p className="font-semibold">Equally divided among {members.length} roommates</p>
                  <p className="text-indigo-400">
                    ₹{numAmount} ÷ {members.length} = <span className="font-bold text-white">₹{equalShare} / person</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">{m.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-slate-500">₹</span>
                        <input
                          type="number"
                          placeholder={equalShare.toString()}
                          value={customShares[m.id] || ''}
                          onChange={(e) =>
                            setCustomShares({ ...customShares, [m.id]: e.target.value })
                          }
                          className="w-full pl-6 pr-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 text-xs text-right font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {numAmount > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-xs space-y-1">
                  {paidBy === currentUser.id ? (
                    <div className="text-emerald-400 flex items-center space-x-1.5 font-medium">
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        You paid ₹{numAmount}. Your share is ₹{equalShare}. Others owe you ₹{numAmount - equalShare}.
                      </span>
                    </div>
                  ) : (
                    <div className="text-amber-400 flex items-center space-x-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        Paid by {selectedPayer?.name.split(' ')[0]}. Your room share is ₹{equalShare}.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Add optional note or item details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
