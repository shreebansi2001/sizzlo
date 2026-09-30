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
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  title,
  subtitle,
  onRefresh,
  isLoading,
  children,
}) => {
  return (
    <div className="admin-shell">
      <Sidebar currentTab={currentTab} onTabChange={onTabChange} />
      <div className="admin-main">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onRefresh={onRefresh} 
          isLoading={isLoading} 
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
};
