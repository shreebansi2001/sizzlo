import React, { useState, useEffect } from 'react';
import { LogOut, X } from 'lucide-react';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CeoPage } from './pages/CeoPage';
import { CustomersPage } from './pages/CustomersPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { OutletsPage } from './pages/OutletsPage';
import { InsightsPage } from './pages/InsightsPage';
import { MembershipsPage } from './pages/MembershipsPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { SalesPage } from './pages/SalesPage';
import { LoyaltyPage } from './pages/LoyaltyPage';
import { EventsPage } from './pages/EventsPage';
import { MarketingPage } from './pages/MarketingPage';
import { StaffPage } from './pages/StaffPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FloorPage } from './pages/FloorPage';
import { BanquetsPage } from './pages/BanquetsPage';
import { LoginPage } from './pages/LoginPage';

import { AdminAuthUser } from './types';

const TAB_PERMISSIONS: Record<string, string> = {
  dashboard: 'DASHBOARD_VIEW',
  insights: 'INSIGHTS_VIEW',
  ceo: 'CEO_SUITE_VIEW',
  customers: 'CUSTOMERS_MANAGE',
  sales: 'SALES_MANAGE',
  sales_performance: 'SALES_MANAGE',
  sales_floor: 'SALES_MANAGE',
  sales_corporate: 'SALES_MANAGE',
  sales_training: 'SALES_MANAGE',
  sales_payroll: 'SALES_MANAGE',
  memberships: 'MEMBERSHIPS_MANAGE',
  loyalty: 'LOYALTY_MANAGE',
  coupons: 'COUPONS_MANAGE',
  payments: 'PAYMENTS_SETTLE_APPROVE',
  reservations: 'RESERVATIONS_MANAGE',
  calendar: 'RESERVATIONS_MANAGE',
  floor: 'FLOOR_TABLES_MANAGE',
  activity: 'DASHBOARD_VIEW',
  redemption: 'REDEMPTION_VALIDATE',
  outlets: 'OUTLETS_MANAGE',
  events: 'EVENTS_MANAGE',
  banquets: 'EVENTS_MANAGE',
  marketing: 'MARKETING_MANAGE',
  staff: 'USER_MGMT',
  feedback: 'FEEDBACK_VIEW',
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Admin portal view error caught by boundary:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(ellipse at top, #142821 0%, #070A09 60%, #030504 100%)',
          padding: 24,
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '40px 28px',
            textAlign: 'center',
            maxWidth: 540,
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)', marginBottom: 8 }}>
              Display Refresh Needed
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
              {this.state.error?.message || 'A data sync or cache mismatch occurred while loading this view.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn btn-primary"
                style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Refresh View
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch (_) {}
                  window.location.href = '/';
                }}
                className="btn btn-outline"
                style={{ padding: '10px 20px', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}
              >
                Reset Session & Login
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  const [currentUser, setCurrentUser] = useState<AdminAuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('yanki_admin_auth');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== 'object' || !parsed.username) {
        localStorage.removeItem('yanki_admin_auth');
        return null;
      }
      if (!Array.isArray(parsed.permissions)) {
        parsed.permissions = [];
      }
      return parsed;
    } catch {
      localStorage.removeItem('yanki_admin_auth');
      return null;
    }
  });

  const isAuthenticated = Boolean(currentUser);

  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = [
      'dashboard', 'insights', 'ceo', 'customers', 'payments', 
      'sales', 'sales_performance', 'sales_floor', 'sales_corporate', 'sales_training', 'sales_payroll',
      'memberships', 'loyalty', 'coupons', 'reservations', 'calendar', 'floor',
      'outlets', 'events', 'banquets', 'marketing', 'staff', 'feedback'
    ];
    return validTabs.includes(hash) ? hash : 'dashboard';
  };

  const [currentTab, setCurrentTabState] = useState(getInitialTab);
  const [refreshKey, setRefreshKey] = useState(0);

  const setCurrentTab = (tab: string) => {
    window.location.hash = tab;
    setCurrentTabState(tab);
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setCurrentTabState(hash);
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.roleCode !== 'SUPER_ADMIN') {
      const perms = Array.isArray(currentUser.permissions) ? currentUser.permissions : [];
      const requiredPerm = TAB_PERMISSIONS[currentTab];
      if (requiredPerm && !perms.includes(requiredPerm)) {
        const allowedTab = Object.keys(TAB_PERMISSIONS).find(t => 
          perms.includes(TAB_PERMISSIONS[t])
        ) || 'dashboard';
        setCurrentTab(allowedTab);
      }
    }
  }, [currentUser, currentTab]);

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Live business performance & user telemetry' };
      case 'insights':
        return { title: 'AI Predictive Engine', subtitle: 'Automated intelligence to unlock group revenue growth' };
      case 'ceo':
        return { title: 'CEO Strategic Suite', subtitle: 'Consolidated group revenue, forecast and margins' };
      case 'customers':
        return { title: 'Sizzlo Club & Member Registry', subtitle: '360° Patron profiles, digital VIP passports, spend analytics, loyalty wallets & privileges' };
      case 'payments':
        return { title: 'Payments & Financial Operations Hub', subtitle: 'Unified transaction ledger, plan purchases, mode of payment, POS table settlements & digital receipts' };
      case 'sales':
        return { title: 'Targets & Quota Bifurcation', subtitle: 'Owner Master Mandates • TL Multi-Branch Split • Floor Captain & Corporate BDE Quotas' };
      case 'sales_performance':
        return { title: 'Team Performance & Lagging Radar', subtitle: 'Live Rep-by-Rep Diagnostics • Quota vs Achieved • Lagging Deficit Alerts & Coaching Interventions' };
      case 'sales_floor':
        return { title: 'Floor Sales Enroller & Table POS', subtitle: 'Dining Table Quick-Enrollment • Real-time Member Provisioning • Auto-Attributed Commission' };
      case 'sales_corporate':
        return { title: 'Corporate Deals & Banquet Dispatch', subtitle: 'Company Pipeline CRM • TL Deal Approval • Bulk Corporate Passes • Banquet Lead Desk' };
      case 'sales_training':
        return { title: 'Sales Contests & Pitch Playbooks', subtitle: 'Live Incentive Contests • Leaderboards • Table Pitch Scripts & Objection Handling' };
      case 'sales_payroll':
        return { title: 'Incentive Ledger & Commission Payroll', subtitle: 'Audited Commission Records • TL Overrides • Owner Sign-Off & CSV Export' };
      case 'memberships':
        return { title: 'Subscription Plans & Privileges', subtitle: 'Configure Classic, Signature, and Elite tiers, pricing, dining perks, and terms' };
      case 'loyalty':
        return { title: 'Loyalty Point Management', subtitle: 'Track points issuance, redemption and free renewals' };
      case 'coupons':
        return { title: 'Voucher Management', subtitle: 'Create, issue and track dining privilege vouchers' };
      case 'reservations':
        return { title: 'Live Reservations & Settlement Desk', subtitle: 'Real-time table booking inquiries, live chime alerts, guest seating & table allocation' };
      case 'calendar':
        return { title: 'Interactive Booking Calendar', subtitle: 'Monthly calendar view, branch scoping, couple/family filters, past history & future schedule' };
      case 'floor':
        return { title: 'Floor & Tables', subtitle: 'Live seating capacity, dining table states and waitlist queue' };
      case 'outlets':
        return { title: 'Venues & Dining Concepts', subtitle: 'Compare venue revenues, ABV, and ratings' };
      case 'events':
        return { title: 'Exclusive Events & Sunday Brunches', subtitle: 'Manage Sunday Brunches, Chef Table passes, guest capacities, attendee lists and banquet desk' };
      case 'banquets':
        return { title: 'Banquet Master & Halls Management', subtitle: 'Manage banquet venues, capacity ranges, per-plate pricing, slot rentals, and dynamic app visibility' };
      case 'notifications':
      case 'marketing':
        return { title: 'Broadcast & Push Notifications', subtitle: 'Compose and dispatch instant push notifications, WhatsApp alerts, and subscriber broadcasts' };
      case 'staff':
        return { title: 'Staff & Roles (RBAC)', subtitle: 'Multi-tenant branch staff, roles & permission matrix' };
      case 'feedback':
        return { title: 'Subscriber Reviews & Feedback', subtitle: 'Direct dining ratings and comments from VIP users' };
      default:
        return { title: 'Sizzlo Admin Console', subtitle: 'Operations management' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleInitiateLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    localStorage.removeItem('yanki_admin_auth');
    setCurrentUser(null);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLogoutConfirm) {
        setShowLogoutConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLogoutConfirm]);

  return (
    <ErrorBoundary>
      {!isAuthenticated || !currentUser ? (
        <LoginPage onLoginSuccess={(u) => setCurrentUser(u)} />
      ) : (
        <AdminLayout
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentUser={currentUser}
          title={title}
          subtitle={subtitle}
          onRefresh={handleRefresh}
          isLoading={false}
          onLogout={handleInitiateLogout}
        >
          {currentTab === 'dashboard' && (
            <DashboardPage key={`dashboard-${refreshKey}`} />
          )}
          {currentTab === 'insights' && (
            <InsightsPage />
          )}
          {currentTab === 'ceo' && (
            <CeoPage key={`ceo-${refreshKey}`} />
          )}
          {currentTab === 'customers' && (
            <CustomersPage key={`customers-${refreshKey}`} onRefresh={handleRefresh} />
          )}
          {currentTab === 'payments' && (
            <PaymentsPage payments={[]} />
          )}
          {(currentTab === 'sales' || 
            currentTab === 'sales_performance' || 
            currentTab === 'sales_floor' || 
            currentTab === 'sales_corporate' || 
            currentTab === 'sales_training' || 
            currentTab === 'sales_payroll') && (
            <SalesPage 
              key={`sales-${currentTab}-${refreshKey}`} 
              currentUser={currentUser}
              activeSection={
                currentTab === 'sales_performance' ? 'performance' :
                currentTab === 'sales_floor' ? 'floor' :
                currentTab === 'sales_corporate' ? 'corporate' :
                currentTab === 'sales_training' ? 'training' :
                currentTab === 'sales_payroll' ? 'payroll' : 'targets'
              }
              onNavigateSection={(sec) => {
                const tabMap: Record<string, string> = {
                  targets: 'sales',
                  performance: 'sales_performance',
                  floor: 'sales_floor',
                  corporate: 'sales_corporate',
                  training: 'sales_training',
                  payroll: 'sales_payroll'
                };
                setCurrentTab(tabMap[sec] || 'sales');
              }}
            />
          )}
          {currentTab === 'memberships' && (
            <MembershipsPage />
          )}
          {currentTab === 'loyalty' && (
            <LoyaltyPage />
          )}
          {currentTab === 'coupons' && (
            <CouponsPage key={`coupons-${refreshKey}`} coupons={[]} onRefresh={handleRefresh} />
          )}
          {currentTab === 'payments' && (
            <PaymentsPage payments={[]} />
          )}
          {currentTab === 'reservations' && (
            <ReservationsPage 
              key={`reservations-${refreshKey}`} 
              reservations={[]} 
              defaultViewMode="desk"
              onRefresh={handleRefresh} 
            />
          )}
          {currentTab === 'calendar' && (
            <ReservationsPage 
              key={`calendar-${refreshKey}`} 
              reservations={[]} 
              defaultViewMode="calendar"
              onRefresh={handleRefresh} 
            />
          )}
          {currentTab === 'floor' && (
            <FloorPage key={`floor-${refreshKey}`} />
          )}
          {currentTab === 'outlets' && (
            <OutletsPage key={`outlets-${refreshKey}`} />
          )}
          {currentTab === 'events' && (
            <EventsPage events={[]} />
          )}
          {currentTab === 'banquets' && (
            <BanquetsPage key={`banquets-${refreshKey}`} />
          )}
          {(currentTab === 'marketing' || currentTab === 'notifications') && (
            <MarketingPage channels={[]} presets={[]} />
          )}
          {currentTab === 'staff' && (
            <StaffPage currentUser={currentUser} />
          )}
          {currentTab === 'feedback' && (
            <FeedbackPage key={`feedback-${refreshKey}`} />
          )}
        </AdminLayout>
      )}

      {/* Logout Confirmation Dialog Modal */}
      {showLogoutConfirm && (
        <div 
          className="modal-overlay" 
          onClick={handleCancelLogout}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 7, 0.85)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(155deg, #18231E 0%, #0F1613 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: '28px 26px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(239, 68, 68, 0.12)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Close X button */}
            <button
              onClick={handleCancelLogout}
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

            {/* Warning / Sign out glowing badge */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid rgba(239, 68, 68, 0.45)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 24px rgba(239, 68, 68, 0.3)',
            }}>
              <LogOut size={30} color="#EF4444" />
            </div>

            <h3 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-main)',
              letterSpacing: -0.2,
              marginBottom: 8,
            }}>
              Confirm Sign Out?
            </h3>

            <p style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: 20,
            }}>
              Are you sure you want to sign out of the <strong>Yanki / Sizzlo Admin Console</strong>? You will need to re-enter your administrator credentials to access live operations and floor controls.
            </p>

            {/* Current Session Chip */}
            {currentUser && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
                textAlign: 'left',
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                    {currentUser.fullName || currentUser.email || currentUser.username}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--gold)', marginTop: 2 }}>
                    {currentUser.roleName || 'Administrator'} • {currentUser.branchName || 'All Outlets'}
                  </div>
                </div>
                <span style={{
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(201, 162, 77, 0.15)',
                  color: 'var(--gold)',
                  fontWeight: 700,
                }}>
                  ACTIVE SESSION
                </span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleCancelLogout}
                className="btn btn-outline"
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                style={{
                  flex: 1,
                  padding: '11px 16px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  border: '1px solid #EF4444',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s ease',
                }}
              >
                <LogOut size={14} />
                <span>Yes, Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
