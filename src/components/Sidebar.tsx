import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowLeftRight, 
  PieChart, 
  Users, 
  PlusCircle, 
  Wallet,
  X,
  Sparkles,
  KeyRound,
  UserCheck
} from 'lucide-react';
import { useExpense } from '../context/ExpenseContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpen }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsAddExpenseModalOpen, 
    members,
    currentUser,
    switchUser,
    setIsLoginModalOpen,
    rooms,
    activeRoom,
    setActiveRoomId
  } = useExpense();

  // Handle Edge Swipe Gesture (Swiping from leftmost edge to open, or swiping left to close)
  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = Math.abs(endY - startY);

      if (deltaY < 80) {
        if (!isOpen && startX < 40 && deltaX > 40) {
          onOpen();
        }
        else if (isOpen && deltaX < -50) {
          onClose();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onOpen, onClose]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settlements', label: 'Who Owes Whom', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'members', label: 'Roommates', icon: Users },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Blurred Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-md transition-all duration-300 animate-fade-in"
        />
      )}

      {/* Edge Swipe Touch Catch Bar */}
      {!isOpen && (
        <div 
          onClick={onOpen}
          title="Slide from left edge to open menu"
          className="fixed top-0 left-0 bottom-0 z-30 w-4 hover:w-6 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all cursor-pointer opacity-0 hover:opacity-100"
        />
      )}

      {/* Sliding Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-950/95 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand Logo */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 rounded-xl shadow-lg shadow-emerald-500/25 text-slate-950 font-bold">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                  MaasaSelavu
                </h1>
                <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Room & Personal</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              title="Close sidebar"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Logged In User Card */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Logged In Account
              </span>
              <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-400">
                <UserCheck className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${currentUser.avatar}`}>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">📱 {currentUser.phone || 'Phone'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsLoginModalOpen(true);
                onClose();
              }}
              className="w-full mt-1 py-1.5 px-3 bg-slate-800/80 hover:bg-slate-800 text-emerald-400 text-[11px] font-bold rounded-xl border border-slate-700/60 flex items-center justify-center space-x-1.5 transition cursor-pointer"
            >
              <KeyRound className="w-3 h-3" />
              <span>Switch / Log In Roommate</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsAddExpenseModalOpen(true);
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center space-x-2 transition transform hover:scale-[1.02] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Expense</span>
          </button>

          <nav className="space-y-1.5 pt-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Menu Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-indigo-500/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <section className="pt-4 border-t border-slate-800">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">My Rooms</p>
            <div className="space-y-1">
              {rooms.map((room) => (
                <button key={room.id} onClick={() => { setActiveRoomId(room.id); onClose(); }} className={`w-full px-3 py-2.5 rounded-xl text-left ${room.id === activeRoom.id ? 'bg-indigo-500/15 border border-indigo-500/30' : 'hover:bg-slate-900'}`}>
                  <span className="block text-xs font-bold text-slate-200">{room.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">🔑 {room.code}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Roommates Quick Glance & Switcher */}
        <div className="p-6 border-t border-slate-900 space-y-4">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>{members.length} Active Roommates</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></span>
            </div>
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              {members.map((m) => {
                const isSelected = m.id === currentUser.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => switchUser(m.id)}
                    title={`Click to view as ${m.name}`}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-[10px] transition transform hover:scale-110 cursor-pointer ${m.avatar} ${
                      isSelected ? 'ring-2 ring-emerald-400 scale-105 shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    {m.name.substring(0, 2).toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </aside>
    </>
  );
};
