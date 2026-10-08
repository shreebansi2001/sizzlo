import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

import { AdminAuthUser } from '../../types';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser?: AdminAuthUser | null;
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  onLogout?: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  title,
  subtitle,
  onRefresh,
  isLoading,
  onLogout,
  children,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`admin-shell ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar 
        currentTab={currentTab} 
        onTabChange={handleTabChange} 
        currentUser={currentUser}
        onLogout={onLogout}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="admin-main">
        <Header 
          title={title} 
          subtitle={subtitle} 
          currentUser={currentUser}
          onRefresh={onRefresh} 
          isLoading={isLoading} 
          onLogout={onLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
