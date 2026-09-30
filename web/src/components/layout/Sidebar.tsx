import React from 'react';
import { 
  LayoutDashboard, 
  Crown, 
  Users, 
  Ticket, 
  CalendarCheck, 
  Store, 
  Sparkles,
  CreditCard,
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'ceo', label: 'CEO Insights', icon: Crown },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'coupons', label: 'Coupon Manager', icon: Ticket },
    { id: 'reservations', label: 'Reservations', icon: CalendarCheck },
    { id: 'outlets', label: 'Outlets & Venues', icon: Store },
    { id: 'insights', label: 'AI Recommendations', icon: Sparkles },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(232, 184, 74, 0.2)',
          display: 'grid',
          placeItems: 'center',
          border: '1.5px solid #E8B84A'
        }}>
          <Crown size={20} color="#E8B84A" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>SIZZLO</span>
            <span className="brand-badge">ADMIN</span>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Yanki Hospitality Group</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#0A3175',
            color: '#E8B84A',
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            fontSize: 12
          }}>
            BM
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, color: 'white', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Bansi Mehta</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Senior General Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
