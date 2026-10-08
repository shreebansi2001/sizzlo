import React from 'react';
import { 
  LayoutDashboard, 
  Crown, 
  Users, 
  Ticket, 
  CalendarCheck, 
  Store, 
  Sparkles,
  Wallet,
  PartyPopper,
  Megaphone,
  ShieldCheck,
  MessageSquareText,
  BadgeCheck,
  Brain,
  Armchair,
  Activity,
  ScanLine,
  LogOut,
  UserCheck,
  Bell,
  X
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onLogout, onClose }) => {
  const navGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'insights', label: 'AI Predictive Engine', icon: Brain, badge: '5' },
        { id: 'ceo', label: 'CEO Strategic Suite', icon: Crown },
      ],
    },
    {
      group: 'Users & Subscriptions',
      items: [
        { id: 'customers', label: 'Users', icon: Users },
        { id: 'memberships', label: 'Subscriptions', icon: BadgeCheck },
        { id: 'loyalty', label: 'Loyalty Points', icon: Sparkles },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'coupons', label: 'Voucher Manager', icon: Ticket },
        { id: 'payments', label: 'Pending Payments', icon: Wallet, badge: '12' },
        { id: 'reservations', label: 'Host Station Bookings', icon: CalendarCheck },
        { id: 'floor', label: 'Floor & Tables', icon: Armchair },
        { id: 'activity', label: 'Live Activity', icon: Activity },
        { id: 'redemption', label: 'Redemption Desk', icon: ScanLine },
        { id: 'outlets', label: 'Venues & Outlets', icon: Store },
        { id: 'events', label: 'Events & Brunches', icon: PartyPopper },
      ],
    },
    {
      group: 'Growth & Governance',
      items: [
        { id: 'marketing', label: 'Broadcast & Notifications', icon: Bell },
        { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck },
        { id: 'feedback', label: 'User Feedback', icon: MessageSquareText },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <div style={{ position: 'relative' }}>
            <img 
              src="/sizzlo-mascot.png" 
              alt="Sizzlo" 
              className="animate-float"
              style={{ width: 44, height: 44, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(255, 138, 0, 0.4))' }} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--text-main)', letterSpacing: 0.5 }}>
                YANKI
              </span>
              <span className="brand-badge">SUPER ADMIN</span>
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 0.5, marginTop: 2 }}>
              Privilege & Dining Console
            </p>
          </div>
        </div>
        {onClose && (
          <button 
            className="mobile-sidebar-close" 
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="sidebar-nav">
        {navGroups.map((g) => (
          <div key={g.group} style={{ marginTop: 8 }}>
            <div className="nav-group-title">
              {g.group}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.4 : 1.8} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="nav-badge">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin Profile & Logout Footer */}
      <div style={{
        margin: '12px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'linear-gradient(145deg, #1A201D 0%, #111513 100%)',
        border: '1px solid rgba(201, 162, 77, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'rgba(201, 162, 77, 0.2)',
            border: '1px solid var(--gold)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <UserCheck size={13} color="var(--gold)" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              admin@sizzlo.com
            </div>
            <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 0.5 }}>
              Super Admin
            </div>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Logout from Admin Console"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#EF4444',
              padding: '6px 10px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
          >
            <LogOut size={12} />
            <span>Exit</span>
          </button>
        )}
      </div>
    </aside>
  );
};
