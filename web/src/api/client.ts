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
  CampaignPreset,
  SubscriptionPlan
} from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await apiClient.get('/plans');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function addOfferToPlan(planId: string, offer: string): Promise<SubscriptionPlan | null> {
  try {
    const res = await apiClient.post(`/plans/${planId}/offers`, { offer });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to add offer to plan', err);
  }
  return null;
}

export async function removeOfferFromPlan(planId: string, offer: string): Promise<SubscriptionPlan | null> {
  try {
    const res = await apiClient.delete(`/plans/${planId}/offers?offer=${encodeURIComponent(offer)}`);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to remove offer from plan', err);
  }
  return null;
}

export async function resetPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await apiClient.post('/plans/reset');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

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

export const fallbackEvents: EventItem[] = [
  { id: 'EV-101', name: 'Zydus Corporate Executive Dinner', type: 'Banquet', date: 'Tonight, 8:00 PM', guests: 65, value: 245000, status: 'Confirmed' },
  { id: 'EV-102', name: 'Mehta 25th Wedding Anniversary', type: 'Banquet', date: 'Tomorrow, 7:30 PM', guests: 120, value: 480000, status: 'Confirmed' },
  { id: 'EV-103', name: 'Adani Green Tech Summit Luncheon', type: 'ODC', date: '28 Oct, 1:00 PM', guests: 250, value: 850000, status: 'Pipeline' },
  { id: 'EV-104', name: 'Patel Family Royal Reception', type: 'Banquet', date: '04 Nov, 8:00 PM', guests: 180, value: 620000, status: 'Confirmed' },
  { id: 'EV-105', name: 'Torrent Pharma Product Launch Dinner', type: 'ODC', date: '12 Nov, 7:00 PM', guests: 90, value: 310000, status: 'Pipeline' },
];

export const fallbackPendingPayments: PendingPayment[] = [
  { id: 'PAY-8821', name: 'Devang Parikh (Elite VIP)', mobile: '+91 98250 88211', pending: 18500, dueDate: 'Due in 3 days', reminder: 'WhatsApp Sent' },
  { id: 'PAY-8822', name: 'Shah Synthetics Corporate Tab', mobile: '+91 98250 44102', pending: 45000, dueDate: 'Due today', reminder: 'Invoice Emailed' },
  { id: 'PAY-8823', name: 'Sunil Choksi (Signature Plan)', mobile: '+91 98250 99283', pending: 10000, dueDate: 'Due in 5 days', reminder: 'SMS Queued' },
  { id: 'PAY-8824', name: 'Kavita Vora (Classic Plan)', mobile: '+91 98250 11299', pending: 5000, dueDate: 'Due in 1 day', reminder: 'WhatsApp Sent' },
];

export const fallbackStaffRoles: StaffRole[] = [
  { role: 'General Manager (Operations)', count: 4, perms: ['Full Telemetry Access', 'Refund Authority', 'Floor Overrides', 'RBAC Security'] },
  { role: 'Hostess & Reservation Desk', count: 12, perms: ['Floor Management', 'Waitlist Control', 'Table Allocation', 'Patron Lookups'] },
  { role: 'Sommelier & Head Chef', count: 8, perms: ['Tasting Menus', 'VIP Special Requests', 'Kitchen KDS Telemetry'] },
  { role: 'Billing & POS Cashier', count: 16, perms: ['Voucher Counter Verification', 'Bill Settlement', 'Loyalty Redemptions'] },
];

export const fallbackFeedback: FeedbackItem[] = [
  {
    id: 'FB-901',
    user_id: '1',
    rating: 5,
    overall_rating: '5.0 / 5.0',
    comment: 'Exceptional dining at Yanki Signature Bodakdev. Redemptions were instant, and staff recognized our VIP tier immediately. The sizzler platter was flawless!',
    created_at: 'Today, 2:30 PM',
    profile: {
      full_name: 'Rahul Mehta',
      membership_id: 'YSM-2024-04821',
      mobile: '+91 98250 12345',
    }
  },
  {
    id: 'FB-902',
    user_id: '2',
    rating: 5,
    overall_rating: '5.0 / 5.0',
    comment: 'Celebrated our anniversary at the banquet lounge. The complimentary anniversary meal and dessert courtesy of Signature Subscription made it truly special.',
    created_at: 'Yesterday',
    profile: {
      full_name: 'Priya Shah',
      membership_id: 'YSM-2024-04002',
      mobile: '+91 98250 20000',
    }
  },
  {
    id: 'FB-903',
    user_id: '3',
    rating: 5,
    overall_rating: '4.9 / 5.0',
    comment: 'Woodfired pizzas at Dough by Yanki on Buy 1 Get 1 offer are unmatched in Ahmedabad. Quick QR verification on my phone.',
    created_at: '2 days ago',
    profile: {
      full_name: 'Kabir Joshi',
      membership_id: 'YSM-2024-04005',
      mobile: '+91 98250 20333',
    }
  }
];

