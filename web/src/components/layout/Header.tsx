import React, { useState, useEffect } from 'react';
import { Bell, Search, RefreshCw, RotateCcw, Key, Check, LogOut, Menu, Building2 } from 'lucide-react';
import { resetAllData, fetchOutlets } from '../../api/client';
import { AdminAuthUser, Outlet } from '../../types';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentUser?: AdminAuthUser | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, currentUser, onRefresh, isLoading, onLogout, onToggleSidebar }) => {
  const isSuperAdmin = currentUser?.roleCode === 'SUPER_ADMIN';
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<string>(currentUser?.branchName || 'All Branches');
  const [searchVal, setSearchVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState(false);

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

  const handleResetData = async () => {
    if (!window.confirm('Clear all reservations, redemptions & test logs to restore clean default seed state?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await resetAllData();
      setResetStatus(res.message);
      setTimeout(() => setResetStatus(null), 4000);
      if (onRefresh) onRefresh();
    } finally {
      setIsResetting(false);
    }
  };

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
        {/* Reset Feedback Notification */}
        {resetStatus && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            color: '#065F46',
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <Check size={14} color="#10B981" />
            <span>{resetStatus}</span>
          </div>
        )}

        {/* Credentials Pill / Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowCreds(!showCreds)}
            style={{ 
              background: 'rgba(232, 184, 74, 0.1)', 
              borderColor: 'var(--gold)', 
              color: 'var(--primary)',
              fontWeight: 600,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
            title="Click to view Admin Credentials"
          >
            <Key size={13} color="var(--gold-dark)" />
            <span>Admin Credentials</span>
          </button>

          {showCreds && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              background: '#070A09',
              border: '1px solid var(--gold)',
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              zIndex: 100,
              minWidth: 260,
              color: '#F8F9FA'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.8, marginBottom: 6 }}>
                ADMIN LOGIN ACCESS
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#8BA19A' }}>Link: </span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>http://localhost:5180</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#8BA19A' }}>Email: </span>
                <span style={{ color: '#E8B84A', fontWeight: 600 }}>admin@sizzlo.com</span>
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: '#8BA19A' }}>Password: </span>
                <span style={{ color: '#E8B84A', fontWeight: 600 }}>admin123</span>
              </div>
            </div>
          )}
        </div>

        {/* Reset Data Button */}
        <button
          className="btn btn-outline btn-sm"
          onClick={handleResetData}
          disabled={isResetting}
          style={{
            borderColor: '#EF4444',
            color: '#EF4444',
            background: 'rgba(239, 68, 68, 0.05)',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}
          title="Clear & reset all test reservations, activity logs, and floor tables"
        >
          <RotateCcw size={12} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Clear Test Data'}</span>
        </button>

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
            placeholder="Search user, phone, or voucher..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

        {/* Sync Java Backend Button */}
        {onRefresh && (
          <button 
            className="btn btn-outline btn-sm" 
            onClick={onRefresh}
            title="Sync current feature data with Java 8 Spring Boot API"
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        )}

        {/* Notification Bell */}
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer'
        }}>
          <Bell size={16} color="var(--text-main)" />
          <span style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 8px var(--primary)'
          }} />
        </div>

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
