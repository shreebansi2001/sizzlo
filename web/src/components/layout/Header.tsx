import React from 'react';
import { Bell, Search, RefreshCw } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh, isLoading }) => {
  return (
    <header className="admin-header">
      <div>
        <h1 className="serif-title page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="search-input">
          <Search size={16} color="#64748B" />
          <input type="text" placeholder="Search members, bookings, vouchers..." />
        </div>

        {onRefresh && (
          <button 
            className="btn btn-outline" 
            onClick={onRefresh}
            title="Sync with Java Backend"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
            <span style={{ fontSize: 12 }}>Sync Backend</span>
          </button>
        )}

        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#F1F5F9',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer'
        }}>
          <Bell size={18} color="#001D4A" />
          <span style={{
            position: 'absolute',
            top: 10,
            right: 11,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#E8B84A',
            border: '2px solid white'
          }} />
        </div>
      </div>
    </header>
  );
};
