import React, { useState, useEffect } from 'react';
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
import { LoyaltyPage } from './pages/LoyaltyPage';
import { EventsPage } from './pages/EventsPage';
import { MarketingPage } from './pages/MarketingPage';
import { StaffPage } from './pages/StaffPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FloorPage } from './pages/FloorPage';
import { RedemptionPage } from './pages/RedemptionPage';
import { ActivityPage } from './pages/ActivityPage';
import { 
  fallbackInsights,
  fallbackEvents,
  fallbackPendingPayments,
  fallbackStaffRoles,
  fallbackFeedback,
  fallbackMarketingChannels,
  fallbackCampaignPresets,
} from './api/client';
import { LoginPage } from './pages/LoginPage';

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('yanki_admin_auth'));
  });

  const getInitialTab = () => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = [
      'dashboard', 'insights', 'ceo', 'customers', 'memberships', 'loyalty', 
      'coupons', 'payments', 'reservations', 'floor', 'activity', 'redemption',
      'outlets', 'events', 'marketing', 'staff', 'feedback'
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

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Live business performance & patron telemetry' };
      case 'insights':
        return { title: 'AI Predictive Engine', subtitle: 'Automated intelligence to unlock group revenue growth' };
      case 'ceo':
        return { title: 'CEO Strategic Suite', subtitle: 'Consolidated group revenue, forecast and margins' };
      case 'customers':
        return { title: 'Patron 360 CRM', subtitle: 'Manage VIP memberships, spending records & dues' };
      case 'memberships':
        return { title: 'Subscription Management', subtitle: 'Track subscriptions, renewal forecast and lifetime growth' };
      case 'loyalty':
        return { title: 'Loyalty Point Management', subtitle: 'Track points issuance, redemption and free renewals' };
      case 'coupons':
        return { title: 'Voucher Management', subtitle: 'Create, issue and track dining privilege vouchers' };
      case 'payments':
        return { title: 'Pending Collections & Dues', subtitle: 'Automated reminders via WhatsApp, SMS, and Email' };
      case 'reservations':
        return { title: 'Reservation Analytics', subtitle: 'Real-time bookings, peak hours and VIP load' };
      case 'floor':
        return { title: 'Floor & Tables', subtitle: 'Live seating capacity, dining table states and waitlist queue' };
      case 'activity':
        return { title: 'Live Activity Feed', subtitle: 'Updates across every Yanki destination in real time' };
      case 'redemption':
        return { title: 'Redemption Desk', subtitle: 'Counter verification and redemption terminal' };
      case 'outlets':
        return { title: 'Venues & Dining Concepts', subtitle: 'Compare venue revenues, ABV, and ratings' };
      case 'events':
        return { title: 'Banquet & ODC Management', subtitle: 'Pipeline, event calendar and lead conversion for celebrations' };
      case 'marketing':
        return { title: 'Marketing & Campaigns', subtitle: 'Audience reach, automated journeys and broadcast messaging' };
      case 'staff':
        return { title: 'Staff & Role Management', subtitle: 'Roles, RBAC permissions and security governance' };
      case 'feedback':
        return { title: 'Subscriber Reviews & Feedback', subtitle: 'Direct dining ratings and comments from VIP patrons' };
      default:
        return { title: 'Sizzlo Admin Console', subtitle: 'Operations management' };
    }
  };

  const { title, subtitle } = getPageInfo();

  const handleLogout = () => {
    localStorage.removeItem('yanki_admin_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      title={title}
      subtitle={subtitle}
      onRefresh={handleRefresh}
      isLoading={false}
      onLogout={handleLogout}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage key={`dashboard-${refreshKey}`} />
      )}
      {currentTab === 'insights' && (
        <InsightsPage insights={fallbackInsights} />
      )}
      {currentTab === 'ceo' && (
        <CeoPage key={`ceo-${refreshKey}`} />
      )}
      {currentTab === 'customers' && (
        <CustomersPage key={`customers-${refreshKey}`} onRefresh={handleRefresh} />
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
        <PaymentsPage payments={fallbackPendingPayments} />
      )}
      {currentTab === 'reservations' && (
        <ReservationsPage key={`reservations-${refreshKey}`} reservations={[]} onRefresh={handleRefresh} />
      )}
      {currentTab === 'floor' && (
        <FloorPage key={`floor-${refreshKey}`} />
      )}
      {currentTab === 'activity' && (
        <ActivityPage key={`activity-${refreshKey}`} onNavigate={setCurrentTab} />
      )}
      {currentTab === 'redemption' && (
        <RedemptionPage key={`redemption-${refreshKey}`} />
      )}
      {currentTab === 'outlets' && (
        <OutletsPage key={`outlets-${refreshKey}`} />
      )}
      {currentTab === 'events' && (
        <EventsPage events={fallbackEvents} />
      )}
      {currentTab === 'marketing' && (
        <MarketingPage channels={fallbackMarketingChannels} presets={fallbackCampaignPresets} />
      )}
      {currentTab === 'staff' && (
        <StaffPage roles={fallbackStaffRoles} />
      )}
      {currentTab === 'feedback' && (
        <FeedbackPage feedbacks={fallbackFeedback} />
      )}
    </AdminLayout>
  );
}

export default App;
