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

// Fallback mock data matching demo_code and Java backend
export const fallbackKPIs: KPI[] = [
  { label: 'Total Revenue', value: '₹2.75 Cr', delta: '+12.4%', trend: 'up' },
  { label: 'Membership Revenue', value: '₹42 Lakh', delta: '+8.2%', trend: 'up' },
  { label: 'Active Members', value: '4,582', delta: '+342', trend: 'up' },
  { label: 'Pending Payments', value: '₹8.75 L', delta: '-4.1%', trend: 'down' },
  { label: 'Coupons Redeemed', value: '12,874', delta: '+22%', trend: 'up' },
  { label: 'Reservations', value: '1,245', delta: '+9.6%', trend: 'up' },
];

export const fallbackRevenueSeries: RevenuePoint[] = [
  { m: 'Jan', revenue: 18, membership: 3.2 },
  { m: 'Feb', revenue: 19.5, membership: 3.5 },
  { m: 'Mar', revenue: 22.1, membership: 3.8 },
  { m: 'Apr', revenue: 21, membership: 3.7 },
  { m: 'May', revenue: 24.6, membership: 4.1 },
  { m: 'Jun', revenue: 26.8, membership: 4.4 },
  { m: 'Jul', revenue: 25.4, membership: 4.2 },
  { m: 'Aug', revenue: 27.9, membership: 4.6 },
  { m: 'Sep', revenue: 29.1, membership: 4.9 },
  { m: 'Oct', revenue: 30.2, membership: 5.0 },
  { m: 'Nov', revenue: 28.7, membership: 4.8 },
  { m: 'Dec', revenue: 32.4, membership: 5.5 },
];

export const fallbackOutlets: Outlet[] = [
  { id: 1, name: 'Yanki Signature', address: 'Bodakdev', city: 'Ahmedabad', contactNumber: '+91 79 4001 0001', revenueLakhs: 86.0, activeMembers: 1842, averageBillValue: 2840, couponsRedeemed: 412, rating: 4.8 },
  { id: 2, name: 'Yanki Lounge SG', address: 'SG Highway', city: 'Ahmedabad', contactNumber: '+91 79 4001 0002', revenueLakhs: 64.0, activeMembers: 1124, averageBillValue: 2210, couponsRedeemed: 298, rating: 4.7 },
  { id: 3, name: 'Dough by Yanki', address: 'CG Road', city: 'Ahmedabad', contactNumber: '+91 79 4001 0003', revenueLakhs: 49.0, activeMembers: 942, averageBillValue: 1180, couponsRedeemed: 524, rating: 4.6 },
  { id: 4, name: 'Yanki Banquet', address: 'Bopal', city: 'Ahmedabad', contactNumber: '+91 79 4001 0004', revenueLakhs: 38.0, activeMembers: 412, averageBillValue: 18400, couponsRedeemed: 86, rating: 4.9 },
  { id: 5, name: 'Yanki Café CG', address: 'CG Road', city: 'Ahmedabad', contactNumber: '+91 79 4001 0005', revenueLakhs: 28.0, activeMembers: 262, averageBillValue: 920, couponsRedeemed: 142, rating: 4.5 },
];

export const fallbackInsights: AIInsight[] = [
  { title: 'Renewal Opportunity', body: '150 memberships expiring within 30 days. Trigger campaign C-09 for best response.', tone: 'gold' },
  { title: 'Revenue Forecast', body: 'Revenue expected to grow 12% next quarter, driven by Yanki Signature & Banquet bookings.', tone: 'royal' },
  { title: 'Best Performing Coupon', body: 'Coupon C-09 generates highest repeat visits — 3.2× average frequency.', tone: 'royal' },
  { title: 'Capacity Surge Alert', body: 'Weekend dinner reservations expected to surge 24% — open extra slots for Sat 8–10 PM.', tone: 'royal' },
];

