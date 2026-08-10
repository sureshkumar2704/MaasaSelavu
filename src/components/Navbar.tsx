import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowLeftRight, 
  PieChart, 
  Users, 
  PlusCircle, 
  RotateCcw,
  Search,
  Wallet
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    setIsAddExpenseModalOpen, 
    resetToDemoData 
  } = useExpense();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settlements', label: 'Who Owes Whom', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'members', label: 'Roommates', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 text-slate-950 font-bold">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  MaasaSelavu
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Room & Personal
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Shared Room Expenses • Personal Spending • One Clear Picture
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search expenses, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/60 border border-slate-700/60 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsAddExpenseModalOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition duration-150 transform hover:scale-[1.02] text-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            <button
              onClick={resetToDemoData}
              title="Reset Demo Data"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800 rounded-xl transition duration-150 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
