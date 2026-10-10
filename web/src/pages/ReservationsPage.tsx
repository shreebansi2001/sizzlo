import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Crown, 
  Calendar, 
  Clock, 
  Users, 
  Check, 
  X, 
  Search, 
  Filter, 
  MapPin, 
  UtensilsCrossed, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  Armchair,
  AlertCircle,
  CheckCircle2,
  ListOrdered,
  History,
  CalendarDays,
  ArrowRight,
  Building2,
  Trash2,
  Edit3,
  PartyPopper,
  ShieldCheck,
  Layers,
  Settings
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Reservation, OutletTimeSlot, Outlet, BanquetHall } from '../types';
import { 
  fetchAllTimeSlots, 
  createTimeSlot, 
  toggleTimeSlot, 
  deleteTimeSlot, 
  fetchOutlets,
  fetchBanquetHalls,
  createBanquetHall,
  updateBanquetHall,
  deleteBanquetHall,
  DEFAULT_BANQUET_HALLS
} from '../api/client';

interface ReservationsPageProps {
  reservations: Reservation[];
  onRefresh?: () => void;
}

const peakHoursData = [
  { h: '12 PM', v: 34 },
  { h: '1 PM', v: 52 },
  { h: '2 PM', v: 28 },
  { h: '7 PM', v: 76 },
  { h: '8 PM', v: 118 },
  { h: '9 PM', v: 94 },
  { h: '10 PM', v: 42 }
];

interface UpcomingItem {
  dbId: string | number;
  id: string;
  customer: string;
  mobile?: string;
  outlet: string;
  date: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Seated' | 'Waitlisted';
  vip: boolean;
  tierPriorityTag?: string;
  bookingAdvance?: number;
  advancePaid?: boolean;
  advanceDeducted?: boolean;
  notes?: string;
  tableAssigned?: string;
  createdAt?: string;
}

const DEFAULT_MOCK_BOOKINGS: UpcomingItem[] = [
  // LAST WEEK (Past History: 1 Oct - 7 Oct 2026)
  {
    dbId: 'hist-1',
    id: 'R-1920',
    customer: 'Vikram Malhotra',
    mobile: '+91 98251 44321',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: '05 Oct 2026, 08:00 PM',
    guests: 2,
    status: 'Completed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Window booth · Couple anniversary dinner',
    tableAssigned: 'T4',
    createdAt: '2026-10-05T14:30:00.000'
  },
  {
    dbId: 'hist-2',
    id: 'R-1921',
    customer: 'Ananya Singhania',
    mobile: '+91 98980 11223',
    outlet: 'Yanki Sizzlerr SG Highway',
    date: '04 Oct 2026, 08:30 PM',
    guests: 4,
    status: 'Completed',
    vip: true,
    tierPriorityTag: 'Elite',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Family dinner celebration',
    tableAssigned: 'T8',
    createdAt: '2026-10-04T12:00:00.000'
  },
  {
    dbId: 'hist-3',
    id: 'R-1922',
    customer: 'Rohan & Ritu Verma',
    mobile: '+91 97240 88990',
    outlet: 'Dough by Yanki CG Road',
    date: '03 Oct 2026, 07:45 PM',
    guests: 2,
    status: 'Completed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Artisan sourdough & desserts tasting',
    tableAssigned: 'T2',
    createdAt: '2026-10-03T16:15:00.000'
  },
  {
    dbId: 'hist-4',
    id: 'R-1923',
    customer: 'Sameer Desai',
    mobile: '+91 99090 33445',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: '02 Oct 2026, 09:00 PM',
    guests: 6,
    status: 'Completed',
    vip: true,
    tierPriorityTag: 'Gold',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Corporate client dinner',
    tableAssigned: 'T11',
    createdAt: '2026-10-02T18:40:00.000'
  },
  {
    dbId: 'hist-5',
    id: 'R-1924',
    customer: 'Pooja Bhatt',
    mobile: '+91 98255 77665',
    outlet: 'Yanki Sizzlerr Vastrapur Lake',
    date: '01 Oct 2026, 08:15 PM',
    guests: 2,
    status: 'Completed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Lakeside deck table',
    tableAssigned: 'T1',
    createdAt: '2026-10-01T15:00:00.000'
  },

  // YESTERDAY (Past History: 9 Oct 2026)
  {
    dbId: 'hist-6',
    id: 'R-2101',
    customer: 'Rohit Sharma',
    mobile: '+91 99887 76655',
    outlet: 'Navrangpura',
    date: '09 Oct 2026, 08:30 PM',
    guests: 4,
    status: 'Completed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Birthday celebration table',
    tableAssigned: 'T5',
    createdAt: '2026-10-09T12:40:03.893'
  },
  {
    dbId: 'hist-7',
    id: 'R-2102',
    customer: 'Aakash Dave',
    mobile: '+91 97123 45678',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: '09 Oct 2026, 01:00 PM',
    guests: 2,
    status: 'Completed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: true,
    notes: 'Lunch sizzler tasting',
    tableAssigned: 'T3',
    createdAt: '2026-10-09T10:15:00.000'
  },

  // TODAY (10 Oct 2026)
  {
    dbId: 'today-1',
    id: 'R-2841',
    customer: 'Rahul Mehta',
    mobile: '+91 98250 12345',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: 'Today, 08:30 PM',
    guests: 4,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Table 4 reserved - VIP booth',
    tableAssigned: 'T4',
    createdAt: '2026-10-10T09:00:00.000'
  },
  {
    dbId: 'today-2',
    id: 'R-3610',
    customer: 'Dipa Patel',
    mobile: '+91 88495 77644',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: 'Today, 12:30 PM',
    guests: 2,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Quiet couple table for lunch',
    tableAssigned: 'T2',
    createdAt: '2026-10-10T10:30:00.000'
  },
  {
    dbId: 'today-3',
    id: 'R-3612',
    customer: 'Kunal Shah',
    mobile: '+91 98790 65432',
    outlet: 'Dough by Yanki CG Road',
    date: 'Today, 08:15 PM',
    guests: 2,
    status: 'Waitlisted',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Couple seating near dessert bar',
    createdAt: '2026-10-10T11:00:00.000'
  },
  {
    dbId: 'today-4',
    id: 'R-3615',
    customer: 'Neha Parikh',
    mobile: '+91 98240 55112',
    outlet: 'Yanki Sizzlerr SG Highway',
    date: 'Today, 09:00 PM',
    guests: 2,
    status: 'Confirmed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Couple table reservation',
    createdAt: '2026-10-10T11:15:00.000'
  },

  // TOMORROW (11 Oct 2026)
  {
    dbId: 'tmrw-1',
    id: 'R-2840',
    customer: 'Priya Shah',
    mobile: '+91 98250 20000',
    outlet: 'Dough by Yanki CG Road',
    date: 'Tomorrow, 07:00 PM',
    guests: 2,
    status: 'Confirmed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 100,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Near bakery counter',
    createdAt: '2026-10-10T11:30:00.000'
  },
  {
    dbId: 'tmrw-2',
    id: 'R-2839',
    customer: 'Kabir Joshi',
    mobile: '+91 98250 20333',
    outlet: 'Yanki Sizzlerr SG Highway',
    date: 'Tomorrow, 09:00 PM',
    guests: 6,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Elite',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Elite Gold VIP Table T1',
    tableAssigned: 'T1',
    createdAt: '2026-10-10T11:45:00.000'
  },
  {
    dbId: 'tmrw-3',
    id: 'R-2842',
    customer: 'Parthiv Patel',
    mobile: '+91 99130 44556',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: 'Tomorrow, 08:30 PM',
    guests: 2,
    status: 'Confirmed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Couple dinner',
    createdAt: '2026-10-10T12:00:00.000'
  },

  // FUTURE BOOKINGS (Next Week & Later: 14 Oct - 12 Nov 2026)
  {
    dbId: 'fut-1',
    id: 'R-3901',
    customer: 'Hardik Pandya',
    mobile: '+91 98250 99887',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: '14 Oct 2026, 08:30 PM',
    guests: 2,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Elite',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'VIP Couple Booth · Pre-order sizzler',
    createdAt: '2026-10-10T12:15:00.000'
  },
  {
    dbId: 'fut-2',
    id: 'R-3902',
    customer: 'Meera Sodha',
    mobile: '+91 98791 22334',
    outlet: 'House of Yanki Banquets Bopal',
    date: '18 Oct 2026, 01:00 PM',
    guests: 4,
    status: 'Confirmed',
    vip: false,
    tierPriorityTag: 'Non-Subscriber',
    bookingAdvance: 99,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Sunday Brunch celebration pass',
    createdAt: '2026-10-10T12:30:00.000'
  },
  {
    dbId: 'fut-3',
    id: 'R-3903',
    customer: 'Tanvi & Aarav',
    mobile: '+91 99240 77889',
    outlet: 'Yanki Sizzlerr SG Highway',
    date: '22 Oct 2026, 08:00 PM',
    guests: 2,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Romantic couple dinner table',
    createdAt: '2026-10-10T12:45:00.000'
  },
  {
    dbId: 'fut-4',
    id: 'R-3904',
    customer: 'Dr. Kirit Trivedi',
    mobile: '+91 98252 66778',
    outlet: 'Yanki Sizzlerr Vastrapur Lake',
    date: '28 Oct 2026, 07:30 PM',
    guests: 8,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Doctors association dinner party',
    createdAt: '2026-10-10T13:00:00.000'
  },
  {
    dbId: 'fut-5',
    id: 'R-4101',
    customer: 'Diwanji Family',
    mobile: '+91 98240 11223',
    outlet: 'House of Yanki Banquets Bopal',
    date: '05 Nov 2026, 08:00 PM',
    guests: 12,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Elite',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Pre-Diwali family banquet feast',
    createdAt: '2026-10-10T13:15:00.000'
  },
  {
    dbId: 'fut-6',
    id: 'R-4102',
    customer: 'Shalin & Bansi',
    mobile: '+91 99099 88112',
    outlet: 'Yanki Sizzlerr Bodakdev',
    date: '12 Nov 2026, 08:30 PM',
    guests: 2,
    status: 'Confirmed',
    vip: true,
    tierPriorityTag: 'Signature',
    bookingAdvance: 0,
    advancePaid: true,
    advanceDeducted: false,
    notes: 'Couple booth table reservation',
    createdAt: '2026-10-10T13:30:00.000'
  }
];

// ==============================================================
// Web Audio API: Zomato / Swiggy-Style Order Notification Chime
// ==============================================================
const playZomatoAlertSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.35) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(gainVal, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // Signature Zomato / Swiggy restaurant order chime:
    // Chime 1: Rising 3-note arpeggio (D5 -> A5 -> D6)
    playTone(587.33, now, 0.14, 'sine', 0.4);
    playTone(880.00, now + 0.14, 0.14, 'sine', 0.45);
    playTone(1174.66, now + 0.28, 0.38, 'triangle', 0.5);

    // Chime 2 repeat (after 0.35s gap)
    playTone(587.33, now + 0.68, 0.14, 'sine', 0.4);
    playTone(880.00, now + 0.82, 0.14, 'sine', 0.45);
    playTone(1174.66, now + 0.96, 0.55, 'triangle', 0.55);
  } catch (err) {
    console.error('Audio alert playback error:', err);
  }
};

export interface BanquetBookingItem {
  id: string;
  eventName: string;
  hostName: string;
  mobile: string;
  outlet: string;
  hallName: string;
  date: string; // ISO date 'YYYY-MM-DD'
  displayDate: string; // '10 Oct 2026'
  session: 'Morning' | 'Evening' | 'Full Day';
  timeSlot: string;
  guests: number;
  ratePerPlate: number;
  slotRentalPrice: number;
  totalEstimatedAmount: number;
  advancePaid: number;
  status: 'Confirmed' | 'Tentative' | 'Completed' | 'Cancelled';
  cateringType: 'Pure Veg Royal Feast' | 'Jain Gourmet Special' | 'Multi-Cuisine Gala' | 'Cocktail & Hi-Tea';
  notes: string;
  amenitiesRequested: string[];
}