export const fallbackCustomers: Member[] = [
  { id: '1', membershipId: 'YSM-2024-04821', fullName: 'Rahul Mehta', firstName: 'Rahul', mobile: '+91 98250 12345', email: 'rahul.mehta@yanki.in', membershipType: 'VIP MEMBER', status: 'Active', issuedDate: '20 Jun 2024', expiryDate: '20 Jun 2027', totalSavings: 24500, couponsUsed: 5, couponsTotal: 12, loyaltyPoints: 125000, loyaltyGoal: 250000, pendingDues: 0, totalSpend: 68500, lastVisit: 'Today' },
  { id: '2', membershipId: 'YSM-2024-04002', fullName: 'Priya Shah', firstName: 'Priya', mobile: '+91 98250 20000', email: 'priya.shah@gmail.com', membershipType: 'BLACK DIAMOND', status: 'Active', issuedDate: '15 May 2024', expiryDate: '15 May 2027', totalSavings: 38200, couponsUsed: 8, couponsTotal: 12, loyaltyPoints: 198000, loyaltyGoal: 250000, pendingDues: 0, totalSpend: 112000, lastVisit: 'Yesterday' },
  { id: '3', membershipId: 'YSM-2024-04003', fullName: 'Arjun Patel', firstName: 'Arjun', mobile: '+91 98250 20111', email: 'arjun.patel@gmail.com', membershipType: 'VIP MEMBER', status: 'Renewal Due', issuedDate: '10 Oct 2023', expiryDate: '10 Oct 2026', totalSavings: 19400, couponsUsed: 11, couponsTotal: 12, loyaltyPoints: 89000, loyaltyGoal: 250000, pendingDues: 15000, totalSpend: 54000, lastVisit: '5 days ago' },
  { id: '4', membershipId: 'YSM-2024-04004', fullName: 'Sneha Iyer', firstName: 'Sneha', mobile: '+91 98250 20222', email: 'sneha.iyer@gmail.com', membershipType: 'VIP MEMBER', status: 'Active', issuedDate: '01 Jan 2024', expiryDate: '01 Jan 2027', totalSavings: 22000, couponsUsed: 4, couponsTotal: 12, loyaltyPoints: 110000, loyaltyGoal: 250000, pendingDues: 0, totalSpend: 73000, lastVisit: '3 days ago' },
  { id: '5', membershipId: 'YSM-2024-04005', fullName: 'Kabir Joshi', firstName: 'Kabir', mobile: '+91 98250 20333', email: 'kabir.joshi@gmail.com', membershipType: 'BLACK DIAMOND', status: 'Active', issuedDate: '12 Dec 2023', expiryDate: '12 Dec 2026', totalSavings: 42000, couponsUsed: 9, couponsTotal: 12, loyaltyPoints: 215000, loyaltyGoal: 250000, pendingDues: 0, totalSpend: 145000, lastVisit: '2 days ago' },
];

export const fallbackReservations: Reservation[] = [
  { id: 1, bookingReference: 'R-2841', customerName: 'Rahul Mehta', customerMobile: '+91 98250 12345', outlet: 'Yanki Signature', reservationTime: 'Today, 8:30 PM', guests: 4, status: 'Confirmed', vip: true, specialRequests: 'Quiet corner table near garden' },
  { id: 2, bookingReference: 'R-2840', customerName: 'Priya Shah', customerMobile: '+91 98250 20000', outlet: 'Dough by Yanki', reservationTime: 'Tomorrow, 7:00 PM', guests: 2, status: 'Confirmed', vip: false },
  { id: 3, bookingReference: 'R-2839', customerName: 'Kabir Joshi', customerMobile: '+91 98250 20333', outlet: 'Yanki Lounge SG', reservationTime: '22 Oct, 9:00 PM', guests: 6, status: 'Pending', vip: true, specialRequests: 'Birthday decor celebration' },
  { id: 4, bookingReference: 'R-2838', customerName: 'Ananya Rao', customerMobile: '+91 98250 20666', outlet: 'Yanki Banquet', reservationTime: '25 Oct, 7:30 PM', guests: 80, status: 'Confirmed', vip: true, specialRequests: 'Banquet corporate get-together' },
];

export const fallbackCoupons: Coupon[] = [
  { id: 1, code: 'C-01', name: '50% Dining Discount', subtitle: 'Up to ₹2,000 off', description: '50% off on food and beverages', leftCount: 2, totalCount: 3, expiryDate: '30 Jun 2027', status: 'available', outlet: 'All Yanki Outlets', color: 'royal' },
  { id: 2, code: 'C-02', name: 'Birthday Special', subtitle: 'Complimentary cake + 30% off', description: 'Celebration cake with fireworks candle', leftCount: 1, totalCount: 1, expiryDate: '20 Jun 2027', status: 'available', outlet: 'Yanki Signature', color: 'gold' },
  { id: 3, code: 'C-03', name: 'Anniversary Special', subtitle: 'Free 3-course meal for 2', description: 'Candlelit chef tasting experience', leftCount: 1, totalCount: 1, expiryDate: '20 Jun 2027', status: 'available', outlet: 'Yanki Banquet', color: 'royal' },
  { id: 4, code: 'C-04', name: 'Corporate Discount', subtitle: '25% off on bills above ₹5,000', description: 'Monday through Friday dine-in', leftCount: 2, totalCount: 2, expiryDate: '31 Dec 2026', status: 'available', outlet: 'All Outlets', color: 'royal' },
  { id: 5, code: 'C-05', name: 'Dough by Yanki', subtitle: 'Buy 1 Get 1 Pizza', description: 'Woodfired sourdough pizzas', leftCount: 2, totalCount: 3, expiryDate: '30 Sep 2026', status: 'available', outlet: 'Dough by Yanki', color: 'gold' },
];

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

