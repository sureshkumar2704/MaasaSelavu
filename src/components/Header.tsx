import React from 'react';
import { Menu, Search, PlusCircle, Wallet, Sparkles, UserCheck, KeyRound, RefreshCw, Bell, Check } from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';
import { RoomSelector } from './RoomSelector';

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
    expenses,
    currentUser,
    setIsProfileModalOpen,
    refreshData, notifications, unreadNotificationCount, markNotificationRead
  } = useExpense();

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Room financial summary & expense balance' },
    expenses: { title: 'Expense History', subtitle: 'Ordered chronological room & personal transactions' },
    settlements: { title: 'Who Owes Whom', subtitle: 'Smart debt calculation & instant settlements' },
    analytics: { title: 'Analytics & Reports', subtitle: 'Automated weekly & monthly spend breakdown' },
    members: { title: 'Room Members', subtitle: 'Manage roommates & custom split profiles' },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;
  const [showNotifications, setShowNotifications] = React.useState(false);

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

        {/* Right: User Login Profile Badge + Search & Quick Add */}
        <div className="flex items-center space-x-3">
          <RoomSelector />
          <button onClick={refreshData} title="Refresh room updates" aria-label="Refresh room updates" className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 transition cursor-pointer"><RefreshCw className="w-4 h-4" /></button>
          <div className="relative"><button onClick={() => setShowNotifications((value) => !value)} title="Notifications" aria-label="Notifications" className="relative p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer"><Bell className="w-4 h-4" />{unreadNotificationCount > 0 && <span className="absolute -right-1 -top-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{unreadNotificationCount}</span>}</button>{showNotifications && <><button onClick={() => setShowNotifications(false)} className="fixed inset-0 z-40" aria-label="Close notifications"/><div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4 space-y-3"><div className="flex justify-between"><p className="text-xs font-black text-white">Notifications</p><span className="text-[10px] text-slate-500">{unreadNotificationCount} unread</span></div>{notifications.length === 0 ? <p className="text-xs text-slate-400 py-3">You’re all caught up.</p> : notifications.map((notification) => <div key={notification.id} className={`p-3 rounded-xl border ${notification.read ? 'border-slate-800 bg-slate-950/50' : 'border-amber-500/25 bg-amber-500/5'}`}><p className="text-xs leading-5 text-slate-300">{notification.message}</p>{!notification.read && <button onClick={() => markNotificationRead(notification.id)} className="mt-2 inline-flex items-center gap-1 text-[10px] font-black text-emerald-400"><Check className="w-3 h-3"/> Mark as read</button>}</div>)}</div></>}</div>
          
          {/* Active Logged In Roommate Badge */}
          <button
            onClick={() => setIsProfileModalOpen(true)}
            title="View and edit your profile"
            className="flex items-center space-x-2 p-1.5 pr-3 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs transition cursor-pointer"
          >
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] ${currentUser.avatar}`}>
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[11px] font-bold text-white leading-tight flex items-center space-x-1">
                <span>{currentUser.name}</span>
                <UserCheck className="w-3 h-3 text-emerald-400" />
              </div>
            </div>
            <KeyRound className="w-3.5 h-3.5 text-emerald-400 hidden xs:block" />
          </button>

          <div className="relative hidden lg:block w-48 xl:w-56">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
            />
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
