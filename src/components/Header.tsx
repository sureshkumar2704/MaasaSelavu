import React from 'react';
import { Menu, Search, PlusCircle } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery, 
    setIsAddExpenseModalOpen 
  } = useExpense();

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    expenses: 'Expense History',
    settlements: 'Who Owes Whom',
    analytics: 'Analytics & Reports',
    members: 'Room Members',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSidebar}
            aria-label="Toggle menu"
            className="lg:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {tabTitles[activeTab] || 'Dashboard'}
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Track actual cash paid out vs true room share
            </p>
          </div>
        </div>

        {/* Right: Search & Quick Add */}
        <div className="flex items-center space-x-3">
          {/* Search Input */}
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Add Expense</span>
          </button>
        </div>

      </div>
    </header>
  );
};
