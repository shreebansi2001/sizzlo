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

