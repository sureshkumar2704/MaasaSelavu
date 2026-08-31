import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  ArrowLeftRight, 
  PieChart, 
  Users, 
  PlusCircle, 
  RotateCcw,
  Wallet,
  X,
  Sparkles
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
    resetToDemoData,
    members
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
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
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

          <nav className="space-y-1.5 pt-2">
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
        </div>

        {/* Roommates Quick Glance */}
        <div className="p-6 border-t border-slate-900 space-y-4">
          <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span>{members.length} Active Roommates</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow"></span>
            </div>
            <div className="flex items-center -space-x-2">
              {members.map((m) => (
                <div 
                  key={m.id} 
                  title={m.name} 
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-[10px] border-2 border-slate-950 shadow-md ${m.avatar}`}
                >
                  {m.name.substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              resetToDemoData();
              onClose();
            }}
            className="w-full py-2.5 px-3 flex items-center justify-center space-x-2 text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-900 border border-slate-800 rounded-xl transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        </div>

      </aside>
    </>
  );
};

