import React from 'react';
import { Menu, Search, PlusCircle, Wallet } from 'lucide-react';
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
    setIsAddExpenseModalOpen 
  } = useExpense();

  const tabTitles: Record<string, string> = {
    dashboard: 'Dashboard Overview',
    expenses: 'Expense History',
    settlements: 'Who Owes Whom',
    analytics: 'Analytics & Reports',
    members: 'Room Members',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: 3-line Hamburger Menu Toggle & Page Title */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar menu"
            title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            className="p-2 text-emerald-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition duration-200 shadow-md cursor-pointer flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="hidden xs:flex p-2 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 rounded-xl text-slate-950 font-bold shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-black text-white tracking-tight">
                {tabTitles[activeTab] || 'Dashboard Overview'}
              </h1>
              <p className="text-xs text-slate-400 font-medium hidden md:block">
                MaasaSelavu • Roommate Shared & Personal Expense Ledger
              </p>
            </div>
          </div>
        </div>

        {/* Right: Search & Quick Add */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:block w-44 lg:w-64">
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
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition transform hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">Add Expense</span>
          </button>
        </div>

      </div>
    </header>
  );
};
