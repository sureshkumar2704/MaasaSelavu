import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  User, 
  Calculator, 
  Check, 
  AlertCircle,
  Utensils,
  Zap,
  Droplets,
  ShoppingBag,
  Home,
  Car,
  Film,
  Shield,
  Tag,
  HelpCircle,
  Plus,
  Lock,
  Globe
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import type { Category, ExpenseType, ExpenseSplit, ExpenseLineItem } from '../types';

export const AddExpenseModal: React.FC = () => {
  const { 
    members, 
    addExpense, 
    isAddExpenseModalOpen, 
    setIsAddExpenseModalOpen,
    currentUser
  } = useExpense();

  const [type, setType] = useState<ExpenseType>('SHARED');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Groceries');
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isCustomSplit, setIsCustomSplit] = useState(false);
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [entryMode, setEntryMode] = useState<'quick' | 'itemized'>('quick');
  const [lineItems, setLineItems] = useState<ExpenseLineItem[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(members.map((member) => member.id));

  useEffect(() => {
    if (currentUser?.id) {
      setPaidBy(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    setSelectedMemberIds((ids) => {
      const memberIds = members.map((member) => member.id);
      return [...ids.filter((id) => memberIds.includes(id)), ...memberIds.filter((id) => !ids.includes(id))];
    });
  }, [members]);

  if (!isAddExpenseModalOpen) return null;

  const categoryOptions: { name: Category; icon: any; color: string }[] = [
    { name: 'Food', icon: Utensils, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { name: 'Electricity', icon: Zap, color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' },
    { name: 'Water', icon: Droplets, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { name: 'Groceries', icon: ShoppingBag, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { name: 'Cleaning', icon: Home, color: 'text-teal-400 border-teal-500/30 bg-teal-500/10' },
    { name: 'Shopping', icon: Tag, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { name: 'Travel', icon: Car, color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' },
    { name: 'Entertainment', icon: Film, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
    { name: 'Rent', icon: Shield, color: 'text-red-400 border-red-500/30 bg-red-500/10' },
    { name: 'Other', icon: HelpCircle, color: 'text-slate-400 border-slate-700 bg-slate-800/50' },
  ];

  const numAmount = entryMode === 'itemized' ? lineItems.reduce((sum, item) => sum + item.amount, 0) : (parseFloat(amount) || 0);
  const selectedMembers = members.filter((member) => selectedMemberIds.includes(member.id));
  const equalShare = selectedMembers.length > 0 ? Math.round(numAmount / selectedMembers.length) : 0;

  const handleQuickAddAmount = (addVal: number) => {
    const currentVal = parseFloat(amount) || 0;
    setAmount((currentVal + addVal).toString());
  };

  const addLineItem = () => setLineItems((items) => [...items, { id: `item-${Date.now()}-${items.length}`, name: '', amount: 0, category: 'Groceries' }]);
  const updateLineItem = (id: string, patch: Partial<ExpenseLineItem>) => setLineItems((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || (type === 'SHARED' && selectedMembers.length === 0) || (entryMode === 'itemized' && lineItems.some((item) => !item.name.trim() || item.amount <= 0))) return;

    let splits: ExpenseSplit[] = [];

    if (type === 'SHARED') {
      if (isCustomSplit) {
        splits = selectedMembers.map((m) => ({
          memberId: m.id,
          shareAmount: parseFloat(customShares[m.id]) || 0,
        }));
      } else {
        splits = selectedMembers.map((m) => ({
          memberId: m.id,
          shareAmount: equalShare,
        }));
      }
    }

    addExpense({
      title: entryMode === 'itemized' ? 'Itemized bill' : category,
      amount: numAmount,
      type,
      category: entryMode === 'itemized' ? (lineItems[0]?.category || 'Other') : category,
      paidBy: type === 'PERSONAL' ? currentUser.id : paidBy,
      date,
      description,
      splits,
      lineItems: entryMode === 'itemized' ? lineItems : undefined,
    });

    setAmount('');
    setDescription('');
    setLineItems([]);
    setEntryMode('quick');
    setIsAddExpenseModalOpen(false);
  };

  const selectedPayer = members.find((m) => m.id === paidBy);
  const toggleMember = (memberId: string) => setSelectedMemberIds((ids) => ids.includes(memberId) ? ids.filter((id) => id !== memberId) : [...ids, memberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-modal rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <span>Log New Expense</span>
            </h3>
            <p className="text-xs text-slate-400">Record shared room bills or personal purchases</p>
          </div>
          <button
            onClick={() => setIsAddExpenseModalOpen(false)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pt-4 bg-slate-900/40">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button type="button" onClick={() => setEntryMode('quick')} className={`py-2.5 rounded-lg text-xs font-black ${entryMode === 'quick' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Quick expense</button>
            <button type="button" onClick={() => { setEntryMode('itemized'); if (!lineItems.length) addLineItem(); }} className={`py-2.5 rounded-lg text-xs font-black ${entryMode === 'itemized' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Itemized bill</button>
          </div>
        </div>

        {/* Expense Type Switcher Tabs */}
        <div className="px-6 pt-4 bg-slate-900/40 space-y-2">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('SHARED')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                type === 'SHARED'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Shared Room Bill</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('PERSONAL');
                setPaidBy(currentUser.id);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                type === 'PERSONAL'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Expense</span>
            </button>
          </div>

          {/* Visibility Banner */}
          {type === 'SHARED' ? (
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Shared Expense:</strong> Will be visible to all 4 roommates when they log in.</span>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Personal Expense:</strong> Visible ONLY to you ({currentUser.name}).</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Visual Category Picker Grid */}
          {entryMode === 'quick' && <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              Select Category *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categoryOptions.map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setCategory(item.name)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/50 scale-[1.03]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold truncate max-w-full">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>}

          {entryMode === 'itemized' && <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black text-indigo-200">Bill items</p><p className="text-[11px] text-slate-400">Add each item with its own category.</p></div><button type="button" onClick={addLineItem} className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-xs font-black">+ Add item</button></div>
            {lineItems.map((item) => <div key={item.id} className="grid grid-cols-1 sm:grid-cols-[1fr_7rem_8rem_auto] gap-2 items-center"><input required value={item.name} onChange={(e) => updateLineItem(item.id, { name: e.target.value })} placeholder="Item name" className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"/><input required min="0.01" step="any" type="number" value={item.amount || ''} onChange={(e) => updateLineItem(item.id, { amount: parseFloat(e.target.value) || 0 })} onWheel={(e) => e.currentTarget.blur()} placeholder="₹ Amount" className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white"/><select value={item.category} onChange={(e) => updateLineItem(item.id, { category: e.target.value as Category })} className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white">{categoryOptions.map((option) => <option key={option.name} value={option.name}>{option.name}</option>)}</select><button type="button" onClick={() => setLineItems((items) => items.filter((line) => line.id !== item.id))} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg">×</button></div>)}
            <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20"><span className="text-xs font-bold text-slate-300">Gross total</span><span className="text-lg font-black font-mono text-emerald-400">₹{numAmount.toLocaleString('en-IN')}</span></div>
          </div>}

          {/* Amount & Quick Chips */}
          {entryMode === 'quick' && <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Amount (₹) *
              </label>
              <span className="text-[11px] text-slate-500 font-mono">INR ₹</span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-3 text-lg font-black text-emerald-400">₹</span>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-full pl-9 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xl font-black tracking-tight"
              />
            </div>

            {/* Quick Amount Preset Chips */}
            <div className="flex items-center space-x-1.5 pt-1 overflow-x-auto">
              <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Quick Add:</span>
              {[50, 100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleQuickAddAmount(preset)}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-[11px] font-bold text-slate-300 hover:text-white transition flex items-center space-x-0.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-3 h-3 text-emerald-400" />
                  <span>₹{preset}</span>
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 text-[10px] font-bold text-rose-400 hover:bg-rose-500/10 rounded-lg transition shrink-0 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>}

          {/* Paid By & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Paid By
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                disabled={type === 'PERSONAL'}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-bold disabled:opacity-60"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name} {m.id === currentUser.id && '(You - Logged In)'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-bold"
              />
            </div>
          </div>

          {/* Shared Split Strategy (If SHARED) */}
          {type === 'SHARED' && (
            <div className="p-4 bg-slate-900/80 border border-indigo-500/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calculator className="w-4 h-4 text-indigo-400" />
                  <span>Split Calculation ({members.length} Roommates)</span>
                </span>
                <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isCustomSplit}
                    onChange={(e) => setIsCustomSplit(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span>Custom Split</span>
                </label>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between"><span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Split with</span><button type="button" onClick={() => setSelectedMemberIds(selectedMembers.length === members.length ? [] : members.map((member) => member.id))} className="text-[10px] font-bold text-indigo-300">{selectedMembers.length === members.length ? 'Clear all' : 'Select all'}</button></div>
                <div className="grid grid-cols-2 gap-2">
                  {members.map((member) => <label key={member.id} className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${selectedMemberIds.includes(member.id) ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}><input type="checkbox" checked={selectedMemberIds.includes(member.id)} onChange={() => toggleMember(member.id)} className="accent-indigo-500"/><span className="truncate">{member.name}</span></label>)}
                </div>
                {selectedMembers.length === 0 && <p className="text-[11px] text-rose-400">Select at least one roommate to split this bill.</p>}
              </div>

              {!isCustomSplit ? (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
                  <p className="font-bold">Equally divided among {members.length} roommates</p>
                  <p className="text-indigo-400 font-mono">
                    ₹{numAmount} ÷ {members.length} = <span className="font-extrabold text-white">₹{equalShare} / person</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold">{m.name}</span>
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1.5 text-slate-500 font-bold">₹</span>
                        <input
                          type="number"
                          placeholder={equalShare.toString()}
                          value={customShares[m.id] || ''}
                          onChange={(e) =>
                            setCustomShares({ ...customShares, [m.id]: e.target.value })
                          }
                          onWheel={(e) => e.currentTarget.blur()}
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
                    <div className="text-emerald-400 flex items-center space-x-1.5 font-bold">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        You paid ₹{numAmount}. Your share: ₹{equalShare}. Roommates owe you ₹{numAmount - equalShare}.
                      </span>
                    </div>
                  ) : (
                    <div className="text-amber-400 flex items-center space-x-1.5 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Paid by {selectedPayer?.name.split(' ')[0]}. Your share: ₹{equalShare}.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Swiggy order, Monthly Wi-Fi recharge..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs font-medium"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddExpenseModalOpen(false)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20 cursor-pointer transform hover:scale-105 active:scale-95"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
