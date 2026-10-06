import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
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
  title,
  subtitle,
  onRefresh,
  isLoading,
  onLogout,
  children,
}) => {
  return (
    <div className="admin-shell">
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} onLogout={onLogout} />
      <div className="admin-main">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onRefresh={onRefresh} 
          isLoading={isLoading} 
          onLogout={onLogout}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
