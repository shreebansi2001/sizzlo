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
  ScanLine
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
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
      group: 'Subscribers',
      items: [
        { id: 'customers', label: 'Patron 360 CRM', icon: Users },
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
        { id: 'events', label: 'Banquet & ODC', icon: PartyPopper },
      ],
    },
    {
      group: 'Growth & Governance',
      items: [
        { id: 'marketing', label: 'Marketing Campaigns', icon: Megaphone },
        { id: 'staff', label: 'Staff & Roles', icon: ShieldCheck },
        { id: 'feedback', label: 'Patron Feedback', icon: MessageSquareText },
      ],
    },
  ];

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
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

      {/* Footer Status Widget */}
      <div className="sidebar-footer-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
            Tonight Service
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--text-main)', marginTop: 4 }}>
          26 VIPs Dining
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          Across 4 outlets · 92% capacity
        </p>
      </div>
    </aside>
  );
};
