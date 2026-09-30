import React, { useState, useEffect } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CeoPage } from './pages/CeoPage';
import { CustomersPage } from './pages/CustomersPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { OutletsPage } from './pages/OutletsPage';
import { InsightsPage } from './pages/InsightsPage';
import { 
  fetchDashboardData, 
  fetchMembers, 
  fetchCoupons, 
  fetchReservations,
  fallbackKPIs,
  fallbackRevenueSeries,
  fallbackOutlets,
  fallbackInsights,
  fallbackCustomers,
  fallbackCoupons,
  fallbackReservations
} from './api/client';
import { Member, Coupon, Reservation, Outlet, KPI, RevenuePoint, AIInsight } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);

  const [kpis, setKpis] = useState<KPI[]>(fallbackKPIs);
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>(fallbackRevenueSeries);
  const [outlets, setOutlets] = useState<Outlet[]>(fallbackOutlets);
  const [insights, setInsights] = useState<AIInsight[]>(fallbackInsights);
  const [members, setMembers] = useState<Member[]>(fallbackCustomers);
  const [coupons, setCoupons] = useState<Coupon[]>(fallbackCoupons);
  const [reservations, setReservations] = useState<Reservation[]>(fallbackReservations);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dash, mems, coups, resvs] = await Promise.all([
        fetchDashboardData(),
        fetchMembers(),
        fetchCoupons(),
        fetchReservations(),
      ]);

      if (dash.kpis) setKpis(dash.kpis);
      if (dash.revenueSeries) setRevenueSeries(dash.revenueSeries);
      if (dash.outletPerformance) setOutlets(dash.outletPerformance);
      if (dash.aiInsights) setInsights(dash.aiInsights);
      if (mems) setMembers(mems);
      if (coups) setCoupons(coups);
      if (resvs) setReservations(resvs);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getPageInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Executive Overview', subtitle: 'Live business performance & patron telemetry' };
      case 'ceo':
        return { title: 'CEO Strategic Suite', subtitle: 'Consolidated group revenue, forecast and margins' };
      case 'customers':
        return { title: 'Patron 360 CRM', subtitle: 'Manage VIP memberships, spending records & dues' };
      case 'coupons':
        return { title: 'Voucher Management', subtitle: 'Create, issue and track dining privilege vouchers' };
      case 'reservations':
        return { title: 'Host Station & Table Bookings', subtitle: 'Real-time dining floor pipeline and status' };
      case 'outlets':
        return { title: 'Outlets & Dining Concepts', subtitle: 'Compare venue revenues, ABV, and ratings' };
      case 'insights':
        return { title: 'AI Predictive Engine', subtitle: 'Automated intelligence to unlock growth' };
      default:
        return { title: 'Sizzlo Admin', subtitle: 'Operations management' };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <AdminLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      title={title}
      subtitle={subtitle}
      onRefresh={loadData}
      isLoading={isLoading}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          kpis={kpis}
          revenueSeries={revenueSeries}
          outlets={outlets}
          reservations={reservations}
        />
      )}
      {currentTab === 'ceo' && (
        <CeoPage kpis={kpis} outlets={outlets} />
      )}
      {currentTab === 'customers' && (
        <CustomersPage members={members} />
      )}
      {currentTab === 'coupons' && (
        <CouponsPage coupons={coupons} />
      )}
      {currentTab === 'reservations' && (
        <ReservationsPage reservations={reservations} />
      )}
      {currentTab === 'outlets' && (
        <OutletsPage outlets={outlets} />
      )}
      {currentTab === 'insights' && (
        <InsightsPage insights={insights} />
      )}
    </AdminLayout>
  );
}
export default App;
