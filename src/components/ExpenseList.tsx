import React, { useState } from 'react';
import { 
  Receipt, 
  Users, 
  User, 
  Trash2, 
  Calendar, 
  Tag, 
  Info, 
  Plus
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { Category, ExpenseType } from '../types';

export const ExpenseList: React.FC = () => {
  const { 
    expenses, 
    members, 
    deleteExpense, 
    searchQuery, 
    setIsAddExpenseModalOpen 
  } = useExpense();

  const [typeFilter, setTypeFilter] = useState<'ALL' | ExpenseType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const currentUser = members.find((m) => m.isCurrentUser) || members[0];

  const categoriesList: Category[] = [
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

  // Strictly order expenses by date descending, then createdAt descending
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filtered = sortedExpenses.filter((exp) => {
    if (typeFilter !== 'ALL' && exp.type !== typeFilter) return false;
    if (selectedCategory !== 'ALL' && exp.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const catMatch = exp.category.toLowerCase().includes(q);
      const titleMatch = exp.title.toLowerCase().includes(q);
      const descMatch = exp.description?.toLowerCase().includes(q);
      return catMatch || titleMatch || descMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Controls */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <span>Ordered Expense History ({filtered.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Chronologically ordered shared room and personal transactions</p>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center space-x-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Expense</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          
          <div className="flex items-center space-x-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('SHARED')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                typeFilter === 'SHARED' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Shared Room</span>
            </button>
            <button
              onClick={() => setTypeFilter('PERSONAL')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                typeFilter === 'PERSONAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-3">
          <Info className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No expenses recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Add New Expense" above to record your first room shared bill or personal spending.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp) => {
            const payer = members.find((m) => m.id === exp.paidBy);
            const userSplit = exp.splits.find((s) => s.memberId === currentUser.id);

            return (
              <div
                key={exp.id}
                className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`p-3 rounded-2xl shrink-0 ${
                      exp.type === 'SHARED'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {exp.type === 'SHARED' ? <Users className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-base font-extrabold text-slate-100">{exp.category}</h4>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
                          exp.type === 'SHARED'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {exp.type === 'SHARED' ? 'Room Shared' : 'Personal'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-slate-400 flex-wrap gap-y-1">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{exp.date}</span>
                      </span>
                      <span>•</span>
                      <span>Paid by <strong className="text-slate-200">{payer?.name}</strong></span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-400 pt-0.5 italic">
                        "{exp.description}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-lg font-black text-white">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    {exp.type === 'SHARED' ? (
                      <div className="text-xs text-slate-400">
                        Your share: <span className="font-bold text-emerald-400">₹{userSplit?.shareAmount || 0}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-semibold">100% Personal</div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteExpense(exp.id)}
                    title="Delete expense"
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
