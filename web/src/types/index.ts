export interface Member {
  id: string | number;
  membershipId: string;
  fullName: string;
  firstName: string;
  mobile: string;
  email: string;
  membershipType: string;
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
  color: 'royal' | 'gold';
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
}

export interface Outlet {
  id: string | number;
  name: string;
  address: string;
  city: string;
  contactNumber: string;
  revenueLakhs: number;
  activeMembers: number;
  averageBillValue: number;
  couponsRedeemed: number;
  rating: number;
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

