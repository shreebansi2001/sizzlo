export interface Member {
  id: string | number;
  membershipId: string;
  fullName: string;
  firstName: string;
  mobile: string;
  email: string;
  membershipType: string;
  subscriptionTier?: string;
  planId?: string;
  status: 'Active' | 'Renewal Due' | 'Expired';
  issuedDate: string;
  expiryDate: string;
  totalSavings: number;
  couponsUsed: number;
  couponsTotal: number;
  loyaltyPoints: number;
  loyaltyGoal: number;
  pendingDues: number;
  totalSpend: number;
  lastVisit: string;
}

export interface Coupon {
  id: string | number;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  leftCount: number;
  totalCount: number;
  expiryDate: string;
  status: 'available' | 'used' | 'expired';
  outlet: string;
  color: 'royal' | 'gold' | string;
  targetAudience?: string;
  vipOnly?: boolean;
  imageUrl?: string;
  discountType?: string;
  discountValue?: number;
}

export interface Reservation {
  id: string | number;
  bookingReference: string;
  customerName: string;
  customerMobile: string;
  outlet: string;
  reservationTime: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  vip: boolean;
  specialRequests?: string;
  tierPriorityTag?: string;
  bookingAdvance?: number;
  advancePaid?: boolean;
  advanceDeducted?: boolean;
  posSettlementId?: number;
  tableAssigned?: string;
  createdAt?: string;
}

export interface OutletTimeSlot {
  id: number;
  outlet: string;
  slotTime: string;
  session: 'LUNCH' | 'DINNER';
  active: boolean;
  maxCovers: number;
  displayOrder: number;
}

export interface Outlet {
  id: string | number;
  name: string;
  brand?: string;
  address: string;
  city: string;
  contactNumber: string;
  revenueLakhs: number;
  activeMembers: number;
  averageBillValue: number;
  couponsRedeemed: number;
  rating: number;
  isUpcoming?: boolean;
  conceptTag?: string;
  targetLaunchDate?: string;
  openingHours?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  subscribersCount?: number;
}

export interface KPI {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
}

export interface RevenuePoint {
  m: string;
  revenue: number;
  membership: number;
}

export interface AIInsight {
  title: string;
  body: string;
  tone: 'gold' | 'royal';
}

export interface EventItem {
  id: string;
  name: string;
  type: 'Banquet' | 'ODC';
  date: string;
  guests: number;
  value: number;
  status: 'Confirmed' | 'Pipeline';
}

export interface BanquetHall {
  id: number | string;
  name: string;
  outletName: string;
  minCapacity: number;
  maxCapacity: number;
  ratePerPlate?: number;
  slotRentalPrice?: number;
  supportedSessions?: string; // e.g. "Morning,Evening,Full Day"
  amenities?: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  imageUrl?: string;
}

export interface PendingPayment {
  id: string;
  name: string;
  mobile: string;
  pending: number;
  dueDate: string;
  reminder: string;
}

export interface StaffRole {
  role: string;
  count: number;
  perms: string[];
}

export interface FeedbackItem {
  id: string;
  user_id: string | null;
  rating: number;
  overall_rating: string;
  comment: string;
  created_at: string;
  profile: {
    full_name: string;
    membership_id: string;
    mobile: string;
  } | null;
}

export interface MarketingChannel {
  name: string;
  reach: string;
  open: string;
}

export interface CampaignPreset {
  name: string;
  desc: string;
  tag: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  memberLabel: string;
  price: number;
  couponLimit: number;
  giftVoucherLimit: number;
  offerLabel: string;
  description: string;
  personality: string;
  highlights: string[];
  benefits?: string[];
}

export interface SystemRight {
  code: string;
  name: string;
  category: string;
  description: string;
}

export interface AdminRole {
  id?: number;
  roleCode: string;
  roleName: string;
  description: string;
  level: number;
  permissions: string;
  isSystem: boolean;
}

export interface AdminUser {
  id?: number;
  username: string;
  email: string;
  fullName: string;
  mobile?: string;
  password?: string;
  roleCode: string;
  roleName?: string;
  branchName: string;
  outletId?: number;
  customPermissions?: string;
  createdByUsername?: string;
  active: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface AdminAuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  mobile?: string;
  roleCode: string;
  roleName: string;
  roleLevel: number;
  branchName: string;
  outletId?: number;
  permissions: string[];
}

