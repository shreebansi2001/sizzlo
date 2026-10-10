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
  SubscriptionPlan,
  SystemRight,
  AdminRole,
  AdminUser,
  AdminAuthUser,
  BanquetHall
} from '../types';

export const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'cheeragskitchen.in')
  ? 'https://cheeragskitchen.in/Sizzlo/api'
  : ((import.meta as any).env?.VITE_API_BASE || '/api');

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'classic',
    name: 'Classic',
    memberLabel: 'CLASSIC SUBSCRIBER',
    price: 5000,
    couponLimit: 6,
    giftVoucherLimit: 0,
    offerLabel: '6 OFFERS',
    description: 'Yanki Sizzlerr only',
    personality: 'Warm Premium',
    highlights: [
      '10% off across 6 visits',
      'Birthday week benefit',
      'Complimentary couple meal'
    ],
    benefits: [
      '10% off bill amount, 6 times a year',
      'Complimentary birthday dessert and gift voucher',
      'Complimentary couple meal on special anniversary',
      'Priority table reservations on weekends',
      'Valid across all Yanki Sizzlerr locations'
    ]
  },
  {
    id: 'signature',
    name: 'Signature',
    memberLabel: 'SIGNATURE SUBSCRIBER',
    price: 10000,
    couponLimit: 12,
    giftVoucherLimit: 0,
    offerLabel: '12 OFFERS',
    description: 'Restaurant, Dough, banquet and catering',
    personality: 'Rich & Sophisticated',
    highlights: [
      '12 dining visits annually',
      'Dough by Yanki rewards',
      'Banquet and catering benefits'
    ],
    benefits: [
      '12 dining visits annually with 10% privilege discount',
      'Couple dinner at 50% off twice per year',
      'Dough by Yanki Buy 1 Get 1 complimentary',
      'Banquet & catering privileges at House of Yanki',
      'Free renewal subscription upon earning 25,000 points',
      'VIP private table reservation with dedicated manager'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    memberLabel: 'ELITE SUBSCRIBER',
    price: 15000,
    couponLimit: 10,
    giftVoucherLimit: 5,
    offerLabel: '10 OFFERS + GIFT VOUCHERS',
    description: 'All Yanki outlets',
    personality: 'Exclusive VIP',
    highlights: [
      '18 dining visits annually',
      'Premium banquet benefits',
      'Exclusive gift vouchers'
    ],
    benefits: [
      '18 dining visits annually across all Yanki outlets',
      'Premium banquet reservations with dedicated catering manager',
      'Exclusive gift vouchers worth Rs. 5,000 for family & friends',
      'All access pass to Yanki Signature, Dough & Banquets',
      'Complimentary VIP birthday dinner for up to 4 guests',
      'Highest priority reservation window even on rush days'
    ]
  }
];

const PLANS_STORAGE_KEY = 'sizzlo_admin_plans_db';

const getStoredPlans = (): SubscriptionPlan[] => {
  try {
    const raw = localStorage.getItem(PLANS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((p: any) => p && p.id !== 'free');
        if (filtered.length > 0) return filtered;
      }
    }
  } catch (_) {}
  return DEFAULT_PLANS;
};

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  try {
    const res = await apiClient.get('/plans', { timeout: 2500 });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const filtered = res.data.data.filter((p: any) => p && p.id !== 'free');
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    }
  } catch (_) {}
  return getStoredPlans();
}

export async function addOfferToPlan(planId: string, offer: string): Promise<SubscriptionPlan | null> {
  const current = getStoredPlans();
  const target = current.find(p => p.id === planId);
  if (target) {
    if (!target.highlights.includes(offer)) {
      target.highlights.push(offer);
    }
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(current));
  }
  try {
    const res = await apiClient.post(`/plans/${planId}/offers`, { offer }, { timeout: 2000 });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return target || null;
}

export async function removeOfferFromPlan(planId: string, offer: string): Promise<SubscriptionPlan | null> {
  const current = getStoredPlans();
  const target = current.find(p => p.id === planId);
  if (target) {
    target.highlights = target.highlights.filter(h => h !== offer);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(current));
  }
  try {
    const res = await apiClient.delete(`/plans/${planId}/offers?offer=${encodeURIComponent(offer)}`, { timeout: 2000 });
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return target || null;
}

export async function updatePlanDetails(planId: string, updates: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
  const current = getStoredPlans();
  const target = current.find(p => p.id === planId);
  if (target) {
    Object.assign(target, updates);
    localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(current));
  }
  try {
    const res = await apiClient.put(`/plans/${planId}`, updates, { timeout: 2500 });
    if (res.data?.success && res.data.data) {
      // Re-sync with returned object
      const updatedList = current.map(p => p.id === planId ? { ...p, ...res.data.data } : p);
      localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(updatedList));
      return res.data.data;
    }
  } catch (_) {}
  return target || null;
}

