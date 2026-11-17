import React from 'react';
import { useApp } from './context/AppContext';
import { AppShell } from './components/AppShell';
import { EarnTab } from './components/EarnTab';
import { TasksTab } from './components/TasksTab';
import { FriendsTab } from './components/FriendsTab';
import { WalletTab } from './components/WalletTab';
import { AdminDashboard } from './components/AdminDashboard';

export const AppContent: React.FC = () => {
  const { activeView, activeTab } = useApp();

  return (
    <AppShell>
      {activeView === 'admin' ? (
        <AdminDashboard />
      ) : (
        <>
          {activeTab === 'earn' && <EarnTab />}
          {activeTab === 'tasks' && <TasksTab />}
          {activeTab === 'friends' && <FriendsTab />}
          {activeTab === 'wallet' && <WalletTab />}
        </>
      )}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
