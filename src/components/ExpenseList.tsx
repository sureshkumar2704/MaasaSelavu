import React, { useState } from 'react';
import { 
  Receipt, 
  Trash2, 
  Calendar, 
  Tag, 
  Info, 
  Plus,
  Utensils,
  Zap,
  Droplets,
  ShoppingBag,
  Home,
  Car,
  Film,
  Shield,
  HelpCircle,
  Lock,
  Globe,
  AlertTriangle
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { Category, Expense, ExpenseType } from '../types';

export const ExpenseList: React.FC = () => {
  const { 
    expenses, 
    members, 
    deleteExpense, 
    searchQuery, 
    setIsAddExpenseModalOpen,
    currentUser
  } = useExpense();

  const [typeFilter, setTypeFilter] = useState<'ALL' | ExpenseType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const categoriesList: Category[] = [
    'Food',
    'Electricity',
    'Water',
    'Groceries',
    'Cleaning',
    'Shopping',
    'Travel',
    'Entertainment',
    'Rent',
    'Other',
  ];

  const categoryIcons: Record<string, any> = {
    Food: Utensils,
    Electricity: Zap,
    Water: Droplets,
    Groceries: ShoppingBag,
    Cleaning: Home,
    Shopping: Tag,
    Travel: Car,
    Entertainment: Film,
    Rent: Shield,
    Other: HelpCircle,
  };

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
      <div className="glass-card rounded-3xl p-6 border border-slate-800/80 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Receipt className="w-5 h-5" />
              </div>
              <span>Expense History ({filtered.length})</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Showing Shared room bills & your personal expenses ({currentUser.name})
            </p>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 cursor-pointer shrink-0 transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Expense</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          
          <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-extrabold">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                typeFilter === 'ALL' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All My View
            </button>
            <button
              onClick={() => setTypeFilter('SHARED')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                typeFilter === 'SHARED' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shared Room</span>
            </button>
            <button
              onClick={() => setTypeFilter('PERSONAL')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                typeFilter === 'PERSONAL' ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Personal</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="ALL">All Categories ({categoriesList.length})</option>
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
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-3 shadow-xl">
          <Info className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-black text-slate-300">No expenses found matching filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Try adjusting your search query or click "Add New Expense" to record a transaction.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((exp) => {
            const payer = members.find((m) => m.id === exp.paidBy);
            const userSplit = exp.splits.find((s) => s.memberId === currentUser.id);
            const CatIcon = categoryIcons[exp.category] || Tag;

            return (
              <div
                key={exp.id}
                className="glass-card glass-card-hover rounded-3xl p-5 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3.5 rounded-2xl shrink-0 ${
                      exp.type === 'SHARED'
                        ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-md'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md'
                    }`}
                  >
                    <CatIcon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="text-base font-black text-slate-100">{exp.category}</h4>
                      {exp.type === 'SHARED' ? (
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                          <Globe className="w-3 h-3 text-indigo-400" />
                          <span>Visible to All Roommates</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <Lock className="w-3 h-3 text-emerald-400" />
                          <span>My Personal (Only You)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 flex-wrap gap-y-1 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-mono">{exp.date}</span>
                      </span>
                      <span>•</span>
                      <span>Paid by <strong className="text-slate-200 font-bold">{payer?.name || 'Roommate'}</strong></span>
                    </div>

                    {exp.description && (
                      <p className="text-xs text-slate-400 italic pt-0.5 font-medium">
                        "{exp.description}"
                      </p>
                    )}
                    {exp.lineItems?.length ? (
                      <p className="text-[11px] text-indigo-300 font-medium">{exp.lineItems.map((item) => `${item.name} · ${item.category} ₹${item.amount.toLocaleString('en-IN')}`).join('  •  ')}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-xl font-black text-white font-mono">
                      ₹{exp.amount.toLocaleString('en-IN')}
                    </div>
                    {exp.type === 'SHARED' ? (
                      <div className="text-xs text-slate-400 font-medium">
                        Your share: <span className="font-black text-emerald-400 font-mono">₹{userSplit?.shareAmount || 0}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-400 font-extrabold">100% Personal</div>
                    )}
                  </div>

                  {exp.paidBy === currentUser.id && <button
                    onClick={() => setExpenseToDelete(exp)}
                    title="Delete expense"
                    className="p-2.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {expenseToDelete && (
        <div onClick={() => setExpenseToDelete(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div onClick={(event) => event.stopPropagation()} role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-3xl border border-rose-500/30 bg-slate-900 p-5 sm:p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-400 flex items-center justify-center"><AlertTriangle className="w-6 h-6" /></div>
            <h3 className="mt-4 text-lg font-black text-white">Delete transaction?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Delete <strong className="text-slate-200">{expenseToDelete.title}</strong> for <strong className="text-slate-200">₹{expenseToDelete.amount.toLocaleString('en-IN')}</strong>? This action cannot be undone.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button onClick={() => setExpenseToDelete(null)} className="order-2 sm:order-1 py-3 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold">Cancel</button>
              <button onClick={() => { deleteExpense(expenseToDelete.id); setExpenseToDelete(null); }} className="order-1 sm:order-2 py-3 rounded-xl bg-rose-500 text-white text-xs font-black">Delete transaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