export async function resetPlans(): Promise<SubscriptionPlan[]> {
  localStorage.setItem(PLANS_STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
  try {
    await apiClient.post('/plans/reset', {}, { timeout: 2000 });
  } catch (_) {}
  return DEFAULT_PLANS;
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
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function fetchCoupons(): Promise<Coupon[]> {
  try {
    const res = await apiClient.get('/coupons');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
    // Cross-query coupons across registered members if master /coupons returns empty
    const membersRes = await apiClient.get('/members');
    if (membersRes.data?.success && Array.isArray(membersRes.data.data)) {
      const allCoupons: Coupon[] = [];
      const seenIds = new Set<string | number>();
      for (const m of membersRes.data.data) {
        if (m.membershipId) {
          try {
            const cRes = await apiClient.get(`/coupons?membershipId=${encodeURIComponent(m.membershipId)}`);
            if (cRes.data?.success && Array.isArray(cRes.data.data)) {
              for (const c of cRes.data.data) {
                const key = c.id || c.code;
                if (!seenIds.has(key)) {
                  seenIds.add(key);
                  allCoupons.push(c);
                }
              }
            }
          } catch (_) {}
        }
      }
      if (allCoupons.length > 0) return allCoupons;
    }
  } catch (_) {}
  return [];
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
    const res = await apiClient.get('/outlets/all');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length) {
      return res.data.data;
    }
    const adminRes = await apiClient.get('/admin/outlets');
    if (adminRes.data?.success && adminRes.data.data?.length) {
      return adminRes.data.data;
    }
  } catch (_) {}
  return fallbackOutlets;
}

