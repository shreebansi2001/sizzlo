import React, { useState, useEffect } from 'react';
import { Search, LogOut, Menu, Building2 } from 'lucide-react';
import { fetchOutlets } from '../../api/client';
import { AdminAuthUser, Outlet } from '../../types';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentUser?: AdminAuthUser | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  currentUser, 
  onRefresh, 
  isLoading, 
  onLogout, 
  onToggleSidebar,
  onTabChange 
}) => {
  const isSuperAdmin = currentUser?.roleCode === 'SUPER_ADMIN';
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>(currentUser?.branchName || 'All Branches');
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    fetchOutlets().then(list => {
      if (list && list.length > 0) setOutlets(list);
    });
  }, []);

  useEffect(() => {
    if (currentUser?.branchName && !isSuperAdmin) {
      setSelectedOutlet(currentUser.branchName);
    }
  }, [currentUser, isSuperAdmin]);

  return (
    <header className="admin-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {onToggleSidebar && (
          <button 
            className="mobile-sidebar-toggle"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} color="var(--primary)" />
          </button>
        )}
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--text-main)', letterSpacing: -0.3 }}>
            {title}
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {subtitle}
          </p>
        </div>
      </div>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Outlet Switcher or Scoped Branch Display */}
        {isSuperAdmin ? (
          <select 
            className="outlet-select"
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            <option value="All Branches">🏢 All Branches (Group Consolidated)</option>
            {outlets.map((o) => (
              <option key={o.id} value={o.name}>
                📍 {o.name}
              </option>
            ))}
          </select>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(201, 162, 77, 0.12)',
            border: '1px solid rgba(201, 162, 77, 0.35)',
            borderRadius: 10,
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--gold)',
          }}>
            <Building2 size={13} color="var(--gold)" />
            <span>{currentUser?.branchName || 'Assigned Branch'}</span>
          </div>
        )}

        {/* Global Search */}
        <div className="header-search">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search patron, phone, or voucher..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchVal.trim()) {
                window.location.hash = 'customers';
              }
            }}
          />
        </div>

        {/* Notification Center */}
        <NotificationCenter onTabChange={onTabChange} />

        {/* Header Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title="Sign out of Admin Console"
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