export const fallbackEvents: EventItem[] = [
  { id: "E-101", name: "Sangeet — Bhatia Family", type: "Banquet", date: "28 Jun 2026", guests: 220, value: 485000, status: "Confirmed" },
  { id: "E-102", name: "Corporate Annual Day — Infosys", type: "ODC", date: "02 Jul 2026", guests: 480, value: 920000, status: "Pipeline" },
  { id: "E-103", name: "Anniversary — Mehta", type: "Banquet", date: "10 Jul 2026", guests: 90, value: 215000, status: "Confirmed" },
  { id: "E-104", name: "Product Launch — Adani", type: "ODC", date: "18 Jul 2026", guests: 650, value: 1240000, status: "Confirmed" },
];

export const fallbackPendingPayments: PendingPayment[] = [
  { id: "YSM-2024-04001", name: "Rahul Mehta", mobile: "+91 98250 12345", pending: 15000, dueDate: "18 Jun 2026", reminder: "Sent 2d ago" },
  { id: "YSM-2024-04003", name: "Arjun Patel", mobile: "+91 98250 20111", pending: 15000, dueDate: "22 Jun 2026", reminder: "Not sent" },
  { id: "YSM-2024-04005", name: "Kabir Joshi", mobile: "+91 98250 20333", pending: 15000, dueDate: "28 Jun 2026", reminder: "Sent today" },
  { id: "YSM-2024-04015", name: "Yash Bhatt", mobile: "+91 98250 20999", pending: 15000, dueDate: "01 Jul 2026", reminder: "Sent 1w ago" },
];

export const fallbackStaffRoles: StaffRole[] = [
  { role: "Super Admin", count: 2, perms: ["All access"] },
  { role: "Finance Admin", count: 3, perms: ["Payments", "Revenue", "Refunds"] },
  { role: "Subscription Manager", count: 5, perms: ["Subscribers", "Renewals", "Coupons"] },
  { role: "Outlet Manager", count: 8, perms: ["Reservations", "Outlet view"] },
  { role: "Marketing Manager", count: 2, perms: ["Campaigns", "Notifications", "Segments"] },
];

export const fallbackFeedback: FeedbackItem[] = [
  { id: "FB-1048", user_id: "YSM-2024-04821", rating: 5, overall_rating: "Excellent", comment: "The team made our anniversary dinner feel truly special. Excellent hospitality and food quality.", created_at: "2026-09-23T19:10:00+05:30", profile: { full_name: "Rahul Mehta", membership_id: "YSM-2024-04821", mobile: "+91 98250 12345" } },
  { id: "FB-1047", user_id: "YSM-2024-04012", rating: 4, overall_rating: "Good", comment: "Reservation was seamless and the subscriber welcome was warm.", created_at: "2026-09-22T13:35:00+05:30", profile: { full_name: "Priya Shah", membership_id: "YSM-2024-04012", mobile: "+91 98250 20000" } },
  { id: "FB-1046", user_id: null, rating: 3, overall_rating: "Okay", comment: "Good sizzlers, but waiting time during peak weekend dinner could be shorter.", created_at: "2026-09-21T21:05:00+05:30", profile: null },
];

export const fallbackMarketingChannels: MarketingChannel[] = [
  { name: "Push Notifications", reach: "4,582 devices", open: "32%" },
  { name: "WhatsApp Campaign", reach: "5,128 numbers", open: "84%" },
  { name: "SMS Broadcast", reach: "5,128 numbers", open: "61%" },
];

export const fallbackCampaignPresets: CampaignPreset[] = [
  { name: "Birthday Privileges", desc: "Auto-trigger 24h before subscriber birthday with complimentary cake voucher.", tag: "AUTOMATED" },
  { name: "Renewal Journey", desc: "Trigger at 30 / 14 / 7 / 1 days before expiry across WhatsApp and Push.", tag: "JOURNEY" },
  { name: "Weekend Chef's Tasting", desc: "Curated audience: VIP subscribers visiting 2+ times in the last 30 days.", tag: "WEEKLY" },
];