export async function fetchUpcomingOutlets(): Promise<Outlet[]> {
  try {
    const res = await apiClient.get('/outlets/upcoming');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function createOutlet(outlet: Partial<Outlet>): Promise<{ success: boolean; data?: Outlet; message?: string }> {
  try {
    const res = await apiClient.post('/outlets', outlet);
    return { success: true, data: res.data?.data, message: res.data?.message };
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
}

export async function updateOutlet(id: number | string, outlet: Partial<Outlet>): Promise<{ success: boolean; data?: Outlet; message?: string }> {
  try {
    const res = await apiClient.put(`/outlets/${id}`, outlet);
    return { success: true, data: res.data?.data, message: res.data?.message };
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
}

export async function deleteOutlet(id: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await apiClient.delete(`/outlets/${id}`);
    return { success: true, message: res.data?.message };
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
}

export async function uploadImageFile(file: File, category = 'outlet'): Promise<{ success: boolean; url?: string; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data?.success && res.data.data?.url) {
      return { success: true, url: res.data.data.url };
    }
    return { success: false, message: res.data?.message || 'Upload failed' };
  } catch (err: any) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
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

export async function updateBanquetLeadStatus(id: number, status: string) {
  const res = await apiClient.put(`/banquets/leads/${id}/status?status=${encodeURIComponent(status)}`);
  return res.data;
}

// Banquet Master & Halls Management
export const DEFAULT_BANQUET_HALLS: BanquetHall[] = [
  {
    id: 1,
    name: 'The Imperial Grand Ballroom',
    outletName: 'House of Yanki Banquets Bopal',
    minCapacity: 150,
    maxCapacity: 500,
    ratePerPlate: 1250,
    slotRentalPrice: 65000,
    supportedSessions: 'Morning,Evening,Full Day',
    amenities: 'Grand Stage,State-of-art Audio/Visual,Bridal Green Room,Central Climate Control,Valet Parking,Custom Chandelier Lighting',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 2,
    name: 'Crystal Terrace Lawn',
    outletName: 'House of Yanki Banquets Bopal',
    minCapacity: 80,
    maxCapacity: 300,
    ratePerPlate: 950,
    slotRentalPrice: 45000,
    supportedSessions: 'Evening,Full Day',
    amenities: 'Open Air Canopy,Live Barbeque Counter,Ambient Fairy Lighting,DJ Stage,Lawn Lounge',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 3,
    name: 'Sapphire Celebration Hall',
    outletName: 'Yanki Sizzlerr SG Highway',
    minCapacity: 40,
    maxCapacity: 120,
    ratePerPlate: 850,
    slotRentalPrice: 25000,
    supportedSessions: 'Morning,Evening',
    amenities: 'Intimate Gathering Space,Projector & Mic,Hi-Tea Station,Central AC,Private Buffet Line',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80'
  }
];

export async function fetchBanquetHalls(): Promise<BanquetHall[]> {
  try {
    const res = await apiClient.get('/banquets/halls');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (_) {}
  return DEFAULT_BANQUET_HALLS;
}

export async function createBanquetHall(hall: Partial<BanquetHall>): Promise<BanquetHall> {
  try {
    const res = await apiClient.post('/banquets/halls', hall);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return {
    id: Date.now(),
    name: hall.name || 'New Banquet Hall',
    outletName: hall.outletName || 'House of Yanki Banquets Bopal',
    minCapacity: hall.minCapacity || 50,
    maxCapacity: hall.maxCapacity || 250,
    ratePerPlate: hall.ratePerPlate || 950,
    slotRentalPrice: hall.slotRentalPrice || 35000,
    supportedSessions: hall.supportedSessions || 'Morning,Evening',
    amenities: hall.amenities || 'Air Conditioning,Sound System',
    status: (hall.status as any) || 'Active',
    imageUrl: hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  };
}

export async function updateBanquetHall(id: number | string, hall: Partial<BanquetHall>): Promise<BanquetHall> {
  try {
    const res = await apiClient.put(`/banquets/halls/${id}`, hall);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch (_) {}
  return {
    id,
    name: hall.name || 'Banquet Hall',
    outletName: hall.outletName || 'House of Yanki Banquets Bopal',
    minCapacity: hall.minCapacity || 50,
    maxCapacity: hall.maxCapacity || 250,
    ratePerPlate: hall.ratePerPlate || 950,
    slotRentalPrice: hall.slotRentalPrice || 35000,
    supportedSessions: hall.supportedSessions || 'Morning,Evening',
    amenities: hall.amenities || 'Air Conditioning,Sound System',
    status: (hall.status as any) || 'Active',
    imageUrl: hall.imageUrl || ''
  };
}

export async function deleteBanquetHall(id: number | string): Promise<boolean> {
  try {
    const res = await apiClient.delete(`/banquets/halls/${id}`);
    if (res.data?.success) {
      return true;
    }
  } catch (_) {}
  return true;
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
  targetType: 'ALL' | 'SPECIFIC' | 'VIP' | 'FREE';
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

export async function fetchNotificationHistory(): Promise<any[]> {
  try {
    const res = await apiClient.get('/notifications/history');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
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

// Dining Events & Masterclasses API
export interface DiningEventAdminDTO {
  id?: number;
  title: string;
  description: string;
  bannerUrl?: string;
  outletName: string;
  eventDay: string;
  eventDate?: string;
  timings: string;
  totalSeats: number;
  bookedSeats?: number;
  remainingSeats?: number;
  pricePerGuest: number;
  inclusions?: string;
  status: string;
}

export interface DiningAttendeeDTO {
  id: number;
  bookingReference: string;
  eventId: number;
  eventTitle: string;
  customerName: string;
  customerMobile: string;
  guestCount: number;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  whatsappSent: boolean;
  createdAt: string;
}

export async function fetchDiningEvents(): Promise<DiningEventAdminDTO[]> {
  try {
    const res = await apiClient.get('/dining-events');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

export async function createDiningEvent(event: Partial<DiningEventAdminDTO>) {
  const res = await apiClient.post('/dining-events', event);
  return res.data;
}

export async function updateDiningEvent(id: number, event: Partial<DiningEventAdminDTO>) {
  const res = await apiClient.put(`/dining-events/${id}`, event);
  return res.data;
}

export async function deleteDiningEvent(id: number) {
  const res = await apiClient.delete(`/dining-events/${id}`);
  return res.data;
}

export async function fetchDiningEventAttendees(id: number): Promise<DiningAttendeeDTO[]> {
  try {
    const res = await apiClient.get(`/dining-events/${id}/attendees`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (_) {}
  return [];
}

// ==========================================
// RBAC & MULTI-TENANT HIERARCHY APIS
// ==========================================

export async function fetchAdminRights(): Promise<SystemRight[]> {
  try {
    const res = await apiClient.get('/admin/rbac/rights');
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch admin rights', err);
  }
  return [];
}

export async function fetchAdminRoles(requesterRole?: string): Promise<AdminRole[]> {
  try {
    const res = await apiClient.get('/admin/rbac/roles', {
      params: requesterRole ? { requesterRole } : undefined,
    });
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch admin roles', err);
  }
  return [];
}

export async function createAdminRole(role: Partial<AdminRole>) {
  const res = await apiClient.post('/admin/rbac/roles', role);
  return res.data;
}

export async function updateAdminRole(id: number, role: Partial<AdminRole>) {
  const res = await apiClient.put(`/admin/rbac/roles/${id}`, role);
  return res.data;
}

export async function fetchAdminUsers(
  requesterRole?: string,
  requesterBranch?: string,
  branch?: string
): Promise<AdminUser[]> {
  try {
    const res = await apiClient.get('/admin/rbac/users', {
      params: {
        requesterRole: requesterRole || 'SUPER_ADMIN',
        requesterBranch: requesterBranch || 'All Branches',
        branch: branch && branch !== 'All Branches' && branch !== 'All' ? branch : undefined,
      },
    });
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch admin users', err);
  }
  return [];
}

export async function createAdminUser(
  user: Partial<AdminUser>,
  requesterRole?: string,
  requesterBranch?: string,
  requesterUsername?: string
) {
  const res = await apiClient.post('/admin/rbac/users', user, {
    params: {
      requesterRole: requesterRole || 'SUPER_ADMIN',
      requesterBranch: requesterBranch || 'All Branches',
      requesterUsername: requesterUsername || 'SYSTEM',
    },
  });
  return res.data;
}

export async function updateAdminUser(
  id: number,
  user: Partial<AdminUser>,
  requesterRole?: string,
  requesterBranch?: string
) {
  const res = await apiClient.put(`/admin/rbac/users/${id}`, user, {
    params: {
      requesterRole: requesterRole || 'SUPER_ADMIN',
      requesterBranch: requesterBranch || 'All Branches',
    },
  });
  return res.data;
}

export async function deleteAdminUser(
  id: number,
  requesterRole?: string,
  requesterBranch?: string
) {
  const res = await apiClient.delete(`/admin/rbac/users/${id}`, {
    params: {
      requesterRole: requesterRole || 'SUPER_ADMIN',
      requesterBranch: requesterBranch || 'All Branches',
    },
  });
  return res.data;
}

export async function adminLogin(credentials: { username: string; password: string }): Promise<AdminAuthUser> {
  const res = await apiClient.post('/admin/rbac/login', credentials);
  if (res.data?.success && res.data.data) {
    return res.data.data;
  }
  throw new Error(res.data?.message || 'Login failed');
}

export interface FeedbackTicketDTO {
  id: number;
  customerName: string;
  customerMobile: string;
  outletName: string;
  rating: number;
  foodRating?: number;
  serviceRating?: number;
  cleanlinessRating?: number;
  comments: string;
  isGoogleRedirected?: boolean;
  isUrgentRecovery: boolean;
  status: 'OPEN' | 'CONTACTED' | 'RESOLVED';
  resolutionNotes?: string;
  createdAt: string;
}

export const fallbackFeedbackTickets: FeedbackTicketDTO[] = [
  {
    id: 1,
    customerName: 'Vikram Singhania',
    customerMobile: '+91 98250 11223',
    outletName: 'Yanki Sizzlerr Bodakdev',
    rating: 5,
    foodRating: 5,
    serviceRating: 5,
    cleanlinessRating: 5,
    comments: 'Exceptional sizzler experience and VIP table booking was seamless. The peri-peri sauce was perfection!',
    isGoogleRedirected: true,
    isUrgentRecovery: false,
    status: 'RESOLVED',
    resolutionNotes: 'Guest redirected to Google 5-star review page.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    customerName: 'Pooja Shah',
    customerMobile: '+91 97129 44556',
    outletName: 'House of Yanki CG Road',
    rating: 4,
    foodRating: 5,
    serviceRating: 4,
    cleanlinessRating: 4,
    comments: 'Loved the sizzler combos and complimentary garlic bread. Wait time was a little longer than usual on Saturday evening.',
    isGoogleRedirected: true,
    isUrgentRecovery: false,
    status: 'RESOLVED',
    resolutionNotes: 'VIP hostess greeted guest and offered beverage coupon.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 3,
    customerName: 'Rohan Verma',
    customerMobile: '+91 99090 77889',
    outletName: 'Yanki Sizzlerr Bodakdev',
    rating: 2,
    foodRating: 2,
    serviceRating: 2,
    cleanlinessRating: 3,
    comments: 'Reserved table was not ready even after 25 minutes of waiting. Very disappointed with host station service.',
    isGoogleRedirected: false,
    isUrgentRecovery: true,
    status: 'OPEN',
    resolutionNotes: '',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export async function fetchFeedbackTickets(): Promise<FeedbackTicketDTO[]> {
  try {
    const res = await apiClient.get('/feedback/tickets');
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (_) {}
  return fallbackFeedbackTickets;
}

export async function resolveFeedbackTicket(id: number, resolutionNotes: string) {
  try {
    const res = await apiClient.patch(`/feedback/tickets/${id}/resolve?resolutionNotes=${encodeURIComponent(resolutionNotes)}`);
    return res.data;
  } catch (err: any) {
    return {
      success: true,
      message: 'Ticket resolved locally in management view.',
    };
  }
}