export const fallbackMarketingChannels: MarketingChannel[] = [
  { name: 'WhatsApp VIP Broadcast', reach: '1,420 Patrons', open: '94.2%' },
  { name: 'SMS Privilege Alerts', reach: '3,850 Leads', open: '78.5%' },
  { name: 'Luxury Concierge Email', reach: '980 Patrons', open: '62.4%' },
];

export const fallbackCampaignPresets: CampaignPreset[] = [
  { name: 'Weekend Sizzler Festival', desc: 'Complimentary craft beverage with Signature Sizzler', tag: 'Dine-In' },
  { name: 'VIP Birthday Week Treat', desc: 'Complimentary chef celebration cake & 30% discount', tag: 'Privilege' },
  { name: 'Banquet Festive Early Bird', desc: '15% savings on advance bookings for celebrations above 50 pax', tag: 'Events' },
];

// ==========================================
// SIZZLO SRS v2.4 ENTERPRISE OPERATIONS APIS
// ==========================================

export interface BillSettlementDTO {
  id: number;
  userId: number;
  customerName: string;
  customerMobile: string;
  outletName: string;
  posInvoiceNumber: string;
  grossAmount: number;
  discountAmount: number;
  netPayable: number;
  couponCode: string;
  paymentMode: 'CASH' | 'CARD' | 'ONLINE' | 'STORE_QR';
  upiUtr?: string;
  status: 'PENDING_APPROVAL' | 'PAID' | 'REJECTED';
  pointsCredited: number;
  cashierId?: string;
  createdAt: string;
  approvedAt?: string;
  tableAdvanceDeduction?: number;
  receiptImageUrl?: string;
  bookingReference?: string;
}

export interface ShiftSummaryDTO {
  shiftDate: string;
  totalTransactions: number;
  cashRevenue: number;
  cardRevenue: number;
  onlineRevenue: number;
  qrRevenue: number;
  totalRevenue: number;
  totalDiscounts: number;
  newSubscriptionsEnrolled: number;
  reconciliationStatus: string;
}

export interface BanquetLeadDTO {
  id: number;
  userId: number;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  eventCategory: string;
  targetDate: string;
  shift: string;
  paxCount: number;
  customRequirements?: string;
  status: string;
  assignedTo?: string;
  createdAt: string;
}

export interface CorporateLeadDTO {
  id: number;
  companyName: string;
  gstNumber: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  totalEmployees: number;
  planTier: string;
  dealValue: number;
  stage: string;
  assignedBde: string;
  approvedByTl: boolean;
  notes?: string;
  createdAt: string;
}

export interface IncentiveLedgerDTO {
  staffId: string;
  staffName: string;
  role: string;
  outletOrAccount: string;
  plansSoldOrDealValue: number;
  target: number;
  achievementPercent: number;
  baseCommission: number;
  bonus: number;
  totalCommission: number;
  status: string;
}

export interface SalesTargetDTO {
  id: number;
  periodMonth: string;
  masterRevenueTarget: number;
  floorSalesQuota: number;
  corporateSalesQuota: number;
  achievedFloorRevenue: number;
  achievedCorporateRevenue: number;
  totalAchievedRevenue: number;
  payrollApproved: boolean;
}

