import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { SettlementView } from './components/SettlementView';
import { AnalyticsView } from './components/AnalyticsView';
import { MemberManagement } from './components/MemberManagement';
import { AddExpenseModal } from './components/AddExpenseModal';
import { Wallet } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useExpense();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'expenses' && <ExpenseList />}
      {activeTab === 'settlements' && <SettlementView />}
      {activeTab === 'analytics' && <AnalyticsView />}
      {activeTab === 'members' && <MemberManagement />}
      <AddExpenseModal />
    </main>
  );
};

export function App() {
  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <div className="flex-1">
          <MainContent />
        </div>
        <footer className="bg-slate-900/60 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-400">MaasaSelavu</span>
              <span>•</span>
              <span>Shared Room & Personal Expense Manager</span>
            </div>
            <p>Designed for 4 Roommates • Cash Paid vs Burden vs Recoverable Balance</p>
          </div>
        </footer>
      </div>
    </ExpenseProvider>
  );
}

export default App;
