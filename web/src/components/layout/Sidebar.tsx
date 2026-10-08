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
  Building2, 
  X 
} from 'lucide-react';
import { AdminAuthUser } from '../../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser?: AdminAuthUser | null;
  onLogout?: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, currentUser, onLogout, onClose }) => {
  const isSuperAdmin = currentUser?.roleCode === 'SUPER_ADMIN';
  const userPerms = currentUser?.permissions || [];

  const hasAccess = (requiredPerm?: string) => {
    if (!requiredPerm) return true;
    if (isSuperAdmin) return true;
    return userPerms.includes(requiredPerm);
  };

  const allNavGroups = [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, perm: 'DASHBOARD_VIEW' },
        { id: 'insights', label: 'AI Predictive Engine', icon: Brain, badge: 'AI', perm: 'INSIGHTS_VIEW' },
        { id: 'ceo', label: 'CEO Strategic Suite', icon: Crown, perm: 'CEO_SUITE_VIEW' },
      ],
    },
    {
      group: 'Subscribers',
      items: [
        { id: 'customers', label: 'Patron 360 CRM', icon: Users, perm: 'CUSTOMERS_MANAGE' },
        { id: 'memberships', label: 'Subscriptions', icon: BadgeCheck, perm: 'MEMBERSHIPS_MANAGE' },
        { id: 'loyalty', label: 'Loyalty Points', icon: Sparkles, perm: 'LOYALTY_MANAGE' },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'coupons', label: 'Voucher Manager', icon: Ticket, perm: 'COUPONS_MANAGE' },
        { id: 'payments', label: 'Pending Payments', icon: Wallet, perm: 'PAYMENTS_SETTLE_APPROVE' },
        { id: 'reservations', label: 'Host Station Bookings', icon: CalendarCheck, perm: 'RESERVATIONS_MANAGE' },
        { id: 'floor', label: 'Floor & Tables', icon: Armchair, perm: 'FLOOR_TABLES_MANAGE' },
        { id: 'activity', label: 'Live Activity', icon: Activity, perm: 'DASHBOARD_VIEW' },
        { id: 'redemption', label: 'Redemption Desk', icon: ScanLine, perm: 'REDEMPTION_VALIDATE' },
        { id: 'outlets', label: 'Venues & Outlets', icon: Store, perm: 'OUTLETS_MANAGE' },
        { id: 'events', label: 'Banquet & ODC', icon: PartyPopper, perm: 'EVENTS_MANAGE' },
      ],
    },
    {
      group: 'Growth & Governance',
      items: [
        { id: 'marketing', label: 'Marketing Campaigns', icon: Megaphone, perm: 'MARKETING_MANAGE' },
        { id: 'staff', label: 'Staff & Roles (RBAC)', icon: ShieldCheck, perm: 'USER_MGMT' },
        { id: 'feedback', label: 'Patron Feedback', icon: MessageSquareText, perm: 'FEEDBACK_VIEW' },
      ],
    },
  ];

  // Filter navigation by effective permissions
  const navGroups = allNavGroups.map(g => ({
    ...g,
    items: g.items.filter(item => hasAccess(item.perm))
  })).filter(g => g.items.length > 0);

  const displayRoleBadge = currentUser?.roleCode ? (
    currentUser.roleCode === 'SUPER_ADMIN' ? 'SUPER ADMIN (OWNER)' :
    currentUser.roleCode === 'BRANCH_ADMIN' ? 'BRANCH ADMIN' :
    currentUser.roleCode === 'MANAGER' ? 'OPERATIONS MANAGER' : 'FLOOR CAPTAIN'
  ) : 'SUPER ADMIN';

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
              <span className="brand-badge" style={{ fontSize: 9 }}>
                {displayRoleBadge}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Building2 size={11} color="var(--gold)" />
              <span style={{ fontSize: 10, color: 'var(--gold)', fontWeight: 600, letterSpacing: 0.3 }}>
                {currentUser?.branchName || 'All Branches'}
              </span>
            </div>
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

      {/* Footer Status Widget */}
      <div className="sidebar-footer-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
            Branch Scoping
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
        </div>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--text-main)', marginTop: 4, fontWeight: 600 }}>
          {currentUser?.branchName || 'All Branches'}
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
          {isSuperAdmin ? 'Full group permissions active' : `Scoped to ${currentUser?.branchName}`}
        </p>

        {/* Logged in Admin & Logout */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 10,
          marginTop: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
              flexShrink: 0,
            }}>
              <UserCheck size={14} color="var(--gold)" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {currentUser?.fullName || currentUser?.email || 'admin@sizzlo.com'}
              </div>
              <div style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: 0.5 }}>
                {currentUser?.roleName || 'Super Admin'}
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
                padding: '6px 8px',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              <LogOut size={12} />
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
