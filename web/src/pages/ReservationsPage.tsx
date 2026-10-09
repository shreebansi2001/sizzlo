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
  TrendingUp,
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Bell,
  Armchair,
  AlertCircle,
  CheckCircle2,
  ListOrdered
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
import { Reservation, OutletTimeSlot, Outlet } from '../types';
import { fetchAllTimeSlots, createTimeSlot, toggleTimeSlot, deleteTimeSlot, fetchOutlets } from '../api/client';

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
}

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

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ reservations: initialReservations, onRefresh }) => {
  const mapReservations = (list: Reservation[]): UpcomingItem[] => {
    const mapped = list.map(r => ({
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
    }));

    // VIP Subscriber Priority: Subscribed VIPs always go to top of queue!
    return mapped.sort((a, b) => {
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

  const loadSlots = async () => {
    try {
      const data = await fetchAllTimeSlots();
      setSlotsList(data);
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
      {/* INCOMING TABLE INQUIRIES & SETTLEMENT DESK                     */}
      {/* ============================================================== */}
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

      {/* Live Table & Host Station Pipeline */}
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
    </div>
  );
};
