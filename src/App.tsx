import React, { useState } from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { SettlementView } from './components/SettlementView';
import { AnalyticsView } from './components/AnalyticsView';
import { MemberManagement } from './components/MemberManagement';
import { AddExpenseModal } from './components/AddExpenseModal';
import { LoginModal } from './components/LoginModal';
import { ProfileModal } from './components/ProfileModal';
import { Wallet } from 'lucide-react';

const MainAppLayout: React.FC = () => {
  const { activeTab, isAuthenticated } = useExpense();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) return <LoginModal />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Sliding Sidebar Navigation with Edge Swipe Gesture Support */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onOpen={() => setIsSidebarOpen(true)}
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'filter blur-[2px] pointer-events-none sm:pointer-events-auto' : ''}`}>
        <Header 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} 
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'expenses' && <ExpenseList />}
          {activeTab === 'settlements' && <SettlementView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'members' && <MemberManagement />}
          <AddExpenseModal />
          <LoginModal />
          <ProfileModal />
        </main>

        <footer className="bg-slate-900/60 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-400">MaasaSelavu</span>
              <span>•</span>
              <span>Roommate Shared & Personal Manager</span>
            </div>
            <p>Designed for Roommates • Edge Swipe & Blurred Backdrop</p>
          </div>
        </footer>
      </div>

    </div>
  );
};

export function App() {
  return (
    <ExpenseProvider>
      <MainAppLayout />
    </ExpenseProvider>
  );
}

export default App;
