import React from 'react';
import { Menu, Search, PlusCircle, Wallet, Sparkles } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { 
    activeTab, 
    searchQuery, 
    setSearchQuery, 
    setIsAddExpenseModalOpen,
    expenses 
  } = useExpense();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Room financial summary & expense balance' },
    expenses: { title: 'Expense History', subtitle: 'Ordered chronological room & personal transactions' },
    settlements: { title: 'Who Owes Whom', subtitle: 'Smart debt calculation & instant settlements' },
    analytics: { title: 'Analytics & Reports', subtitle: 'Automated weekly & monthly spend breakdown' },
    members: { title: 'Room Members', subtitle: 'Manage roommates & custom split profiles' },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-2xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Hamburger Toggle & Page Title */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="p-2.5 text-emerald-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all duration-200 shadow-md cursor-pointer flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="hidden xs:flex p-2 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 rounded-xl text-slate-950 font-bold shrink-0 shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
                  {currentTabInfo.title}
                </h1>
                <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow"></span>
                  <span>{expenses.length} Records</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Search & Quick Add */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block w-48 lg:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
            <kbd className="absolute right-3 top-2.5 hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </div>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-extrabold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add Expense</span>
            <Sparkles className="w-3 h-3 text-slate-950 hidden sm:inline-block opacity-75" />
          </button>
        </div>

      </div>
    </header>
  );
};

