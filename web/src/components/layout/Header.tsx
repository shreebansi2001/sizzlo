import React, { useState } from 'react';
import { Bell, Search, RefreshCw, RotateCcw, Key, Check, LogOut, Menu } from 'lucide-react';
import { resetAllData } from '../../api/client';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh, isLoading, onLogout, onToggleSidebar }) => {
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [searchVal, setSearchVal] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState(false);

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

      <div className="header-actions">
        {/* Reset Feedback Notification */}
        {resetStatus && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            color: '#10B981',
            padding: '5px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            whiteSpace: 'nowrap'
          }}>
            <Check size={13} color="#10B981" />
            <span>{resetStatus}</span>
          </div>
        )}

        {/* Admin Tools Popover */}
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
              gap: 5,
              whiteSpace: 'nowrap'
            }}
            title="Admin Login & Database Utilities"
          >
            <Key size={13} color="var(--gold)" />
            <span>Admin Access</span>
          </button>

          {showCreds && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              background: '#0B0F0E',
              border: '1px solid var(--gold)',
              borderRadius: 14,
              padding: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              zIndex: 100,
              minWidth: 280,
              color: '#F8F9FA'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.8, marginBottom: 8 }}>
                ADMIN LOGIN ACCESS
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#8BA19A' }}>URL: </span>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>http://localhost:5180</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: '#8BA19A' }}>Email: </span>
                <span style={{ color: '#E8B84A', fontWeight: 600 }}>admin@sizzlo.com</span>
              </div>
              <div style={{ fontSize: 12, marginBottom: 12 }}>
                <span style={{ color: '#8BA19A' }}>Password: </span>
                <span style={{ color: '#E8B84A', fontWeight: 600 }}>admin123</span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleResetData}
                  disabled={isResetting}
                  style={{
                    width: '100%',
                    borderColor: '#EF4444',
                    color: '#EF4444',
                    background: 'rgba(239, 68, 68, 0.08)',
                    fontSize: 11,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                  title="Clear & reset all test reservations, activity logs, and floor tables"
                >
                  <RotateCcw size={12} className={isResetting ? 'spin' : ''} />
                  <span>{isResetting ? 'Resetting...' : 'Clear Test Data'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Outlet Switcher */}
        <select 
          className="outlet-select"
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          style={{ whiteSpace: 'nowrap' }}
        >
          <option value="all">🏢 All Outlets</option>
          <option value="navrangpura">Navrangpura</option>
          <option value="shilaj">Shilaj</option>
          <option value="gandhinagar">Gandhinagar</option>
          <option value="bodakdev">Bodakdev</option>
        </select>

        {/* Global Search */}
        <div className="header-search">
          <Search size={14} />
          <input 
            type="text" 
            placeholder="Search patron, phone..." 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </div>

        {/* Sync Java Backend Button */}
        {onRefresh && (
          <button 
            className="btn btn-outline btn-sm" 
            onClick={onRefresh}
            title="Sync with Live Spring Boot API"
            style={{ whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
            <span>Sync</span>
          </button>
        )}

        {/* Notification Bell */}
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          <Bell size={15} color="var(--text-main)" />
          <span style={{
            position: 'absolute',
            top: 7,
            right: 7,
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
            className="btn-header-logout"
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