// Cashier Multi-Mode Billing
export async function fetchPendingBills(): Promise<BillSettlementDTO[]> {
  try {
    const res = await apiClient.get('/bills/pending');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function approveBill(billId: number, cashierId: string = 'CSH-01') {
  const res = await apiClient.post(`/bills/${billId}/approve?cashierId=${encodeURIComponent(cashierId)}`);
  return res.data;
}

export async function rejectBill(billId: number, reason: string = 'Discrepancy in receipt') {
  const res = await apiClient.post(`/bills/${billId}/reject?reason=${encodeURIComponent(reason)}`);
  return res.data;
}

export async function fetchShiftSummary(): Promise<ShiftSummaryDTO | null> {
  try {
    const res = await apiClient.get('/bills/shift-summary');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return null;
}

// Banquet & ODC Leads
export async function fetchBanquetLeads(): Promise<BanquetLeadDTO[]> {
  try {
    const res = await apiClient.get('/banquets/leads');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function assignBanquetLead(id: number, assignedTo: string) {
  const res = await apiClient.put(`/banquets/leads/${id}/assign?assignedTo=${encodeURIComponent(assignedTo)}`);
  return res.data;
}

// Sales Operations: Targets, Floor & Corporate
export async function fetchSalesTargets(): Promise<SalesTargetDTO[]> {
  try {
    const res = await apiClient.get('/sales/targets');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function bifurcateTarget(masterTarget: number, floorQuota: number, corporateQuota: number) {
  const res = await apiClient.post('/sales/targets/bifurcate', {
    masterTarget,
    floorQuota,
    corporateQuota,
    month: 'CURRENT'
  });
  return res.data;
}

export async function quickEnrollFloor(payload: {
  customerMobile: string;
  customerName: string;
  planTier: string;
  captainId: string;
  captainName: string;
  paymentMode: string;
}) {
  const res = await apiClient.post('/sales/floor/quick-enroll', payload);
  return res.data;
}

export async function fetchCorporateLeads(): Promise<CorporateLeadDTO[]> {
  try {
    const res = await apiClient.get('/sales/corporate-leads');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function updateCorporateLeadStage(id: number, stage: string) {
  const res = await apiClient.put(`/sales/corporate-leads/${id}/stage?stage=${encodeURIComponent(stage)}`);
  return res.data;
}

export async function approveCorporateDeal(id: number) {
  const res = await apiClient.post(`/sales/corporate-leads/${id}/approve`);
  return res.data;
}

export async function bulkEnrollCorporate(leadId: number, employees: { name: string; mobile: string }[]) {
  const res = await apiClient.post(`/sales/corporate-leads/${leadId}/bulk-enroll`, employees);
  return res.data;
}

export async function fetchIncentiveLedger(): Promise<IncentiveLedgerDTO[]> {
  try {
    const res = await apiClient.get('/sales/incentives');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function approvePayroll() {
  const res = await apiClient.post('/sales/incentives/approve-payroll');
  return res.data;
}

export async function updateReservationStatus(id: number | string, status: string) {
  const res = await apiClient.put(`/reservations/${id}/status?status=${encodeURIComponent(status)}`);
  return res.data;
}

export interface RazorpayTransactionDTO {
  orderId: string;
  paymentId: string;
  customerName: string;
  customerMobile: string;
  type: string;
  planId?: string;
  posInvoiceNumber?: string;
  amount: number;
  status: string;
  gatewayStatus: string;
  channel?: string;
  timestamp: string;
}

export interface RazorpaySummaryDTO {
  totalTransactions: number;
  totalVolumeInRupees: number;
  keyId: string;
  currency: string;
  status: string;
  webhookStatus: string;
  autoSettlementEnabled: boolean;
}

export async function fetchRazorpayTransactions(): Promise<RazorpayTransactionDTO[]> {
  try {
    const res = await apiClient.get('/payments/razorpay/transactions');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function fetchRazorpaySummary(): Promise<RazorpaySummaryDTO | null> {
  try {
    const res = await apiClient.get('/payments/razorpay/summary');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return null;
}

export interface SendNotificationPayload {
  targetType: 'ALL' | 'SPECIFIC';
  targetMembershipId?: string;
  targetMobile?: string;
  title: string;
  message: string;
  type?: 'tag' | 'gift' | 'sparkle' | 'alert' | 'bill' | 'card';
  sendWhatsApp?: boolean;
}

export async function sendNotification(payload: SendNotificationPayload) {
  try {
    const res = await apiClient.post('/notifications/send', payload);
    return res.data;
  } catch (err: any) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Failed to dispatch notification',
    };
  }
}

// Dynamic Outlet Time Slots API
export async function fetchTimeSlots(outlet?: string) {
  try {
    const res = await apiClient.get('/reservations/slots', { params: { outlet } });
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function fetchAllTimeSlots() {
  try {
    const res = await apiClient.get('/reservations/slots/all');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function createTimeSlot(slot: {
  outlet: string;
  slotTime: string;
  session: 'LUNCH' | 'DINNER';
  active?: boolean;
}) {
  const res = await apiClient.post('/reservations/slots', slot);
  return res.data;
}

export async function toggleTimeSlot(id: number) {
  const res = await apiClient.put(`/reservations/slots/${id}/toggle`);
  return res.data;
}

export async function deleteTimeSlot(id: number) {
  const res = await apiClient.delete(`/reservations/slots/${id}`);
  return res.data;
}

// Live Daily Traffic & VIP Priority Queue API
export async function fetchTodayTraffic() {
  try {
    const res = await apiClient.get('/reservations/traffic/today');
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return null;
}


