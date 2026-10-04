import axios from 'axios';
import { 
  Member, 
  Coupon, 
  Reservation, 
  Outlet, 
  KPI, 
  RevenuePoint, 
  AIInsight,
  EventItem,
  PendingPayment,
  StaffRole,
  FeedbackItem,
  MarketingChannel,
  CampaignPreset
} from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

// Empty fallbacks — all data comes from API only
export const fallbackKPIs: KPI[] = [
  { label: 'Total Revenue', value: '₹0', delta: '0%', trend: 'up' },
  { label: 'Membership Revenue', value: '₹0', delta: '0%', trend: 'up' },
  { label: 'Active Members', value: '0', delta: '0', trend: 'up' },
  { label: 'Pending Payments', value: '₹0', delta: '0%', trend: 'down' },
  { label: 'Coupons Redeemed', value: '0', delta: '0%', trend: 'up' },
  { label: 'Reservations', value: '0', delta: '0%', trend: 'up' },
];

export const fallbackRevenueSeries: RevenuePoint[] = [
  { m: 'Jan', revenue: 0, membership: 0 },
  { m: 'Feb', revenue: 0, membership: 0 },
  { m: 'Mar', revenue: 0, membership: 0 },
  { m: 'Apr', revenue: 0, membership: 0 },
  { m: 'May', revenue: 0, membership: 0 },
  { m: 'Jun', revenue: 0, membership: 0 },
  { m: 'Jul', revenue: 0, membership: 0 },
  { m: 'Aug', revenue: 0, membership: 0 },
  { m: 'Sep', revenue: 0, membership: 0 },
  { m: 'Oct', revenue: 0, membership: 0 },
  { m: 'Nov', revenue: 0, membership: 0 },
  { m: 'Dec', revenue: 0, membership: 0 },
];

export const fallbackOutlets: Outlet[] = [];

export const fallbackInsights: AIInsight[] = [];

export const fallbackCustomers: Member[] = [];

export const fallbackReservations: Reservation[] = [];

export const fallbackCoupons: Coupon[] = [];

export async function fetchDashboardData() {
  try {
    const res = await apiClient.get('/admin/dashboard');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return {
    kpis: fallbackKPIs,
    revenueSeries: fallbackRevenueSeries,
    outletPerformance: fallbackOutlets,
    aiInsights: fallbackInsights,
  };
}

export async function fetchMembers(): Promise<Member[]> {
  try {
    const res = await apiClient.get('/members');
    if (res.data?.success && res.data.data?.length) {
      return res.data.data;
    }
  } catch (_) {}
  return fallbackCustomers;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  try {
    const res = await apiClient.get('/coupons');
    if (res.data?.success && res.data.data?.length) {
      return res.data.data;
    }
  } catch (_) {}
  return fallbackCoupons;
}

export async function fetchReservations(): Promise<Reservation[]> {
  try {
    const res = await apiClient.get('/reservations');
    if (res.data?.success && res.data.data?.length) {
      return res.data.data;
    }
  } catch (_) {}
  return fallbackReservations;
}

export async function fetchOutlets(): Promise<Outlet[]> {
  try {
    const res = await apiClient.get('/admin/outlets');
    if (res.data?.success && res.data.data?.length) {
      return res.data.data;
    }
  } catch (_) {}
  return fallbackOutlets;
}

export async function resetAllData(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await apiClient.post('/admin/reset-data');
    return {
      success: true,
      message: res.data?.message || 'Data cleared and reset successfully.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || 'Failed to reset data.',
    };
  }
}

export const fallbackEvents: EventItem[] = [];

export const fallbackPendingPayments: PendingPayment[] = [];

export const fallbackStaffRoles: StaffRole[] = [];

export const fallbackFeedback: FeedbackItem[] = [];

export const fallbackMarketingChannels: MarketingChannel[] = [];

export const fallbackCampaignPresets: CampaignPreset[] = [];