export const DEFAULT_BANQUET_EVENTS: BanquetBookingItem[] = [
  // 1. TODAY: Evening Wedding Reception at Bopal Imperial Ballroom
  {
    id: 'BQ-2026-101',
    eventName: 'Pooja & Rohan Grand Wedding Reception',
    hostName: 'Dr. Rohan Bhatt',
    mobile: '+91 98250 88214',
    outlet: 'House of Yanki Banquets Bopal',
    hallName: 'The Imperial Grand Ballroom',
    date: '2026-10-10',
    displayDate: '10 Oct 2026',
    session: 'Evening',
    timeSlot: '07:00 PM – 12:00 AM',
    guests: 420,
    ratePerPlate: 1250,
    slotRentalPrice: 65000,
    totalEstimatedAmount: 590000,
    advancePaid: 250000,
    status: 'Confirmed',
    cateringType: 'Pure Veg Royal Feast',
    notes: 'Stage backdrop with fresh florals, LED entrance tunnel, 4-tier mocktail pyramid',
    amenitiesRequested: ['Grand Stage', 'Audio/Visual', 'Bridal Green Room', 'Valet Parking', 'Central AC']
  },
  // 2. TODAY: Morning Corporate Conclave at SG Highway Sapphire Celebration Hall
  {
    id: 'BQ-2026-102',
    eventName: 'Zydus Lifesciences Annual Dealer Conclave',
    hostName: 'Kunal Singhania (VP Sales)',
    mobile: '+91 98795 33100',
    outlet: 'Yanki Sizzlerr SG Highway',
    hallName: 'Sapphire Celebration Hall',
    date: '2026-10-10',
    displayDate: '10 Oct 2026',
    session: 'Morning',
    timeSlot: '10:00 AM – 03:30 PM',
    guests: 85,
    ratePerPlate: 850,
    slotRentalPrice: 25000,
    totalEstimatedAmount: 97250,
    advancePaid: 50000,
    status: 'Confirmed',
    cateringType: 'Cocktail & Hi-Tea',
    notes: 'Podium with 2 wireless mics, 4K projector for Q3 sales deck presentation, hot sizzler hi-tea',
    amenitiesRequested: ['Projector & Mic', 'Hi-Tea Station', 'Central AC', 'Private Buffet Line']
  },
  // 3. THIS WEEK: 12 Oct 2026 - Mehta Silver Jubilee Sangeet at Bopal Crystal Terrace Lawn
  {
    id: 'BQ-2026-103',
    eventName: 'Mehta Silver Jubilee 25th Anniversary Sangeet',
    hostName: 'Pravin Mehta',
    mobile: '+91 98240 66722',
    outlet: 'House of Yanki Banquets Bopal',
    hallName: 'Crystal Terrace Lawn',
    date: '2026-10-12',
    displayDate: '12 Oct 2026',
    session: 'Evening',
    timeSlot: '06:30 PM – 11:30 PM',
    guests: 220,
    ratePerPlate: 950,
    slotRentalPrice: 45000,
    totalEstimatedAmount: 254000,
    advancePaid: 100000,
    status: 'Confirmed',
    cateringType: 'Jain Gourmet Special',
    notes: 'Open air lawn fairy lights, wooden dance floor, acoustic live band setup',
    amenitiesRequested: ['Open Air Canopy', 'Live Barbeque Counter', 'DJ Stage', 'Lawn Lounge']
  },
  // 4. THIS MONTH: 16 Oct 2026 - Adani Capital Leadership Summit
  {
    id: 'BQ-2026-104',
    eventName: 'Adani Capital Executive Leadership Summit',
    hostName: 'Priyanka Desai (HR Dir)',
    mobile: '+91 99099 12450',
    outlet: 'House of Yanki Banquets Bopal',
    hallName: 'The Imperial Grand Ballroom',
    date: '2026-10-16',
    displayDate: '16 Oct 2026',
    session: 'Full Day',
    timeSlot: '09:00 AM – 09:00 PM',
    guests: 260,
    ratePerPlate: 1400,
    slotRentalPrice: 90000,
    totalEstimatedAmount: 454000,
    advancePaid: 200000,
    status: 'Confirmed',
    cateringType: 'Multi-Cuisine Gala',
    notes: 'Full day keynote, 3 rounds of gourmet artisan coffee & hors doeuvres, continental dinner',
    amenitiesRequested: ['Grand Stage', 'Audio/Visual', 'Central Climate Control', 'Valet Parking']
  },
  // 5. FUTURE: 24 Oct 2026 - Pre-Diwali Corporate Gala
  {
    id: 'BQ-2026-105',
    eventName: 'Torrent Pharma Pre-Diwali Family Gala',
    hostName: 'Alok Trivedi',
    mobile: '+91 98251 77309',
    outlet: 'House of Yanki Banquets Bopal',
    hallName: 'The Imperial Grand Ballroom',
    date: '2026-10-24',
    displayDate: '24 Oct 2026',
    session: 'Evening',
    timeSlot: '07:30 PM – 12:00 AM',
    guests: 480,
    ratePerPlate: 1350,
    slotRentalPrice: 65000,
    totalEstimatedAmount: 713000,
    advancePaid: 350000,
    status: 'Confirmed',
    cateringType: 'Pure Veg Royal Feast',
    notes: 'Festive traditional decor, diya chandeliers, signature live sizzler stations',
    amenitiesRequested: ['Grand Stage', 'Custom Chandelier Lighting', 'Valet Parking', 'Central AC']
  },
  // 6. LAST WEEK (Past History): 05 Oct 2026
  {
    id: 'BQ-2026-106',
    eventName: 'Shroff 50th Milestone Birthday Celebration',
    hostName: 'Sameer Shroff',
    mobile: '+91 97129 44883',
    outlet: 'House of Yanki Banquets Bopal',
    hallName: 'Crystal Terrace Lawn',
    date: '2026-10-05',
    displayDate: '05 Oct 2026',
    session: 'Evening',
    timeSlot: '07:00 PM – 11:30 PM',
    guests: 140,
    ratePerPlate: 950,
    slotRentalPrice: 45000,
    totalEstimatedAmount: 178000,
    advancePaid: 178000,
    status: 'Completed',
    cateringType: 'Multi-Cuisine Gala',
    notes: 'Golden jubilee retro theme, live acoustic saxophone, curated dessert bar',
    amenitiesRequested: ['Open Air Canopy', 'Live Barbeque Counter', 'DJ Stage']
  },
  // 7. LAST WEEK (Past History): 02 Oct 2026
  {
    id: 'BQ-2026-107',
    eventName: 'Cadila Pharma Q3 Strategy Board Meet',
    hostName: 'Sanjay Varma',
    mobile: '+91 98242 11990',
    outlet: 'Yanki Sizzlerr SG Highway',
    hallName: 'Sapphire Celebration Hall',
    date: '2026-10-02',
    displayDate: '02 Oct 2026',
    session: 'Morning',
    timeSlot: '09:30 AM – 02:30 PM',
    guests: 60,
    ratePerPlate: 850,
    slotRentalPrice: 25000,
    totalEstimatedAmount: 76000,
    advancePaid: 76000,
    status: 'Completed',
    cateringType: 'Cocktail & Hi-Tea',
    notes: 'Boardroom layout seating, high-speed WiFi, executive continental breakfast',
    amenitiesRequested: ['Projector & Mic', 'Central AC', 'Private Buffet Line']
  }
];

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ reservations: initialReservations, onRefresh }) => {
  const mapReservations = (list: Reservation[]): UpcomingItem[] => {
    const mapped: UpcomingItem[] = list.map(r => ({
      dbId: r.id,
      id: r.bookingReference || `R-${r.id}`,
      customer: r.customerName,
      mobile: r.customerMobile,
      outlet: r.outlet,
      date: r.reservationTime,
      guests: r.guests,
      status: (r.status as any) || 'Confirmed',
      vip: Boolean(r.vip) || (r.tierPriorityTag !== 'Non-Subscriber' && r.tierPriorityTag !== 'GUEST' && Boolean(r.tierPriorityTag)),
      tierPriorityTag: r.tierPriorityTag || (r.vip ? 'Signature' : 'Non-Subscriber'),
      bookingAdvance: r.bookingAdvance !== undefined ? r.bookingAdvance : (r.vip ? 0 : 99),
      advancePaid: r.advancePaid !== undefined ? r.advancePaid : true,
      advanceDeducted: r.advanceDeducted || false,
      notes: r.specialRequests,
      tableAssigned: r.tableAssigned || undefined,
      createdAt: r.createdAt
    }));

    // Merge: live bookings take precedence over mock seed items with same id
    const existingIds = new Set(mapped.map(m => m.id));
    const merged = [...mapped];
    for (const mockItem of DEFAULT_MOCK_BOOKINGS) {
      if (!existingIds.has(mockItem.id)) {
        merged.push(mockItem);
      }
    }

    // VIP Subscriber Priority: Subscribed VIPs always go to top of queue!
    return merged.sort((a, b) => {
      if (a.vip && !b.vip) return -1;
      if (!a.vip && b.vip) return 1;
      return 0;
    });
  };

  const [upcomingList, setUpcomingList] = useState<UpcomingItem[]>(() => mapReservations(initialReservations));
  const [selectedOutlet, setSelectedOutlet] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio & Live Alert States
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sizzlo_reservation_sound') !== 'false';
    } catch (_) {
      return true;
    }
  });
  const [newInquiryNotice, setNewInquiryNotice] = useState<{
    count: number;
    latestName: string;
    latestGuests: number;
    latestOutlet: string;
  } | null>(null);
  const prevIdsRef = useRef<Set<number | string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Table Settlement & Queue Assignment States
  const [availableFloorTables, setAvailableFloorTables] = useState<any[]>([]);
  const [settlingItem, setSettlingItem] = useState<UpcomingItem | null>(null);
  const [selectedTableToAssign, setSelectedTableToAssign] = useState<string>('');
  const [tableAssignState, setTableAssignState] = useState<'Occupied' | 'Reserved'>('Occupied');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const [queuingItem, setQueuingItem] = useState<UpcomingItem | null>(null);
  const [queueWaitMinutes, setQueueWaitMinutes] = useState<number>(15);
  const [isSubmittingQueue, setIsSubmittingQueue] = useState(false);

  // Dynamic Slots State
  const [slotsList, setSlotsList] = useState<OutletTimeSlot[]>([]);
  const [availableOutlets, setAvailableOutlets] = useState<Outlet[]>([]);
  const [slotFilterOutlet, setSlotFilterOutlet] = useState<string>('All Outlets');
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('08:00 PM');
  const [newSlotSession, setNewSlotSession] = useState<'LUNCH' | 'DINNER'>('DINNER');
  const [newSlotOutlet, setNewSlotOutlet] = useState('All Outlets');
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [slotNotice, setSlotNotice] = useState<string | null>(null);

  // ==============================================================
  // DYNAMIC BANQUET MASTER & RESERVATIONS STATE
  // ==============================================================
  const [bookingServiceType, setBookingServiceType] = useState<'dining' | 'banquet'>('dining');
  const [banquetHallsList, setBanquetHallsList] = useState<BanquetHall[]>(DEFAULT_BANQUET_HALLS);
  const [banquetEventsList, setBanquetEventsList] = useState<BanquetBookingItem[]>(DEFAULT_BANQUET_EVENTS);
  const [showBanquetMasterModal, setShowBanquetMasterModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Partial<BanquetHall> | null>(null);
  const [isSavingHall, setIsSavingHall] = useState(false);
  const [banquetMasterSearch, setBanquetMasterSearch] = useState('');
  const [banquetMasterOutletFilter, setBanquetMasterOutletFilter] = useState('All');
  const [banquetNotice, setBanquetNotice] = useState<string | null>(null);
  const [selectedBanquetBooking, setSelectedBanquetBooking] = useState<BanquetBookingItem | null>(null);

  // Interactive Calendar State ("what is today and which branch, history & future")
  const [viewMode, setViewMode] = useState<'calendar' | 'desk' | 'ledger'>('calendar');
  const [currentCalMonth, setCurrentCalMonth] = useState<Date>(new Date());
  const [selectedCalDate, setSelectedCalDate] = useState<Date | null>(new Date());
  const [calBranchFilter, setCalBranchFilter] = useState<string>('All');
  const [calPartyFilter, setCalPartyFilter] = useState<'all' | 'couple' | 'family'>('all');
  const [calTimeRangePreset, setCalTimeRangePreset] = useState<
    'all' | 'today' | 'tomorrow' | 'this_week' | 'last_week' | 'this_month' | 'past_history' | 'future' | 'custom_date'
  >('all');
  const [calHistoryFilter, setCalHistoryFilter] = useState<'all' | 'past' | 'today' | 'future'>('all');
  const [datePickerInput, setDatePickerInput] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const loadSlots = async () => {
    try {
      const data = await fetchAllTimeSlots();
      setSlotsList(data);
    } catch (_) {}
  };

  const loadBanquetHalls = async () => {
    try {
      const data = await fetchBanquetHalls();
      if (data && data.length > 0) {
        setBanquetHallsList(data);
      }
    } catch (_) {}
  };

  const loadFloorTables = async () => {
    try {
      const res = await axios.get('/api/floor/tables');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAvailableFloorTables(res.data.data);
      }
    } catch (_) {}
  };

  const pollLiveReservations = async () => {
    try {
      const res = await axios.get('/api/reservations');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const incoming: Reservation[] = res.data.data;
        const currentIds = new Set(incoming.map(r => r.id));

        if (!isFirstLoadRef.current) {
          const newArrivals = incoming.filter(r => !prevIdsRef.current.has(r.id));
          if (newArrivals.length > 0) {
            if (soundEnabled) {
              playZomatoAlertSound();
            }
            setNewInquiryNotice({
              count: newArrivals.length,
              latestName: newArrivals[0].customerName,
              latestGuests: newArrivals[0].guests,
              latestOutlet: newArrivals[0].outlet
            });
          }
        } else {
          isFirstLoadRef.current = false;
        }

        prevIdsRef.current = currentIds;
        setUpcomingList(mapReservations(incoming));
      }
    } catch (_) {}
  };

  useEffect(() => {
    pollLiveReservations();
    loadFloorTables();
    loadSlots();
    loadBanquetHalls();
    fetchOutlets().then((data) => {
      if (data && data.length > 0) setAvailableOutlets(data);
    }).catch(() => {});

    // Real-time polling every 6 seconds for new inquiries
    const interval = setInterval(() => {
      pollLiveReservations();
      loadFloorTables();
    }, 6000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  useEffect(() => {
    if (initialReservations && initialReservations.length > 0) {
      setUpcomingList(mapReservations(initialReservations));
    }
  }, [initialReservations]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('sizzlo_reservation_sound', String(next));
    } catch (_) {}
    if (next) {
      playZomatoAlertSound();
    }
  };

  // Settle Table Assignment
  const handleConfirmAssignTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingItem || !selectedTableToAssign) {
      alert('Please select a dining table');
      return;
    }
    setIsSubmittingAssign(true);
    try {
      const cleanNum = selectedTableToAssign.replace(/[^0-9]/g, '');
      await axios.post(`/api/reservations/${settlingItem.dbId}/assign-table?tableNumber=${cleanNum}&state=${tableAssignState}`);
      setSettlingItem(null);
      setSelectedTableToAssign('');
      await pollLiveReservations();
      await loadFloorTables();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Could not assign table: ${err?.response?.data?.message || 'Error'}`);
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Move to Waitlist Queue
  const handleConfirmSendToQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queuingItem) return;
    setIsSubmittingQueue(true);
    try {
      await axios.post(`/api/reservations/${queuingItem.dbId}/send-to-queue?waitMinutes=${queueWaitMinutes}`);
      setQueuingItem(null);
      await pollLiveReservations();
      if (onRefresh) onRefresh();
    } catch (err: any) {
      alert(`Could not move to queue: ${err?.response?.data?.message || 'Error'}`);
    } finally {
      setIsSubmittingQueue(false);
    }
  };

  const handleToggleSlot = async (id: number) => {
    try {
      await toggleTimeSlot(id);
      setSlotsList(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
      setSlotNotice('Time slot visibility updated in mobile app!');
      setTimeout(() => setSlotNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this time slot?')) return;
    try {
      await deleteTimeSlot(id);
      setSlotsList(prev => prev.filter(s => s.id !== id));
      setSlotNotice('Slot removed.');
      setTimeout(() => setSlotNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSlot(true);
    try {
      await createTimeSlot({
        outlet: newSlotOutlet,
        slotTime: newSlotTime,
        session: newSlotSession,
        active: true
      });
      await loadSlots();
      setSlotNotice(`Slot ${newSlotTime} added successfully! It is now live in the mobile app.`);
      setTimeout(() => setSlotNotice(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSlot(false);
    }
  };

  // Banquet Hall CRUD operations
  const handleSaveHall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHall || !editingHall.name || !editingHall.outletName) {
      setBanquetNotice('Please provide hall name and associated outlet.');
      return;
    }
    setIsSavingHall(true);
    try {
      if (editingHall.id) {
        const updated = await updateBanquetHall(editingHall.id, editingHall);
        setBanquetHallsList(prev => prev.map(h => h.id === editingHall.id ? { ...h, ...updated } : h));
        setBanquetNotice(`Hall "${updated.name}" updated successfully.`);
      } else {
        const created = await createBanquetHall(editingHall);
        setBanquetHallsList(prev => [...prev, created]);
        setBanquetNotice(`Banquet hall "${created.name}" created for ${created.outletName}!`);
      }
      setEditingHall(null);
    } catch (_) {
      setBanquetNotice('Error saving banquet hall.');
    } finally {
      setIsSavingHall(false);
      setTimeout(() => setBanquetNotice(null), 3500);
    }
  };

  const handleDeleteHall = async (id: number | string, name: string) => {
    if (!window.confirm(`Delete "${name}" from Banquet Master?`)) return;
    try {
      await deleteBanquetHall(id);
      setBanquetHallsList(prev => prev.filter(h => h.id !== id));
      setBanquetNotice(`Hall "${name}" deleted.`);
      setTimeout(() => setBanquetNotice(null), 3000);
    } catch (_) {}
  };

  const handleToggleHallStatus = async (hall: BanquetHall) => {
    const nextStatus = hall.status === 'Active' ? 'Maintenance' : 'Active';
    try {
      await updateBanquetHall(hall.id, { ...hall, status: nextStatus as any });
      setBanquetHallsList(prev => prev.map(h => h.id === hall.id ? { ...h, status: nextStatus as any } : h));
    } catch (_) {}
  };

  const updateUpcomingStatus = async (target: UpcomingItem | string | number, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    const targetItem = typeof target === 'object' ? target : upcomingList.find(u => u.id === target || u.dbId === target);
    if (!targetItem) return;

    setUpcomingList(prev => prev.map(u => u.dbId === targetItem.dbId ? { ...u, status: newStatus } : u));
    try {
      await axios.patch(`/api/reservations/${targetItem.dbId}/status?status=${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status on server', err);
      pollLiveReservations();
    }
  };

  const filteredUpcoming = upcomingList.filter(item => {
    const matchesOutlet = selectedOutlet === 'All' || item.outlet.toLowerCase().includes(selectedOutlet.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      item.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outlet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOutlet && matchesStatus && matchesSearch;
  });

  // Incoming Inquiries requiring settlement
  const incomingInquiries = upcomingList.filter(
    u => u.status !== 'Completed' && u.status !== 'Cancelled' && (!u.tableAssigned || u.status === 'Pending' || u.status === 'Waitlisted')
  );

  const vipCount = upcomingList.filter(u => u.vip).length;
  const nonVipCount = upcomingList.length - vipCount;
  const totalGuests = upcomingList.reduce((sum, r) => sum + (r.guests || 2), 0);
  const totalAdvance = upcomingList
    .filter(u => !u.vip && u.advancePaid)
    .reduce((sum, r) => sum + (r.bookingAdvance || 99), 0);

  // Helper: check if two dates are same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Helper: accurately parse date from booking record (relative or formatted string)
  const parseBookingDate = (item: UpcomingItem): Date => {
    const today = new Date();
    const d = (item.date || '').trim();
    const lower = d.toLowerCase();

    if (lower.includes('today')) {
      return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }
    if (lower.includes('tomorrow')) {
      const tm = new Date(today);
      tm.setDate(today.getDate() + 1);
      return new Date(tm.getFullYear(), tm.getMonth(), tm.getDate());
    }
    if (lower.includes('yesterday')) {
      const yd = new Date(today);
      yd.setDate(today.getDate() - 1);
      return new Date(yd.getFullYear(), yd.getMonth(), yd.getDate());
    }

    // ISO yyyy-mm-dd
    const isoMatch = d.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }

    // DD Mon YYYY or DD Month YYYY (e.g. "05 Oct 2026")
    const match = d.match(/(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{4}))?/);
    if (match) {
      const day = parseInt(match[1]);
      const mStr = match[2].toLowerCase().substring(0, 3);
      const yr = match[3] ? parseInt(match[3]) : today.getFullYear();
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const mIdx = months.indexOf(mStr);
      if (mIdx !== -1) {
        return new Date(yr, mIdx, day);
      }
    }

    if (item.createdAt) {
      const parsed = new Date(item.createdAt);
      if (!isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
    }

    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const today = new Date();
  const todayZeroHour = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const todayEndHour = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // This Week range (Sunday to Saturday)
  const startOfThisWeek = new Date(todayZeroHour);
  startOfThisWeek.setDate(today.getDate() - today.getDay());
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
  endOfThisWeek.setHours(23, 59, 59, 999);

  // Last Week range (previous 7-day calendar block or rolling 7 days ago)
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setDate(startOfThisWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const rolling7DaysAgo = new Date(todayZeroHour);
  rolling7DaysAgo.setDate(today.getDate() - 7);

  // Check bookings for any specific calendar date
  const getBookingsForDate = (targetDate: Date, branch: string) => {
    return upcomingList.filter(item => {
      if (branch !== 'All' && item.outlet !== branch && !item.outlet.toLowerCase().includes(branch.toLowerCase())) {
        return false;
      }
      const bDate = parseBookingDate(item);
      return isSameDay(bDate, targetDate);
    });
  };

  // Check bookings for any time range preset
  const getBookingsForPreset = (preset: typeof calTimeRangePreset, branch: string) => {
    return upcomingList.filter(item => {
      if (branch !== 'All' && item.outlet !== branch && !item.outlet.toLowerCase().includes(branch.toLowerCase())) {
        return false;
      }
      const bDate = parseBookingDate(item);
      if (preset === 'today') return isSameDay(bDate, today);
      if (preset === 'tomorrow') return isSameDay(bDate, tomorrow);
      if (preset === 'this_week') return bDate >= startOfThisWeek && bDate <= endOfThisWeek;
      if (preset === 'last_week') {
        return (bDate >= startOfLastWeek && bDate <= endOfLastWeek) || (bDate >= rolling7DaysAgo && bDate < todayZeroHour);
      }
      if (preset === 'this_month') return bDate.getFullYear() === today.getFullYear() && bDate.getMonth() === today.getMonth();
      if (preset === 'past_history') return bDate < todayZeroHour || item.status === 'Completed';
      if (preset === 'future') return bDate > todayEndHour;
      if (preset === 'custom_date') return selectedCalDate ? isSameDay(bDate, selectedCalDate) : true;
      return true; // 'all'
    });
  };

  const todayCalBookings = getBookingsForDate(today, calBranchFilter);
  const todayCalCovers = todayCalBookings.reduce((sum, b) => sum + (b.guests || 2), 0);
  const todayCalCoupleBookings = todayCalBookings.filter(b => b.guests === 2);

  const presetBookings = getBookingsForPreset(calTimeRangePreset, calBranchFilter);

  const filteredSelectedCalBookings = presetBookings.filter(b => {
    // Party size filter
    if (calPartyFilter === 'couple' && b.guests !== 2) return false;
    if (calPartyFilter === 'family' && b.guests < 3) return false;

    // History vs future scope filter
    const bDate = parseBookingDate(b);
    if (calHistoryFilter === 'past' && !(bDate < todayZeroHour || b.status === 'Completed')) return false;
    if (calHistoryFilter === 'today' && !isSameDay(bDate, today)) return false;
    if (calHistoryFilter === 'future' && !(bDate > todayEndHour)) return false;

    return true;
  });

  // Dynamic map of outlets that have banquet halls
  const activeHallsForSelectedBranch = React.useMemo(() => {
    if (calBranchFilter === 'All') {
      return banquetHallsList.filter(h => h.status !== 'Inactive');
    }
    return banquetHallsList.filter(h => h.outletName.toLowerCase() === calBranchFilter.toLowerCase() && h.status !== 'Inactive');
  }, [banquetHallsList, calBranchFilter]);

  const isBranchBanquetEnabled = activeHallsForSelectedBranch.length > 0;

  // Check banquet events for any specific calendar date
  const getBanquetEventsForDate = (targetDate: Date, branch: string) => {
    return banquetEventsList.filter(item => {
      if (branch !== 'All' && item.outlet !== branch && !item.outlet.toLowerCase().includes(branch.toLowerCase())) {
        return false;
      }
      const [y, m, d] = item.date.split('-').map(Number);
      const evDate = new Date(y, m - 1, d);
      return isSameDay(evDate, targetDate);
    });
  };

  // Check banquet events for any time range preset
  const getBanquetEventsForPreset = (preset: typeof calTimeRangePreset, branch: string) => {
    return banquetEventsList.filter(item => {
      if (branch !== 'All' && item.outlet !== branch && !item.outlet.toLowerCase().includes(branch.toLowerCase())) {
        return false;
      }
      const [y, m, d] = item.date.split('-').map(Number);
      const evDate = new Date(y, m - 1, d);
      if (preset === 'today') return isSameDay(evDate, today);
      if (preset === 'tomorrow') return isSameDay(evDate, tomorrow);
      if (preset === 'this_week') return evDate >= startOfThisWeek && evDate <= endOfThisWeek;
      if (preset === 'last_week') {
        return (evDate >= startOfLastWeek && evDate <= endOfLastWeek) || (evDate >= rolling7DaysAgo && evDate < todayZeroHour);
      }
      if (preset === 'this_month') return evDate.getFullYear() === currentCalMonth.getFullYear() && evDate.getMonth() === currentCalMonth.getMonth();
      if (preset === 'past_history') return evDate < todayZeroHour || item.status === 'Completed';
      if (preset === 'future') return evDate > todayEndHour;
      if (preset === 'custom_date') return selectedCalDate ? isSameDay(evDate, selectedCalDate) : true;
      return true;
    });
  };

  const todayBanquetEvents = getBanquetEventsForDate(today, calBranchFilter);
  const todayBanquetGuests = todayBanquetEvents.reduce((sum, b) => sum + b.guests, 0);

  const presetBanquetEvents = getBanquetEventsForPreset(calTimeRangePreset, calBranchFilter);
  const filteredSelectedBanquetEvents = presetBanquetEvents.filter(ev => {
    const [y, m, d] = ev.date.split('-').map(Number);
    const evDate = new Date(y, m - 1, d);
    if (calHistoryFilter === 'past' && !(evDate < todayZeroHour || ev.status === 'Completed')) return false;
    if (calHistoryFilter === 'today' && !isSameDay(evDate, today)) return false;
    if (calHistoryFilter === 'future' && !(evDate > todayEndHour)) return false;
    return true;
  });

  // Calendar Month Grid construction
  const calYear = currentCalMonth.getFullYear();
  const calMonth = currentCalMonth.getMonth();
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfMonthIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Sun

  const calDaysArray: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonthIndex; i++) {
    calDaysArray.push(null);
  }
  for (let day = 1; day <= daysInCalMonth; day++) {
    calDaysArray.push(new Date(calYear, calMonth, day));
  }

  const dynamicKpiStats = [
    { k: 'Total Guests Today', v: `${totalGuests}`, icon: Users, delta: `${upcomingList.length} total party bookings` },
    { k: '👑 Subscribed VIPs', v: `${vipCount}`, icon: Crown, delta: 'High Priority Desk Seating' },
    { k: '🎯 Inquiries Requiring Settlement', v: `${incomingInquiries.length}`, icon: Armchair, delta: `${incomingInquiries.filter(i => !i.tableAssigned).length} unassigned tables` },
    { k: 'Advance Held at Desk', v: `₹${totalAdvance}`, icon: TrendingUp, delta: '100% POS bill deductible' },
    { k: 'Peak Hour Rush', v: '8 PM', icon: Clock, delta: 'Dinner peak rush window' },
    { k: 'Dynamic Slots Active', v: `${slotsList.filter(s => s.active).length} / ${slotsList.length}`, icon: MapPin, delta: 'Synced with mobile app' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* ============================================================== */}
      {/* Zomato / Swiggy Pulsing Alert Banner on New Inquiry            */}
      {/* ============================================================== */}
      {newInquiryNotice && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(255, 138, 0, 0.22), rgba(201, 162, 77, 0.22))',
          border: '2px solid var(--primary)',
          borderRadius: 16,
          padding: '16px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 30px rgba(255, 138, 0, 0.35)',
          animation: 'pulse 1.8s infinite',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#070A09',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              fontSize: 20,
              boxShadow: '0 0 15px rgba(255, 138, 0, 0.8)'
            }}>
              🔔
            </div>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                New Table Booking Inquiry Received!
              </h4>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                <strong style={{ color: 'var(--primary)' }}>{newInquiryNotice.latestName}</strong> booked for {newInquiryNotice.latestGuests} guests at {newInquiryNotice.latestOutlet}. Settle a dining table or move to waitlist now.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => {
                const target = upcomingList.find(u => u.customer === newInquiryNotice.latestName) || incomingInquiries[0];
                if (target) setSettlingItem(target);
                setNewInquiryNotice(null);
              }}
              className="btn btn-primary"
              style={{ padding: '8px 18px', fontSize: 12, fontWeight: 800 }}
            >
              <Armchair size={14} /> Settle Table Now
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => setNewInquiryNotice(null)}
              style={{ padding: '8px 14px', fontSize: 12 }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Top Controls: Sound Toggle, Sound Test, Time Slots             */}
      {/* ============================================================== */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: 'var(--surface)', 
        padding: '14px 20px', 
        borderRadius: 16, 
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={18} color="var(--gold)" /> Table Reservations & Inquiry Terminal
          </h2>
          <span style={{ 
            fontSize: 11, 
            padding: '2px 8px', 
            borderRadius: 10, 
            background: 'rgba(16, 185, 129, 0.15)', 
            color: '#10B981', 
            fontWeight: 700 
          }}>
            ● Live Polling Active (6s)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'calendar' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'calendar' ? '#070A09' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.18s'
            }}
          >
            <Calendar size={14} /> Interactive Calendar
          </button>
          <button
            onClick={() => setViewMode('desk')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'desk' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'desk' ? '#070A09' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.18s'
            }}
          >
            <Armchair size={14} /> Host Settlement Desk ({incomingInquiries.length})
          </button>
          <button
            onClick={() => setViewMode('ledger')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 800,
              padding: '7px 14px',
              borderRadius: 8,
              border: 'none',
              background: viewMode === 'ledger' ? 'var(--primary)' : 'transparent',
              color: viewMode === 'ledger' ? '#070A09' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.18s'
            }}
          >
            <ListOrdered size={14} /> All Reservations
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Zomato / Swiggy Sound Toggle Button */}
          <button
            onClick={toggleSound}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 14px',
              borderColor: soundEnabled ? 'var(--primary)' : 'var(--border)',
              color: soundEnabled ? 'var(--primary)' : 'var(--text-muted)'
            }}
            title="Toggle Swiggy/Zomato style order alert beep chime"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>Sound Alerts: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={playZomatoAlertSound}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 14px'
            }}
            title="Test the Zomato/Swiggy chime alert"
          >
            <Bell size={15} color="var(--gold)" />
            <span>Test Alert Chime</span>
          </button>

          {/* Manage Dynamic Slots */}
          <button
            onClick={() => setShowSlotModal(true)}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 14px'
            }}
          >
            <Clock size={15} color="var(--gold)" />
            <span>Manage Slots ({slotsList.filter(s => s.active).length})</span>
          </button>

          {/* Manage Banquet Master */}
          <button
            onClick={() => {
              setEditingHall(null);
              setShowBanquetMasterModal(true);
            }}
            className="btn btn-outline"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '8px 14px',
              borderColor: 'rgba(201, 162, 77, 0.6)',
              color: 'var(--gold)',
              background: 'rgba(201, 162, 77, 0.08)'
            }}
            title="Configure banquet halls dynamically per outlet"
          >
            <Building2 size={15} color="var(--gold)" />
            <span>Banquet Master ({banquetHallsList.length} Halls)</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => {
              pollLiveReservations();
              loadFloorTables();
            }}
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
            title="Refresh All Reservations"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW MODE 1: INTERACTIVE RESERVATION CALENDAR TERMINAL          */}
      {/* ============================================================== */}
      {viewMode === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* SERVICE CATEGORY SWITCHER: Table Dining vs Banquet Events */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(20, 18, 16, 0.95), rgba(30, 26, 22, 0.95))',
            border: '1.5px solid rgba(201, 162, 77, 0.35)',
            borderRadius: 18,
            padding: '12px 20px',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: bookingServiceType === 'banquet' ? 'rgba(201, 162, 77, 0.22)' : 'rgba(255, 138, 0, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {bookingServiceType === 'banquet' ? <Building2 size={22} color="var(--gold)" /> : <UtensilsCrossed size={22} color="var(--primary)" />}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {bookingServiceType === 'banquet' ? '🏛️ Banquet Halls & Grand Events Radar' : '🍽️ Table Dining & Couple Booths Radar'}
                  <span style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 8,
                    background: bookingServiceType === 'banquet' ? 'rgba(201, 162, 77, 0.18)' : 'rgba(255, 138, 0, 0.18)',
                    color: bookingServiceType === 'banquet' ? 'var(--gold)' : 'var(--primary)',
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}>
                    {bookingServiceType === 'banquet' ? `${banquetHallsList.length} Dynamic Halls` : 'Floor Seating Engine'}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {bookingServiceType === 'banquet'
                    ? 'Dynamic outlet scoping: only configured branches have banquet facilities. Configure halls in Banquet Master.'
                    : 'Real-time restaurant table seatings, couple booths priority & host settlement queue.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.45)',
                padding: 4,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <button
                  onClick={() => setBookingServiceType('dining')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: bookingServiceType === 'dining' ? 'var(--primary)' : 'transparent',
                    color: bookingServiceType === 'dining' ? '#070A09' : 'var(--text-muted)',
                    transition: 'all 0.18s'
                  }}
                >
                  <UtensilsCrossed size={14} />
                  Table Dining
                </button>
                <button
                  onClick={() => setBookingServiceType('banquet')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    background: bookingServiceType === 'banquet' ? 'var(--gold)' : 'transparent',
                    color: bookingServiceType === 'banquet' ? '#070A09' : 'var(--text-muted)',
                    transition: 'all 0.18s'
                  }}
                >
                  <Building2 size={14} />
                  Banquet Halls & Events
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingHall(null);
                  setShowBanquetMasterModal(true);
                }}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 700,
                  borderColor: 'rgba(201, 162, 77, 0.6)',
                  color: 'var(--gold)'
                }}
                title="Open Dynamic Banquet Master Desk"
              >
                <Settings size={14} />
                Banquet Master
              </button>
            </div>
          </div>

          {/* HERO TODAY & BRANCH BANNER */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.18) 0%, rgba(20, 18, 16, 0.98) 100%)',
            border: '1.5px solid rgba(201, 162, 77, 0.5)',
            borderRadius: 20,
            padding: '24px 28px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(201, 162, 77, 0.22)',
                  border: '1px solid rgba(201, 162, 77, 0.55)',
                  padding: '4px 10px',
                  borderRadius: 8,
                  marginBottom: 8
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', display: 'inline-block' }}></span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: 0.8 }}>
                    {bookingServiceType === 'banquet' ? 'BANQUET RADAR ACTIVE' : 'LIVE CALENDAR RADAR'}
                  </span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: -0.3 }}>
                  Today: {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  {bookingServiceType === 'banquet'
                    ? `Showing banquet event sessions & hall allocations for ${calBranchFilter === 'All' ? 'all banquet-enabled branches' : calBranchFilter}.`
                    : 'Live table reservations, guest covers & outlet allocations. Tap on Today to inspect bookings.'}
                </p>
              </div>

              {/* Branch / Outlet Filter ("which branch") with Dynamic Banquet Indicators */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 280 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                    SELECT BRANCH / OUTLET
                  </label>
                  {calBranchFilter !== 'All' && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: 6,
                      background: isBranchBanquetEnabled ? 'rgba(201, 162, 77, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: isBranchBanquetEnabled ? 'var(--gold)' : 'var(--text-muted)'
                    }}>
                      {isBranchBanquetEnabled ? `🏛️ ${activeHallsForSelectedBranch.length} Hall${activeHallsForSelectedBranch.length > 1 ? 's' : ''}` : '🍽️ Dining Only'}
                    </span>
                  )}
                </div>
                <select
                  value={calBranchFilter}
                  onChange={(e) => setCalBranchFilter(e.target.value)}
                  style={{
                    background: '#1A1714',
                    border: '1.5px solid rgba(201, 162, 77, 0.5)',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Branches (Consolidated Group)</option>
                  {availableOutlets.map(o => {
                    const count = banquetHallsList.filter(h => h.outletName === o.name && h.status !== 'Inactive').length;
                    return (
                      <option key={o.id} value={o.name}>
                        {o.name} {count > 0 ? `(🏛️ ${count} Banquet Hall${count > 1 ? 's' : ''})` : '(🍽️ Dining Only)'}
                      </option>
                    );
                  })}
                  {availableOutlets.length === 0 && (
                    <>
                      <option value="House of Yanki Banquets Bopal">House of Yanki Banquets Bopal (🏛️ 2 Banquet Halls)</option>
                      <option value="Yanki Sizzlerr SG Highway">Yanki Sizzlerr SG Highway (🏛️ 1 Banquet Hall)</option>
                      <option value="Yanki Sizzlerr Bodakdev">Yanki Sizzlerr Bodakdev (🍽️ Dining Bistro Only)</option>
                      <option value="Dough by Yanki CG Road">Dough by Yanki CG Road (☕ Bakery Café Only)</option>
                      <option value="Yanki Sizzlerr Vastrapur Lake">Yanki Sizzlerr Vastrapur Lake (🍽️ Dining Bistro Only)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Quick KPI stats & Tap to open Today */}
            {bookingServiceType === 'dining' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Bookings Today</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', marginTop: 2 }}>
                    {todayCalBookings.length} Parties
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Covers (Guests)</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginTop: 2 }}>
                    {todayCalCovers} Guests
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(201, 162, 77, 0.25)' }}>
                  <span style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>2 Guests (Couple Tables)</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)', marginTop: 2 }}>
                    ♥ {todayCalCoupleBookings.length} Couple Tables
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      const t = new Date();
                      setSelectedCalDate(t);
                      setCurrentCalMonth(t);
                      setCalTimeRangePreset('today');
                      setCalPartyFilter('couple');
                      setCalHistoryFilter('all');
                      const yyyy = t.getFullYear();
                      const mm = String(t.getMonth() + 1).padStart(2, '0');
                      const dd = String(t.getDate()).padStart(2, '0');
                      setDatePickerInput(`${yyyy}-${mm}-${dd}`);
                      const el = document.getElementById('day-bookings-terminal');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: 13,
                      fontWeight: 800,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 15px rgba(255, 138, 0, 0.35)'
                    }}
                  >
                    <Calendar size={16} />
                    <span>View Today's Bookings (2 Covers) →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Banquet Events Today</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)', marginTop: 2 }}>
                    {todayBanquetEvents.length} Events
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Banquet Guests Today</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#FFFFFF', marginTop: 2 }}>
                    {todayBanquetGuests} Pax
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: '12px 16px', border: '1px solid rgba(201, 162, 77, 0.25)' }}>
                  <span style={{ fontSize: 11, color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 700 }}>Halls Active at Branch</span>
                  <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)', marginTop: 2 }}>
                    {activeHallsForSelectedBranch.length} Halls
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      const t = new Date();
                      setSelectedCalDate(t);
                      setCurrentCalMonth(t);
                      setCalTimeRangePreset('today');
                      setCalHistoryFilter('all');
                      const yyyy = t.getFullYear();
                      const mm = String(t.getMonth() + 1).padStart(2, '0');
                      const dd = String(t.getDate()).padStart(2, '0');
                      setDatePickerInput(`${yyyy}-${mm}-${dd}`);
                      const el = document.getElementById('day-bookings-terminal');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      fontSize: 13,
                      fontWeight: 800,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 15px rgba(255, 138, 0, 0.35)'
                    }}
                  >
                    <Building2 size={16} />
                    <span>View Today's Banquet Events ({todayBanquetGuests} Pax) →</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC BANQUET FACILITY ADVISORY OR HALLS OVERVIEW DECK */}
          {bookingServiceType === 'banquet' && (
            <div>
              {!isBranchBanquetEnabled && calBranchFilter !== 'All' ? (
                /* OUTLET DOES NOT HAVE BANQUETS ADVISORY */
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(201, 162, 77, 0.08))',
                  border: '1.5px solid rgba(201, 162, 77, 0.4)',
                  borderRadius: 18,
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(201, 162, 77, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Building2 size={24} color="var(--gold)" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#FFFFFF' }}>
                        Notice: "{calBranchFilter}" is a Dining-Only Branch (No Banquet Halls Configured)
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12.5, color: 'var(--text-muted)' }}>
                        In this restaurant group, not every outlet has banquet facilities. This outlet operates strictly as a dining restaurant. Banquet facilities are active at House of Yanki Banquets Bopal and SG Highway, or you can register a hall for this location in Banquet Master.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800 }}>Quick Actions:</span>
                    <button
                      onClick={() => setCalBranchFilter('House of Yanki Banquets Bopal')}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Building2 size={14} /> Switch to House of Yanki Banquets Bopal (2 Halls)
                    </button>
                    <button
                      onClick={() => setCalBranchFilter('Yanki Sizzlerr SG Highway')}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Building2 size={14} /> Switch to SG Highway (1 Hall)
                    </button>
                    <button
                      onClick={() => {
                        setEditingHall({
                          outletName: calBranchFilter,
                          name: `${calBranchFilter.replace('Yanki Sizzlerr ', '').replace('Dough by Yanki ', '')} Celebration Banquet`,
                          minCapacity: 50,
                          maxCapacity: 200,
                          ratePerPlate: 950,
                          slotRentalPrice: 35000,
                          supportedSessions: 'Morning,Evening',
                          amenities: 'Stage,Central AC,Audio/Visual,Private Buffet Line',
                          status: 'Active'
                        });
                        setShowBanquetMasterModal(true);
                      }}
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: 12, fontWeight: 700, borderColor: 'var(--gold)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={14} /> + Configure Banquet Hall for {calBranchFilter} in Master
                    </button>
                  </div>
                </div>
              ) : (
                /* OUTLET HAS BANQUET HALLS: DISPLAY DYNAMIC HALLS DECK */
                <div style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  padding: 20,
                  boxShadow: 'var(--shadow-card)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Building2 size={18} color="var(--gold)" />
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                        Active Banquet Halls at {calBranchFilter === 'All' ? 'Consolidated Group' : calBranchFilter} ({activeHallsForSelectedBranch.length})
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setEditingHall({
                          outletName: calBranchFilter === 'All' ? 'House of Yanki Banquets Bopal' : calBranchFilter,
                          name: '',
                          minCapacity: 50,
                          maxCapacity: 250,
                          ratePerPlate: 950,
                          slotRentalPrice: 35000,
                          supportedSessions: 'Morning,Evening',
                          amenities: 'Stage,Sound System,Central AC,Valet Parking',
                          status: 'Active'
                        });
                        setShowBanquetMasterModal(true);
                      }}
                      className="btn btn-outline"
                      style={{ padding: '6px 12px', fontSize: 11.5, fontWeight: 700, borderColor: 'var(--gold)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      <Plus size={13} /> Add Hall in Banquet Master
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                    {activeHallsForSelectedBranch.map(hall => (
                      <div
                        key={hall.id}
                        style={{
                          background: 'var(--surface-alt)',
                          border: '1.5px solid rgba(201, 162, 77, 0.35)',
                          borderRadius: 14,
                          padding: 16,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                {hall.name}
                              </h4>
                              <span style={{ fontSize: 11, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <MapPin size={11} /> {hall.outletName}
                              </span>
                            </div>
                            <span style={{
                              fontSize: 10,
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: hall.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                              color: hall.status === 'Active' ? '#10B981' : '#EAB308'
                            }}>
                              ● {hall.status}
                            </span>
                          </div>

                          {/* Capacity & Rates */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capacity Range</span>
                              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF', marginTop: 1 }}>
                                👥 {hall.minCapacity} – {hall.maxCapacity} Pax
                              </div>
                            </div>
                            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pricing Matrix</span>
                              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)', marginTop: 1 }}>
                                ₹{hall.ratePerPlate || 950}/p · ₹{(hall.slotRentalPrice || 35000) / 1000}k
                              </div>
                            </div>
                          </div>

                          {/* Supported Sessions */}
                          <div style={{ marginTop: 10 }}>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                              Sessions: <strong style={{ color: '#FFFFFF' }}>{hall.supportedSessions || 'Morning, Evening, Full Day'}</strong>
                            </span>
                          </div>

                          {/* Amenities chips */}
                          {hall.amenities && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {hall.amenities.split(',').slice(0, 4).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: 9.5,
                                    padding: '2px 6px',
                                    borderRadius: 4,
                                    background: 'rgba(201, 162, 77, 0.12)',
                                    color: 'var(--gold)',
                                    fontWeight: 600
                                  }}
                                >
                                  {amenity.trim()}
                                </span>
                              ))}
                              {hall.amenities.split(',').length > 4 && (
                                <span style={{ fontSize: 9.5, padding: '2px 5px', color: 'var(--text-muted)' }}>
                                  +{hall.amenities.split(',').length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            Zero loyalty points policy enforced
                          </span>
                          <button
                            onClick={() => {
                              setEditingHall(hall);
                              setShowBanquetMasterModal(true);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--gold)',
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Edit3 size={12} /> Edit Hall
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MONTHLY CALENDAR GRID & TIMELINE CONTROLS */}
          <div style={{
            background: 'var(--surface)',
            borderRadius: 20,
            border: '1px solid var(--border)',
            padding: 24,
            boxShadow: 'var(--shadow-card)'
          }}>
            {/* 1. Quick Time Range & History Preset Filter Pills */}
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
              marginBottom: 18,
              paddingBottom: 16,
              borderBottom: '1px solid var(--border)'
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: 0.8, textTransform: 'uppercase', marginRight: 4 }}>
                TIMELINE FILTERS:
              </span>
              {[
                { id: 'all', label: '🌟 All Dates', count: getBookingsForPreset('all', calBranchFilter).length },
                { id: 'today', label: '⚡ Today', count: getBookingsForPreset('today', calBranchFilter).length },
                { id: 'tomorrow', label: '🌅 Tomorrow', count: getBookingsForPreset('tomorrow', calBranchFilter).length },
                { id: 'this_week', label: '🗓️ This Week', count: getBookingsForPreset('this_week', calBranchFilter).length },
                { id: 'last_week', label: '⏮️ Last Week (Past History)', count: getBookingsForPreset('last_week', calBranchFilter).length },
                { id: 'this_month', label: '📆 This Month', count: getBookingsForPreset('this_month', calBranchFilter).length },
                { id: 'past_history', label: '⏳ All Past History', count: getBookingsForPreset('past_history', calBranchFilter).length },
                { id: 'future', label: '🔮 Future Bookings', count: getBookingsForPreset('future', calBranchFilter).length }
              ].map(p => {
                const isActive = calTimeRangePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCalTimeRangePreset(p.id as any);
                      if (p.id === 'today') {
                        const t = new Date();
                        setSelectedCalDate(t);
                        setCurrentCalMonth(t);
                      } else if (p.id === 'last_week') {
                        const d = new Date();
                        d.setDate(d.getDate() - 7);
                        setCurrentCalMonth(d);
                      }
                      const el = document.getElementById('day-bookings-terminal');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      padding: '6px 13px',
                      borderRadius: 10,
                      fontSize: 11.5,
                      fontWeight: isActive ? 800 : 600,
                      background: isActive ? 'var(--primary)' : 'var(--surface-alt)',
                      color: isActive ? '#070A09' : 'var(--text-main)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.18s'
                    }}
                  >
                    <span>{p.label}</span>
                    <span style={{
                      fontSize: 10,
                      padding: '1px 5px',
                      borderRadius: 6,
                      background: isActive ? 'rgba(7, 10, 9, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      fontWeight: 800
                    }}>
                      {p.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 2. Month & Year Controls + Date Picker Input */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
              {/* Month Navigation & Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const prev = new Date(currentCalMonth);
                    prev.setMonth(prev.getMonth() - 1);
                    setCurrentCalMonth(prev);
                  }}
                  className="btn btn-outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  title="Previous Month"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Month Dropdown */}
                <select
                  value={currentCalMonth.getMonth()}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    const next = new Date(currentCalMonth);
                    next.setMonth(m);
                    setCurrentCalMonth(next);
                  }}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1.5px solid rgba(201, 162, 77, 0.4)',
                    color: '#FFFFFF',
                    borderRadius: 10,
                    padding: '7px 12px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((mName, idx) => (
                    <option key={mName} value={idx}>{mName}</option>
                  ))}
                </select>

                {/* Year Dropdown */}
                <select
                  value={currentCalMonth.getFullYear()}
                  onChange={(e) => {
                    const y = parseInt(e.target.value);
                    const next = new Date(currentCalMonth);
                    next.setFullYear(y);
                    setCurrentCalMonth(next);
                  }}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1.5px solid rgba(201, 162, 77, 0.4)',
                    color: '#FFFFFF',
                    borderRadius: 10,
                    padding: '7px 12px',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {[2025, 2026, 2027].map(yr => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const next = new Date(currentCalMonth);
                    next.setMonth(next.getMonth() + 1);
                    setCurrentCalMonth(next);
                  }}
                  className="btn btn-outline"
                  style={{ padding: '6px 10px', fontSize: 12 }}
                  title="Next Month"
                >
                  <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => {
                    const t = new Date();
                    setCurrentCalMonth(t);
                    setSelectedCalDate(t);
                    setCalTimeRangePreset('today');
                  }}
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: 12, fontWeight: 700, borderColor: 'var(--gold)', color: 'var(--gold)' }}
                >
                  ⚡ Today
                </button>
              </div>

              {/* Date Selection Picker */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} color="var(--gold)" />
                  <span>Select Specific Date:</span>
                </label>
                <input
                  type="date"
                  value={datePickerInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDatePickerInput(val);
                    if (val) {
                      const [y, m, d] = val.split('-').map(Number);
                      const picked = new Date(y, m - 1, d);
                      setSelectedCalDate(picked);
                      setCurrentCalMonth(new Date(y, m - 1, 1));
                      setCalTimeRangePreset('custom_date');
                      const el = document.getElementById('day-bookings-terminal');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1.5px solid rgba(201, 162, 77, 0.4)',
                    color: '#FFFFFF',
                    padding: '7px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    colorScheme: 'dark'
                  }}
                />
              </div>
            </div>

            {/* Weekday Labels Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
              textAlign: 'center',
              marginBottom: 10
            }}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} style={{ fontSize: 11, fontWeight: 800, color: 'var(--gold)', letterSpacing: 0.8, padding: '4px 0' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days 7-Column Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8
            }}>
              {calDaysArray.map((date, idx) => {
                if (!date) {
                  return (
                    <div 
                      key={`empty-${idx}`} 
                      style={{ 
                        minHeight: 96, 
                        background: 'rgba(255, 255, 255, 0.01)', 
                        borderRadius: 12, 
                        border: '1px dashed rgba(255, 255, 255, 0.04)' 
                      }} 
                    />
                  );
                }

                const isToday = isSameDay(date, new Date());
                const isPastDay = date < todayZeroHour;
                const isSelected = selectedCalDate ? isSameDay(date, selectedCalDate) : false;
                const bookingsForDay = getBookingsForDate(date, calBranchFilter);
                const coversCount = bookingsForDay.reduce((sum, b) => sum + (b.guests || 2), 0);
                const hasCouples = bookingsForDay.some(b => b.guests === 2);

                const bqEventsForDay = getBanquetEventsForDate(date, calBranchFilter);
                const bqGuestsForDay = bqEventsForDay.reduce((sum, e) => sum + e.guests, 0);

                const hasDayRecords = bookingServiceType === 'banquet' ? bqEventsForDay.length > 0 : bookingsForDay.length > 0;

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedCalDate(date);
                      setCalTimeRangePreset('custom_date');
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setDatePickerInput(`${yyyy}-${mm}-${dd}`);
                      const el = document.getElementById('day-bookings-terminal');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    style={{
                      minHeight: 96,
                      background: isSelected 
                        ? 'rgba(201, 162, 77, 0.18)' 
                        : isToday 
                          ? 'rgba(255, 138, 0, 0.12)' 
                          : isPastDay
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'var(--surface-alt)',
                      borderRadius: 12,
                      padding: 8,
                      border: isSelected 
                        ? '2px solid var(--gold)' 
                        : isToday 
                          ? '1.5px solid var(--primary)' 
                          : isPastDay
                            ? '1px solid rgba(255, 255, 255, 0.06)'
                            : '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.18s ease',
                      boxShadow: isSelected ? '0 0 14px rgba(201, 162, 77, 0.35)' : 'none',
                      opacity: isPastDay && !isSelected && !hasDayRecords ? 0.65 : 1
                    }}
                  >
                    {/* Day Number & Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ 
                        fontSize: 13, 
                        fontWeight: isToday || isSelected ? 800 : 600, 
                        color: isSelected ? 'var(--gold)' : isToday ? 'var(--primary)' : isPastDay ? 'var(--text-muted)' : 'var(--text-main)' 
                      }}>
                        {date.getDate()}
                      </span>
                      {isToday && (
                        <span style={{
                          fontSize: 9,
                          fontWeight: 800,
                          padding: '1px 5px',
                          borderRadius: 6,
                          background: 'var(--primary)',
                          color: '#0A0908'
                        }}>
                          TODAY
                        </span>
                      )}
                      {isPastDay && !isToday && hasDayRecords && (
                        <span style={{
                          fontSize: 8.5,
                          fontWeight: 700,
                          padding: '1px 4px',
                          borderRadius: 4,
                          background: 'rgba(148, 163, 184, 0.18)',
                          color: '#94A3B8'
                        }}>
                          PAST
                        </span>
                      )}
                    </div>

                    {/* Bookings / Events Indicator */}
                    {bookingServiceType === 'banquet' ? (
                      bqEventsForDay.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                          <div style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: 'rgba(201, 162, 77, 0.22)',
                            color: 'var(--gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>🏛️ {bqEventsForDay.length} Event{bqEventsForDay.length > 1 ? 's' : ''}</span>
                            <span>{bqGuestsForDay}p</span>
                          </div>
                          <div style={{ fontSize: 9, color: '#FFFFFF', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {bqEventsForDay[0].hallName.replace('The ', '')}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 9.5, color: 'var(--text-dim)', marginTop: 'auto' }}>
                          {isPastDay ? 'No events' : 'Hall Available'}
                        </div>
                      )
                    ) : (
                      bookingsForDay.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                          <div style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 6,
                            background: isPastDay ? 'rgba(148, 163, 184, 0.18)' : 'rgba(255, 138, 0, 0.18)',
                            color: isPastDay ? '#94A3B8' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <span>{bookingsForDay.length} {isPastDay ? 'Past' : 'Booked'}</span>
                            <span>{coversCount}p</span>
                          </div>
                          {hasCouples && (
                            <div style={{
                              fontSize: 9.5,
                              fontWeight: 700,
                              color: isPastDay ? '#C9A24D' : 'var(--gold)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2
                            }}>
                              ♥ Couple tables
                            </div>
                          )}
                        </div>
                      ) : (
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 'auto' }}>
                          {isPastDay ? 'No records' : 'No bookings'}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================== */}
          {/* DAY & TIMELINE BOOKINGS INSPECTION TERMINAL                    */}
          {/* ============================================================== */}
          <div 
            id="day-bookings-terminal"
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-card)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {bookingServiceType === 'banquet' ? <Building2 size={20} color="var(--gold)" /> : <Calendar size={20} color="var(--gold)" />}
                  {bookingServiceType === 'banquet' ? (
                    calTimeRangePreset === 'last_week' ? `⏮️ Last Week's Completed Banquet Events (${startOfLastWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${endOfLastWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})` :
                    calTimeRangePreset === 'past_history' ? '⏳ Past Banquet Events History' :
                    calTimeRangePreset === 'future' ? '🔮 Upcoming Scheduled Banquet Events' :
                    calTimeRangePreset === 'this_month' ? `📆 Banquet Events for ${currentCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}` :
                    calTimeRangePreset === 'this_week' ? `🗓️ This Week's Banquet Events` :
                    calTimeRangePreset === 'tomorrow' ? `🌅 Tomorrow's Scheduled Banquet Events` :
                    calTimeRangePreset === 'today' ? `⚡ Today's Live Banquet Events: ${today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` :
                    calTimeRangePreset === 'custom_date' && selectedCalDate ? `📅 Banquet Events for ${selectedCalDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` :
                    '🏛️ Consolidated Banquet Events & Leads'
                  ) : (
                    calTimeRangePreset === 'last_week' ? `⏮️ Last Week's Historical Bookings (${startOfLastWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${endOfLastWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })})` :
                    calTimeRangePreset === 'past_history' ? '⏳ All Past Dining History & Completed Bookings' :
                    calTimeRangePreset === 'future' ? '🔮 Upcoming Future Scheduled Bookings' :
                    calTimeRangePreset === 'this_month' ? `📆 All Bookings for ${currentCalMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}` :
                    calTimeRangePreset === 'this_week' ? `🗓️ This Week's Bookings (${startOfThisWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} – ${endOfThisWeek.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })})` :
                    calTimeRangePreset === 'tomorrow' ? `🌅 Tomorrow's Scheduled Bookings (${tomorrow.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })})` :
                    calTimeRangePreset === 'today' ? `⚡ Today's Live Bookings: ${today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` :
                    calTimeRangePreset === 'custom_date' && selectedCalDate ? `📅 Bookings for ${selectedCalDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}` :
                    '🌟 Consolidated Reservations Pipeline (History & Future)'
                  )}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Branch: <strong style={{ color: 'var(--gold)' }}>{calBranchFilter === 'All' ? 'All Outlets' : calBranchFilter}</strong> · Showing <strong style={{ color: '#FFFFFF' }}>{bookingServiceType === 'banquet' ? filteredSelectedBanquetEvents.length : filteredSelectedCalBookings.length}</strong> {bookingServiceType === 'banquet' ? 'banquet events' : 'parties'} matching active filters
                </p>
              </div>

              {/* Filter Row: Party Size & Timeline Scope */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                {bookingServiceType === 'dining' && (
                  <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setCalPartyFilter('all')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: calPartyFilter === 'all' ? 800 : 500,
                        background: calPartyFilter === 'all' ? 'var(--primary)' : 'transparent',
                        color: calPartyFilter === 'all' ? '#070A09' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      All Parties ({presetBookings.length})
                    </button>
                    <button
                      onClick={() => setCalPartyFilter('couple')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: calPartyFilter === 'couple' ? 800 : 600,
                        background: calPartyFilter === 'couple' ? 'var(--gold)' : 'transparent',
                        color: calPartyFilter === 'couple' ? '#070A09' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      ♥ 2 Guests (Couple) ({presetBookings.filter(b => b.guests === 2).length})
                    </button>
                    <button
                      onClick={() => setCalPartyFilter('family')}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: calPartyFilter === 'family' ? 800 : 500,
                        background: calPartyFilter === 'family' ? 'var(--primary)' : 'transparent',
                        color: calPartyFilter === 'family' ? '#070A09' : 'var(--text-muted)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Family / 4+ Covers ({presetBookings.filter(b => b.guests >= 3).length})
                    </button>
                  </div>
                )}

                {/* Timeline History Filter */}
                <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
                  {[
                    { id: 'all', label: 'All Records' },
                    { id: 'past', label: '⏳ Past History' },
                    { id: 'today', label: '⚡ Today Live' },
                    { id: 'future', label: '🔮 Future Bookings' }
                  ].map(h => (
                    <button
                      key={h.id}
                      onClick={() => setCalHistoryFilter(h.id as any)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: 10.5,
                        fontWeight: calHistoryFilter === h.id ? 800 : 500,
                        background: calHistoryFilter === h.id ? 'var(--gold)' : 'transparent',
                        color: calHistoryFilter === h.id ? '#070A09' : 'var(--text-dim)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of bookings for the selected date / range */}
            {bookingServiceType === 'banquet' ? (
              filteredSelectedBanquetEvents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', background: 'var(--surface-alt)', borderRadius: 14 }}>
                  <Building2 size={36} color="var(--gold)" style={{ opacity: 0.6, marginBottom: 8 }} />
                  <h4 style={{ fontSize: 15, color: '#FFFFFF', margin: '0 0 4px 0' }}>No Banquet Events Scheduled for this Filter</h4>
                  <p style={{ fontSize: 12, margin: '0 0 14px 0' }}>
                    Halls are open and available for event bookings. You can register inquiries from the Event Desk or lead pipeline.
                  </p>
                  <button
                    onClick={() => {
                      setEditingHall(null);
                      setShowBanquetMasterModal(true);
                    }}
                    className="btn btn-outline"
                    style={{ padding: '7px 16px', fontSize: 12, fontWeight: 700, borderColor: 'var(--gold)', color: 'var(--gold)' }}
                  >
                    <Building2 size={14} /> Open Banquet Master Desk
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                  {filteredSelectedBanquetEvents.map(ev => {
                    const [y, m, d] = ev.date.split('-').map(Number);
                    const evDate = new Date(y, m - 1, d);
                    const isPast = evDate < todayZeroHour || ev.status === 'Completed';
                    const isTodayEv = isSameDay(evDate, today);

                    return (
                      <div
                        key={ev.id}
                        style={{
                          background: 'var(--surface-alt)',
                          borderRadius: 16,
                          padding: 18,
                          border: '1.5px solid rgba(201, 162, 77, 0.4)',
                          boxShadow: '0 0 16px rgba(201, 162, 77, 0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: 12
                        }}
                      >
                        <div>
                          {/* Event Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div>
                              <h4 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                                {ev.eventName}
                              </h4>
                              <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                <Building2 size={13} /> {ev.hallName}
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Host: {ev.hostName} · {ev.mobile}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{
                                fontSize: 10,
                                fontWeight: 800,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: ev.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                color: ev.status === 'Confirmed' ? '#10B981' : '#94A3B8'
                              }}>
                                ● {ev.status}
                              </span>
                              <span style={{
                                fontSize: 9.5,
                                fontWeight: 800,
                                padding: '2px 7px',
                                borderRadius: 6,
                                background: 'rgba(201, 162, 77, 0.15)',
                                color: 'var(--gold)'
                              }}>
                                👥 {ev.guests} Guests
                              </span>
                            </div>
                          </div>

                          {/* Session & Date */}
                          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: '#FFFFFF',
                              fontWeight: 700
                            }}>
                              🕒 {ev.session} ({ev.timeSlot})
                            </span>
                            <span style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'rgba(255, 255, 255, 0.05)',
                              color: 'var(--text-muted)'
                            }}>
                              📅 {ev.displayDate}
                            </span>
                            <span style={{
                              fontSize: 11,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: 'rgba(201, 162, 77, 0.12)',
                              color: 'var(--gold)',
                              fontWeight: 700
                            }}>
                              🥗 {ev.cateringType}
                            </span>
                          </div>

                          {/* Financial Snapshot */}
                          <div style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            borderRadius: 10,
                            padding: '10px 12px',
                            marginTop: 10,
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 8
                          }}>
                            <div>
                              <span style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Per Plate</span>
                              <div style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>₹{ev.ratePerPlate}</div>
                            </div>
                            <div>
                              <span style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Est. Total</span>
                              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--gold)' }}>₹{(ev.totalEstimatedAmount / 1000).toFixed(0)}k</div>
                            </div>
                            <div>
                              <span style={{ fontSize: 9.5, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Advance</span>
                              <div style={{ fontSize: 13, fontWeight: 800, color: '#10B981' }}>₹{(ev.advancePaid / 1000).toFixed(0)}k</div>
                            </div>
                          </div>

                          {/* Notes */}
                          {ev.notes && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0 0', fontStyle: 'italic' }}>
                              "{ev.notes}"
                            </p>
                          )}

                          {/* Amenities tags */}
                          {ev.amenitiesRequested && ev.amenitiesRequested.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                              {ev.amenitiesRequested.map((tag, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: 9,
                                    padding: '1px 5px',
                                    borderRadius: 4,
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    color: 'var(--text-dim)'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Zero Points Policy compliance tag */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          paddingTop: 8,
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                          fontSize: 10.5
                        }}>
                          <span style={{ color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                            <ShieldCheck size={13} /> Zero Loyalty Points Policy (SRS 7.2)
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            {ev.outlet.replace('House of Yanki Banquets ', '').replace('Yanki Sizzlerr ', '')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : filteredSelectedCalBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)', background: 'var(--surface-alt)', borderRadius: 14 }}>
                <CheckCircle2 size={36} color="var(--gold)" style={{ opacity: 0.6, marginBottom: 8 }} />
                <h4 style={{ fontSize: 15, color: '#FFFFFF', margin: '0 0 4px 0' }}>No Bookings for this Range / Filter</h4>
                <p style={{ fontSize: 12, margin: 0 }}>
                  No reservations matching your filter. Click "Today", "Last Week", or select a specific date on the calendar above.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {filteredSelectedCalBookings.map((b) => {
                  const isCouple = b.guests === 2;
                  const isAssigned = Boolean(b.tableAssigned);
                  const bDate = parseBookingDate(b);
                  const isPast = bDate < todayZeroHour || b.status === 'Completed';
                  const isTodayBooking = isSameDay(bDate, today);

                  return (
                    <div
                      key={b.dbId}
                      style={{
                        background: 'var(--surface-alt)',
                        borderRadius: 16,
                        padding: 18,
                        border: isCouple 
                          ? '1.5px solid rgba(201, 162, 77, 0.5)' 
                          : '1px solid var(--border)',
                        boxShadow: isCouple ? '0 0 15px rgba(201, 162, 77, 0.12)' : 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 12,
                        opacity: isPast ? 0.9 : 1
                      }}
                    >
                      <div>
                        {/* Header: Customer & Guest Count + Timeline Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: 15, color: '#FFFFFF' }}>{b.customer}</strong>
                              {isTodayBooking ? (
                                <span style={{
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: 6,
                                  background: 'rgba(255, 138, 0, 0.2)',
                                  color: 'var(--primary)',
                                  border: '1px solid rgba(255, 138, 0, 0.4)'
                                }}>
                                  ⚡ Today Live
                                </span>
                              ) : isPast ? (
                                <span style={{
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: 6,
                                  background: 'rgba(148, 163, 184, 0.2)',
                                  color: '#94A3B8',
                                  border: '1px solid rgba(148, 163, 184, 0.3)'
                                }}>
                                  ⏳ Past History
                                </span>
                              ) : (
                                <span style={{
                                  fontSize: 9.5,
                                  fontWeight: 800,
                                  padding: '2px 7px',
                                  borderRadius: 6,
                                  background: 'rgba(16, 185, 129, 0.2)',
                                  color: '#10B981',
                                  border: '1px solid rgba(16, 185, 129, 0.4)'
                                }}>
                                  🔮 Future Booking
                                </span>
                              )}
                            </div>
                            {b.mobile && (
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                                {b.mobile} · {b.id}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            {/* Covers Badge (Highlighting 2 Guests Couple) */}
                            <span style={{
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '3px 8px',
                              borderRadius: 6,
                              background: isCouple ? 'rgba(201, 162, 77, 0.22)' : 'rgba(255, 138, 0, 0.16)',
                              color: isCouple ? 'var(--gold)' : 'var(--primary)',
                              border: isCouple ? '1px solid rgba(201, 162, 77, 0.5)' : '1px solid rgba(255, 138, 0, 0.4)'
                            }}>
                              {isCouple ? '♥ 2 Guests (Couple)' : `${b.guests} Guests`}
                            </span>

                            <span style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: b.vip ? 'var(--gold)' : '#10B981'
                            }}>
                              {b.vip ? `👑 ${b.tierPriorityTag || 'VIP'}` : '🎯 Guest'}
                            </span>
                          </div>
                        </div>

                        {/* Booking Specs: Venue & Time */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 12 }}>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'var(--text-dim)' }}>VENUE</span>
                            <strong style={{ color: '#FFFFFF' }}>{b.outlet}</strong>
                          </div>
                          <div>
                            <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'var(--text-dim)' }}>TIME</span>
                            <strong style={{ color: 'var(--primary)' }}>{b.date}</strong>
                          </div>
                        </div>

                        {/* Table Status Badge */}
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 8,
                            background: isAssigned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isAssigned ? '#10B981' : '#EF4444'
                          }}>
                            {isAssigned ? `Table: ${b.tableAssigned} (${b.status})` : '⚠️ No Table Assigned Yet'}
                          </span>

                          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                            ₹{b.bookingAdvance || 99} Advance Paid
                          </span>
                        </div>

                        {b.notes && (
                          <p style={{ fontSize: 11.5, color: 'var(--text-dim)', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                            "{b.notes}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={() => {
                            setSettlingItem(b);
                            const match = availableFloorTables.find(t => t.state === 'Available');
                            if (match) setSelectedTableToAssign(`T${match.tableNumber}`);
                          }}
                          className="btn btn-primary"
                          style={{ flex: 1.2, padding: '7px 10px', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                        >
                          <Armchair size={13} /> Settle Table
                        </button>

                        <button
                          onClick={() => setQueuingItem(b)}
                          className="btn btn-outline"
                          style={{ flex: 1, padding: '7px 10px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderColor: 'rgba(201, 162, 77, 0.4)', color: 'var(--gold)' }}
                        >
                          <ListOrdered size={13} /> Queue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* INCOMING TABLE INQUIRIES & SETTLEMENT DESK                     */}
      {/* ============================================================== */}
      {(viewMode === 'desk' || viewMode === 'calendar') && (
        <>
          <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
              <Armchair size={20} color="var(--gold)" /> Incoming Table Booking Inquiries & Settlement Desk
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Real-time booking inquiries from Mobile App & Web. Assign to dining tables, seat guests, or move to the live waitlist queue.
            </p>
          </div>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 800, 
            padding: '4px 12px', 
            borderRadius: 12, 
            background: incomingInquiries.length > 0 ? 'rgba(255, 138, 0, 0.18)' : 'rgba(16, 185, 129, 0.15)',
            color: incomingInquiries.length > 0 ? 'var(--primary)' : 'var(--success)',
            border: `1px solid ${incomingInquiries.length > 0 ? 'rgba(255, 138, 0, 0.4)' : 'rgba(16, 185, 129, 0.3)'}`
          }}>
            {incomingInquiries.length} Inquiries Needing Action
          </span>
        </div>

        {incomingInquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={36} color="var(--success)" style={{ opacity: 0.6, marginBottom: 8 }} />
            <h4 style={{ fontSize: 15, color: 'var(--text-main)', margin: '0 0 4px 0' }}>All Booking Inquiries Settled</h4>
            <p style={{ fontSize: 12, margin: 0 }}>All active guest parties have assigned dining tables or are seated. When a new inquiry arrives, the alert chime will beep automatically.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {incomingInquiries.map((inq) => {
              const isAssigned = Boolean(inq.tableAssigned);
              return (
                <div 
                  key={inq.dbId}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 16,
                    padding: 18,
                    border: isAssigned ? '1px solid var(--border)' : '1px solid rgba(255, 138, 0, 0.5)',
                    boxShadow: isAssigned ? 'none' : '0 0 15px rgba(255, 138, 0, 0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14
                  }}
                >
                  {/* Top Bar: Customer & Priority Tier */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <strong style={{ fontSize: 15, color: 'var(--text-main)' }}>{inq.customer}</strong>
                        {inq.mobile && (
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 2 }}>
                            {inq.mobile} · {inq.id}
                          </span>
                        )}
                      </div>

                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: inq.vip ? 'rgba(201, 162, 77, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                        color: inq.vip ? 'var(--gold)' : '#10B981',
                        border: inq.vip ? '1px solid rgba(201, 162, 77, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)'
                      }}>
                        {inq.vip ? `👑 ${inq.tierPriorityTag || 'VIP'}` : '🎯 Guest Diner'}
                      </span>
                    </div>

                    {/* Booking Specs */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12, fontSize: 12 }}>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'var(--text-dim)' }}>VENUE</span>
                        <strong style={{ color: 'var(--text-main)' }}>{inq.outlet}</strong>
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        <span style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', color: 'var(--text-dim)' }}>TIME & COVERS</span>
                        <strong style={{ color: 'var(--primary)' }}>{inq.date} ({inq.guests} Guests)</strong>
                      </div>
                    </div>

                    {/* Table Status Badge */}
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 8,
                        background: isAssigned ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isAssigned ? '#10B981' : '#EF4444'
                      }}>
                        {isAssigned ? `Table: ${inq.tableAssigned} (${inq.status})` : '⚠️ No Table Assigned Yet'}
                      </span>

                      <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>
                        ₹{inq.bookingAdvance || 99} Advance Paid
                      </span>
                    </div>

                    {inq.notes && (
                      <p style={{ fontSize: 11.5, color: 'var(--text-dim)', fontStyle: 'italic', margin: '8px 0 0 0' }}>
                        "{inq.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions: Settle Table | Send to Queue | Decline */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => {
                        setSettlingItem(inq);
                        const match = availableFloorTables.find(t => t.state === 'Available');
                        if (match) setSelectedTableToAssign(`T${match.tableNumber}`);
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1.2, padding: '7px 10px', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    >
                      <Armchair size={13} /> Settle Table
                    </button>

                    <button
                      onClick={() => setQueuingItem(inq)}
                      className="btn btn-outline"
                      style={{ flex: 1, padding: '7px 10px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderColor: 'rgba(201, 162, 77, 0.4)', color: 'var(--gold)' }}
                      title="Move party to live waitlist queue if dining tables are full"
                    >
                      <ListOrdered size={13} /> Queue
                    </button>

                    <button
                      onClick={() => updateUpcomingStatus(inq.id, 'Cancelled')}
                      className="btn btn-outline"
                      style={{ padding: '7px 10px', fontSize: 11, borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
                      title="Decline / Cancel reservation"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6 Top Metric Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: 16 
      }}>
        {dynamicKpiStats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.k} className="kpi-card" style={{ padding: '16px 18px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="kpi-header" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="kpi-label" style={{ fontSize: 10.5, letterSpacing: '0.08em' }}>
                  {item.k}
                </span>
                <Icon size={15} color="var(--gold)" />
              </div>
              <div className="kpi-value" style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                {item.v}
              </div>
              {item.delta && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                  {item.delta}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid: Peak Hours Chart (2 cols) & Upcoming Bookings (1 col) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 24,
        alignItems: 'stretch'
      }}>
        {/* Peak Hours Today Chart Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                  Peak Hours Distribution · Today
                </h2>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Hourly customer footfall and floor load across Yanki venues
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                <span>Covers Booked</span>
              </div>
            </div>

            <div style={{ height: 260, width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={peakHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="h" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: 'var(--border)' }} 
                  />
                  <YAxis 
                    stroke="var(--text-muted)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={{ stroke: 'var(--border)' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255, 138, 0, 0.08)' }}
                    contentStyle={{ 
                      background: 'var(--surface-raised)',
                      borderRadius: 12, 
                      border: '1px solid var(--border)', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      color: 'var(--text-main)',
                      fontSize: 12 
                    }}
                    formatter={(value: any) => [`${value} Guests`, 'Reservations']}
                  />
                  <Bar 
                    dataKey="v" 
                    fill="#FF8A00" 
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '14px 18px', 
            borderRadius: 14, 
            background: 'var(--surface-alt)', 
            border: '1px solid var(--border-subtle)',
            marginTop: 16,
            fontSize: 12 
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Dinner Rush Window: </span>
              <strong style={{ color: 'var(--primary)' }}>7:30 PM – 9:30 PM (160+ Guests)</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Recommended Staffing: </span>
              <strong style={{ color: 'var(--gold)' }}>Peak Capacity (Full Brigade)</strong>
            </div>
          </div>
        </div>

        {/* Upcoming Fast-List Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
                Upcoming Arrivals
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Next arriving dining guests & VIP concierge
              </p>
            </div>
            <span style={{ 
              fontSize: 11, 
              fontWeight: 700, 
              color: 'var(--gold-dark)', 
              background: 'var(--gold-light)', 
              padding: '4px 8px', 
              borderRadius: 6 
            }}>
              {upcomingList.filter(u => u.status === 'Confirmed' || u.status === 'Seated').length} Confirmed
            </span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
            {upcomingList.slice(0, 4).map((item) => (
              <li 
                key={item.id} 
                style={{ 
                  padding: '12px 14px', 
                  borderRadius: 14, 
                  background: 'var(--background)', 
                  border: '1px solid var(--border)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)', margin: 0 }} className="truncate">
                      {item.customer}
                    </p>
                    {item.vip && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        borderRadius: 9999,
                        background: 'rgba(201, 162, 77, 0.15)',
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--gold-dark)'
                      }}>
                        <Crown size={11} color="var(--gold)" />
                        VIP
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    background: item.status === 'Confirmed' || item.status === 'Seated' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: item.status === 'Confirmed' || item.status === 'Seated' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {item.status}
                  </span>
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  {item.outlet} · {item.date} · {item.guests} guests
                </p>

                {item.tableAssigned && (
                  <p style={{ fontSize: 11.5, color: 'var(--primary)', fontWeight: 600, margin: '2px 0 0 0' }}>
                    Dining Table: {item.tableAssigned}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {item.status !== 'Completed' && (
                    <button
                      onClick={() => updateUpcomingStatus(item.id, 'Completed')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--success)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Check size={11} /> Mark Done
                    </button>
                  )}
                  {item.status !== 'Cancelled' && (
                    <button
                      onClick={() => updateUpcomingStatus(item.id, 'Cancelled')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <X size={11} /> Cancel
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
        </>
      )}

      {/* Complete Reservations Ledger */}
      {(viewMode === 'ledger' || viewMode === 'calendar') && (
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Header & Filter Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 16, 
          marginBottom: 20 
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
              Complete Reservations Ledger
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Full audit trail of all historical and active bookings across Yanki outlets
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              borderRadius: 12,
              background: 'var(--background)',
              border: '1px solid var(--border)',
              width: 220
            }}>
              <Search size={14} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search guest or ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12,
                  width: '100%',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {/* Venue Filter Pills */}
            <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
              {['All', 'Navrangpura', 'Bodakdev', 'Shilaj', 'Gandhinagar'].map((outlet) => (
                <button
                  key={outlet}
                  onClick={() => setSelectedOutlet(outlet)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: selectedOutlet === outlet ? 700 : 500,
                    background: selectedOutlet === outlet ? 'var(--primary)' : 'transparent',
                    color: selectedOutlet === outlet ? '#070A09' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {outlet}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                background: 'var(--background)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Seated">Seated</option>
              <option value="Pending">Pending</option>
              <option value="Waitlisted">Waitlisted</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div style={{ overflowX: 'auto' }}>
          <table className="sizzlo-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 14px' }}>Ref</th>
                <th style={{ padding: '12px 14px' }}>Customer & Priority Tier</th>
                <th style={{ padding: '12px 14px' }}>Outlet</th>
                <th style={{ padding: '12px 14px' }}>Date & Time</th>
                <th style={{ padding: '12px 14px' }}>Party Size</th>
                <th style={{ padding: '12px 14px' }}>Table Assigned</th>
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUpcoming.map((item) => (
                <tr key={item.id} style={{ 
                  borderBottom: '1px solid var(--border)',
                  background: item.vip ? 'rgba(201, 162, 77, 0.04)' : 'transparent' 
                }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{item.customer}</span>
                      {item.vip ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          background: 'rgba(201, 162, 77, 0.18)',
                          color: 'var(--gold-dark)',
                          border: '1px solid rgba(201, 162, 77, 0.4)',
                          borderRadius: 9999,
                          padding: '2px 8px',
                          fontSize: 10,
                          fontWeight: 800
                        }}>
                          <Crown size={11} color="var(--gold)" /> ★ VIP · {item.tierPriorityTag || 'VIP'}
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: 9999,
                          padding: '2px 8px',
                          fontSize: 10,
                          fontWeight: 700
                        }}>
                          🎯 Guest Diner
                        </span>
                      )}
                    </div>
                    {item.mobile && (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginTop: 3 }}>
                        {item.mobile}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px', fontSize: 13 }}>{item.outlet}</td>
                  <td style={{ padding: '14px', fontSize: 13, color: 'var(--text-main)', fontWeight: 500 }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 700, fontSize: 13 }}>
                    {item.guests} Guests
                  </td>
                  <td style={{ padding: '14px', fontSize: 13 }}>
                    {item.tableAssigned ? (
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                        {item.tableAssigned}
                      </span>
                    ) : (
                      <button
                        onClick={() => setSettlingItem(item)}
                        style={{
                          background: 'rgba(255, 138, 0, 0.15)',
                          border: '1px solid rgba(255, 138, 0, 0.4)',
                          color: 'var(--primary)',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        + Assign Table
                      </button>
                    )}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 9999,
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: item.status === 'Confirmed' || item.status === 'Seated' ? 'rgba(16, 185, 129, 0.12)' :
                                  item.status === 'Completed' ? 'rgba(14, 59, 50, 0.12)' :
                                  item.status === 'Pending' || item.status === 'Waitlisted' ? 'rgba(245, 158, 11, 0.12)' :
                                  'rgba(239, 68, 68, 0.12)',
                      color: item.status === 'Confirmed' || item.status === 'Seated' ? 'var(--success)' :
                             item.status === 'Completed' ? 'var(--primary)' :
                             item.status === 'Pending' || item.status === 'Waitlisted' ? 'var(--warning)' :
                             'var(--danger)'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setSettlingItem(item)}
                        style={{
                          padding: '6px 10px',
                          fontSize: 11,
                          fontWeight: 600,
                          borderRadius: 8,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          cursor: 'pointer'
                        }}
                      >
                        Settle
                      </button>
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => updateUpcomingStatus(item.id, 'Completed')}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 8,
                            background: 'var(--surface-alt)',
                            border: '1px solid var(--border)',
                            color: 'var(--success)',
                            cursor: 'pointer'
                          }}
                        >
                          Seat
                        </button>
                      )}
                      {item.status !== 'Cancelled' && (
                        <button
                          onClick={() => updateUpcomingStatus(item.id, 'Cancelled')}
                          style={{
                            padding: '6px 10px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 8,
                            background: 'var(--surface-alt)',
                            border: '1px solid var(--border)',
                            color: 'var(--danger)',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: Settle Dining Table Assignment                        */}
      {/* ============================================================== */}
      {settlingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 110,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 520,
            maxWidth: '100%',
            borderRadius: 20,
            padding: 26,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                  Settle Dining Table
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Assign table for <strong>{settlingItem.customer}</strong> ({settlingItem.guests} Guests) at {settlingItem.outlet}
                </p>
              </div>
              <button 
                onClick={() => setSettlingItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignTable}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Select Available Table *
                </label>
                {availableFloorTables.filter(t => t.state === 'Available').length === 0 ? (
                  <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, color: 'var(--danger)', fontSize: 12 }}>
                    All dining tables are currently occupied or reserved! You can move this party to the <strong>Live Waitlist Queue</strong> instead.
                  </div>
                ) : (
                  <select
                    value={selectedTableToAssign}
                    onChange={(e) => setSelectedTableToAssign(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      fontWeight: 600
                    }}
                  >
                    <option value="">-- Choose Dining Table --</option>
                    {availableFloorTables.filter(t => t.state === 'Available').map(t => (
                      <option key={t.id} value={`T${t.tableNumber}`}>
                        Table T{t.tableNumber} — {t.seats} Seats ({t.floorSection || 'Main Dining Floor'}) {t.premium ? '★ VIP' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Seating Mode:
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setTableAssignState('Occupied')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: tableAssignState === 'Occupied' ? 'rgba(255,138,0,0.2)' : 'var(--surface-alt)',
                      color: tableAssignState === 'Occupied' ? 'var(--primary)' : 'var(--text-muted)',
                      border: tableAssignState === 'Occupied' ? '1px solid var(--primary)' : '1px solid var(--border)'
                    }}
                  >
                    Seat Now (Occupied)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTableAssignState('Reserved')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: tableAssignState === 'Reserved' ? 'rgba(201,162,77,0.2)' : 'var(--surface-alt)',
                      color: tableAssignState === 'Reserved' ? 'var(--gold)' : 'var(--text-muted)',
                      border: tableAssignState === 'Reserved' ? '1px solid var(--gold)' : '1px solid var(--border)'
                    }}
                  >
                    Pre-reserve (Reserved)
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setSettlingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmittingAssign || availableFloorTables.filter(t => t.state === 'Available').length === 0}
                  style={{ fontWeight: 800, padding: '8px 24px' }}
                >
                  Confirm & Settle Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Move Party to Waitlist Queue                          */}
      {/* ============================================================== */}
      {queuingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 110,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 440,
            maxWidth: '100%',
            borderRadius: 20,
            padding: 26,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', margin: 0 }}>
                  Move to Live Queue
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Queue <strong>{queuingItem.customer}</strong> ({queuingItem.guests} Guests) in live dining waitlist
                </p>
              </div>
              <button 
                onClick={() => setQueuingItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmSendToQueue}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Estimated Wait Time:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[10, 15, 20, 30].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setQueueWaitMinutes(mins)}
                      style={{
                        padding: '10px 6px',
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: queueWaitMinutes === mins ? 'rgba(201, 162, 77, 0.25)' : 'var(--surface-alt)',
                        color: queueWaitMinutes === mins ? 'var(--gold)' : 'var(--text-muted)',
                        border: queueWaitMinutes === mins ? '1px solid var(--gold)' : '1px solid var(--border)'
                      }}
                    >
                      {mins} mins
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setQueuingItem(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQueue}
                  className="btn btn-primary"
                  style={{ fontWeight: 800, padding: '8px 20px' }}
                >
                  Add to Live Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Dynamic Outlet Time Slots Modal                       */}
      {/* ============================================================== */}
      {showSlotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 110,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 600,
            maxWidth: '100%',
            borderRadius: 20,
            padding: 28,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Dynamic Outlet Time Slots
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Configure available reservation slots. Active slots reflect instantly in the mobile app.
                </p>
              </div>
              <button 
                onClick={() => setShowSlotModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}
              >
                <X size={18} />
              </button>
            </div>

            {slotNotice && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid #10B981',
                color: '#10B981',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 16
              }}>
                {slotNotice}
              </div>
            )}

            {/* Add New Slot Form */}
            <form onSubmit={handleCreateSlot} style={{ 
              background: 'var(--surface-alt)', 
              padding: '18px 20px', 
              borderRadius: 14, 
              border: '1px solid var(--border)',
              marginBottom: 20 
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Add New Slot</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Slot Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 PM"
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      fontSize: 12,
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Session</label>
                  <select
                    value={newSlotSession}
                    onChange={(e) => setNewSlotSession(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      fontSize: 12,
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="LUNCH">Lunch Session</option>
                    <option value="DINNER">Dinner Session</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Venue Scoping</label>
                  <select
                    value={newSlotOutlet}
                    onChange={(e) => setNewSlotOutlet(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--background)',
                      fontSize: 12,
                      color: 'var(--text-main)',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="All Outlets">All Outlets (Universal)</option>
                    {availableOutlets.map((o) => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isSavingSlot}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '9px 20px',
                    fontSize: 12,
                    fontWeight: 700,
                    borderRadius: 8
                  }}
                >
                  <Plus size={14} />
                  <span>Add Time Slot</span>
                </button>
              </div>
            </form>

            {/* List of Existing Slots with Outlet Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Configured Slots</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Filter Outlet:</span>
                  <select
                    value={slotFilterOutlet}
                    onChange={(e) => setSlotFilterOutlet(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--surface-alt)',
                      color: 'var(--text-main)',
                      fontSize: 11
                    }}
                  >
                    <option value="All Outlets">All Configured Slots</option>
                    {availableOutlets.map(o => (
                      <option key={o.id} value={o.name}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {slotsList.filter(s => slotFilterOutlet === 'All Outlets' || s.outlet === 'All Outlets' || s.outlet === slotFilterOutlet).length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No slots found for this selection.</p>
              ) : (
                slotsList
                  .filter(s => slotFilterOutlet === 'All Outlets' || s.outlet === 'All Outlets' || s.outlet === slotFilterOutlet)
                  .map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: slot.active ? 'var(--surface-alt)' : 'rgba(255, 255, 255, 0.02)',
                      border: slot.active ? '1px solid var(--border)' : '1px dashed rgba(255, 255, 255, 0.08)',
                      opacity: slot.active ? 1 : 0.6
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-main)', minWidth: 70 }}>
                        {slot.slotTime}
                      </span>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: slot.session === 'LUNCH' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: slot.session === 'LUNCH' ? '#F59E0B' : '#3B82F6'
                      }}>
                        {slot.session}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {slot.outlet}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        onClick={() => handleToggleSlot(slot.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 10.5,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: slot.active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: slot.active ? '#10B981' : '#EF4444'
                        }}
                      >
                        {slot.active ? 'ACTIVE IN APP' : 'HIDDEN'}
                      </button>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 4
                        }}
                        title="Delete slot"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setShowSlotModal(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: Dynamic Banquet Master Configuration Modal            */}
      {/* ============================================================== */}
      {showBanquetMasterModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 120,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 860,
            maxWidth: '100%',
            borderRadius: 22,
            padding: 28,
            border: '1.5px solid rgba(201, 162, 77, 0.4)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
            maxHeight: '88vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Building2 size={22} color="var(--gold)" />
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
                    Dynamic Banquet Master Desk
                  </h3>
                </div>
                <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  Manage banquet halls dynamically per outlet. Not all outlets have banquet halls (e.g. Bodakdev is dining-only, while Bopal has grand ballrooms). Add, edit, or reassign halls anytime.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowBanquetMasterModal(false);
                  setEditingHall(null);
                }}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Notification Notice */}
            {banquetNotice && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.14)',
                border: '1px solid #10B981',
                color: '#10B981',
                padding: '10px 14px',
                borderRadius: 10,
                fontSize: 12.5,
                fontWeight: 700,
                marginBottom: 16
              }}>
                {banquetNotice}
              </div>
            )}

            {/* Top Toolbar: Search, Filter, +Add Hall */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                {/* Search */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  minWidth: 220
                }}>
                  <Search size={14} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search halls by name or amenity..."
                    value={banquetMasterSearch}
                    onChange={(e) => setBanquetMasterSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: 12,
                      width: '100%',
                      color: 'var(--text-main)'
                    }}
                  />
                </div>

                {/* Outlet Filter */}
                <select
                  value={banquetMasterOutletFilter}
                  onChange={(e) => setBanquetMasterOutletFilter(e.target.value)}
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: '#FFFFFF',
                    padding: '8px 12px',
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  <option value="All">All Outlets</option>
                  {availableOutlets.map(o => (
                    <option key={o.id} value={o.name}>{o.name}</option>
                  ))}
                  {availableOutlets.length === 0 && (
                    <>
                      <option value="House of Yanki Banquets Bopal">House of Yanki Banquets Bopal</option>
                      <option value="Yanki Sizzlerr SG Highway">Yanki Sizzlerr SG Highway</option>
                      <option value="Yanki Sizzlerr Bodakdev">Yanki Sizzlerr Bodakdev</option>
                      <option value="Dough by Yanki CG Road">Dough by Yanki CG Road</option>
                    </>
                  )}
                </select>
              </div>

              {!editingHall && (
                <button
                  onClick={() => setEditingHall({
                    name: '',
                    outletName: banquetMasterOutletFilter !== 'All' ? banquetMasterOutletFilter : 'House of Yanki Banquets Bopal',
                    minCapacity: 50,
                    maxCapacity: 250,
                    ratePerPlate: 950,
                    slotRentalPrice: 35000,
                    supportedSessions: 'Morning,Evening',
                    amenities: 'Stage,Central AC,Audio/Visual,Valet Parking',
                    status: 'Active'
                  })}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Plus size={15} /> Add New Banquet Hall
                </button>
              )}
            </div>

            {/* ADD / EDIT HALL FORM DRAWER */}
            {editingHall && (
              <form 
                onSubmit={handleSaveHall} 
                style={{
                  background: 'var(--surface-alt)',
                  border: '1.5px solid rgba(201, 162, 77, 0.5)',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Building2 size={16} /> {editingHall.id ? `Edit Hall: ${editingHall.name}` : 'Register New Banquet Hall'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingHall(null)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 12 }}>
                  {/* Hall Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Hall Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Imperial Grand Ballroom"
                      value={editingHall.name || ''}
                      onChange={(e) => setEditingHall({ ...editingHall, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Outlet */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Associated Outlet / Branch *
                    </label>
                    <select
                      value={editingHall.outletName || ''}
                      onChange={(e) => setEditingHall({ ...editingHall, outletName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    >
                      {availableOutlets.map(o => (
                        <option key={o.id} value={o.name}>{o.name}</option>
                      ))}
                      {availableOutlets.length === 0 && (
                        <>
                          <option value="House of Yanki Banquets Bopal">House of Yanki Banquets Bopal</option>
                          <option value="Yanki Sizzlerr SG Highway">Yanki Sizzlerr SG Highway</option>
                          <option value="Yanki Sizzlerr Bodakdev">Yanki Sizzlerr Bodakdev</option>
                          <option value="Dough by Yanki CG Road">Dough by Yanki CG Road</option>
                          <option value="Yanki Sizzlerr Vastrapur Lake">Yanki Sizzlerr Vastrapur Lake</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Min Capacity */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Min Pax (Guests)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={editingHall.minCapacity || 50}
                      onChange={(e) => setEditingHall({ ...editingHall, minCapacity: parseInt(e.target.value) || 10 })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Max Capacity */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Max Pax (Guests)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={2000}
                      value={editingHall.maxCapacity || 300}
                      onChange={(e) => setEditingHall({ ...editingHall, maxCapacity: parseInt(e.target.value) || 50 })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Per Plate Rate */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Rate Per Plate (₹)
                    </label>
                    <input
                      type="number"
                      min={300}
                      value={editingHall.ratePerPlate || 950}
                      onChange={(e) => setEditingHall({ ...editingHall, ratePerPlate: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Slot Rental Price */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Slot Rental Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={editingHall.slotRentalPrice || 35000}
                      onChange={(e) => setEditingHall({ ...editingHall, slotRentalPrice: parseInt(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Supported Sessions */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Supported Sessions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Morning, Evening, Full Day"
                      value={editingHall.supportedSessions || 'Morning,Evening'}
                      onChange={(e) => setEditingHall({ ...editingHall, supportedSessions: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Operational Status
                    </label>
                    <select
                      value={editingHall.status || 'Active'}
                      onChange={(e) => setEditingHall({ ...editingHall, status: e.target.value as any })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        background: 'var(--background)',
                        border: '1px solid var(--border)',
                        color: '#FFFFFF',
                        borderRadius: 8,
                        fontSize: 12
                      }}
                    >
                      <option value="Active">Active (Accepting Bookings)</option>
                      <option value="Maintenance">Under Maintenance</option>
                      <option value="Inactive">Inactive / Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Amenities & Facilities (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grand Stage, Audio/Visual, Bridal Green Room, Central AC, Valet Parking"
                    value={editingHall.amenities || ''}
                    onChange={(e) => setEditingHall({ ...editingHall, amenities: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      color: '#FFFFFF',
                      borderRadius: 8,
                      fontSize: 12
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingHall(null)}
                    className="btn btn-outline"
                    style={{ padding: '8px 14px', fontSize: 12 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingHall}
                    className="btn btn-primary"
                    style={{ padding: '8px 20px', fontSize: 12, fontWeight: 800 }}
                  >
                    {isSavingHall ? 'Saving...' : (editingHall.id ? 'Save Changes' : 'Create Banquet Hall')}
                  </button>
                </div>
              </form>
            )}

            {/* REGISTERED BANQUET HALLS LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {banquetHallsList
                .filter(h => {
                  const matchesSearch = !banquetMasterSearch || 
                    h.name.toLowerCase().includes(banquetMasterSearch.toLowerCase()) ||
                    h.outletName.toLowerCase().includes(banquetMasterSearch.toLowerCase()) ||
                    (h.amenities && h.amenities.toLowerCase().includes(banquetMasterSearch.toLowerCase()));
                  const matchesOutlet = banquetMasterOutletFilter === 'All' || h.outletName === banquetMasterOutletFilter;
                  return matchesSearch && matchesOutlet;
                })
                .map(hall => (
                  <div
                    key={hall.id}
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 14,
                      padding: 16,
                      border: '1px solid var(--border)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                          {hall.name}
                        </h4>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: hall.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                          color: hall.status === 'Active' ? '#10B981' : '#EAB308'
                        }}>
                          ● {hall.status}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                          <MapPin size={12} /> {hall.outletName}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          👥 {hall.minCapacity} – {hall.maxCapacity} Pax
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          ₹{hall.ratePerPlate || 950}/plate · ₹{(hall.slotRentalPrice || 35000).toLocaleString('en-IN')} rental
                        </span>
                      </div>

                      {hall.amenities && (
                        <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '6px 0 0 0' }}>
                          Amenities: {hall.amenities}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleToggleHallStatus(hall)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          background: hall.status === 'Active' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(234, 179, 8, 0.18)',
                          color: hall.status === 'Active' ? '#10B981' : '#EAB308'
                        }}
                      >
                        {hall.status === 'Active' ? 'ACTIVE' : 'MAINTENANCE'}
                      </button>
                      <button
                        onClick={() => setEditingHall(hall)}
                        className="btn btn-outline"
                        style={{ padding: '6px 10px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                        title="Edit hall details"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteHall(hall.id, hall.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: 6
                        }}
                        title="Delete hall"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}

              {banquetHallsList.filter(h => {
                const matchesSearch = !banquetMasterSearch || 
                  h.name.toLowerCase().includes(banquetMasterSearch.toLowerCase()) ||
                  h.outletName.toLowerCase().includes(banquetMasterSearch.toLowerCase());
                const matchesOutlet = banquetMasterOutletFilter === 'All' || h.outletName === banquetMasterOutletFilter;
                return matchesSearch && matchesOutlet;
              }).length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)' }}>
                  <Building2 size={32} color="var(--gold)" style={{ opacity: 0.5, marginBottom: 8 }} />
                  <p style={{ margin: 0, fontSize: 13 }}>No banquet halls matching the current filter.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowBanquetMasterModal(false);
                  setEditingHall(null);
                }}
                style={{ padding: '8px 24px', fontWeight: 800 }}
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
