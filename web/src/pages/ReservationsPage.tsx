import React, { useState, useEffect } from 'react';
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
  RefreshCw
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
import { Reservation, OutletTimeSlot } from '../types';
import { fetchAllTimeSlots, createTimeSlot, toggleTimeSlot, deleteTimeSlot } from '../api/client';

interface ReservationsPageProps {
  reservations: Reservation[];
  onRefresh?: () => void;
}

const peakHoursData = [
  { h: '12 PM', v: 0 },
  { h: '1 PM', v: 0 },
  { h: '2 PM', v: 0 },
  { h: '7 PM', v: 0 },
  { h: '8 PM', v: 0 },
  { h: '9 PM', v: 0 },
  { h: '10 PM', v: 0 }
];

interface UpcomingItem {
  dbId: string | number;
  id: string;
  customer: string;
  mobile?: string;
  outlet: string;
  date: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  vip: boolean;
  tierPriorityTag?: string;
  bookingAdvance?: number;
  advancePaid?: boolean;
  advanceDeducted?: boolean;
  notes?: string;
}

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
      bookingAdvance: r.bookingAdvance !== undefined ? r.bookingAdvance : (r.vip ? 0 : 100),
      advancePaid: r.advancePaid !== undefined ? r.advancePaid : true,
      advanceDeducted: r.advanceDeducted || false,
      notes: r.specialRequests,
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
  
  // Dynamic Slots State
  const [slotsList, setSlotsList] = useState<OutletTimeSlot[]>([]);
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

  const fetchLiveReservations = async () => {
    try {
      const res = await axios.get('/api/reservations');
      if (res.data?.success && res.data.data) {
        setUpcomingList(mapReservations(res.data.data));
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchLiveReservations();
    loadSlots();
  }, []);

  useEffect(() => {
    if (initialReservations && initialReservations.length > 0) {
      setUpcomingList(mapReservations(initialReservations));
    }
  }, [initialReservations]);

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

    // Optimistic update
    setUpcomingList(prev => prev.map(u => u.dbId === targetItem.dbId ? { ...u, status: newStatus } : u));
    try {
      await axios.patch(`/api/reservations/${targetItem.dbId}/status?status=${newStatus}`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to update status on server', err);
      fetchLiveReservations();
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

  const vipCount = upcomingList.filter(u => u.vip).length;
  const nonVipCount = upcomingList.length - vipCount;
  const totalGuests = upcomingList.reduce((sum, r) => sum + (r.guests || 2), 0);
  const totalAdvance = upcomingList
    .filter(u => !u.vip && u.advancePaid)
    .reduce((sum, r) => sum + (r.bookingAdvance || 100), 0);

  const dynamicKpiStats = [
    { k: 'Total Guests Today', v: `${totalGuests}`, icon: Users, delta: `${upcomingList.length} total party bookings` },
    { k: '👑 Subscribed VIPs', v: `${vipCount}`, icon: Crown, delta: 'High Priority Desk Seating' },
    { k: '🎯 Non-Subscribers', v: `${nonVipCount}`, icon: Calendar, delta: `Holding deposit ₹100 collected` },
    { k: 'Advance Held at Desk', v: `₹${totalAdvance}`, icon: TrendingUp, delta: 'Deductible at POS billing' },
    { k: 'Peak Hour', v: '8 PM', icon: Clock, delta: 'Dinner peak rush' },
    { k: 'Dynamic Slots Active', v: `${slotsList.filter(s => s.active).length} / ${slotsList.length}`, icon: MapPin, delta: 'Synced with mobile app' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
                  Peak hours · today
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
                Upcoming
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Next arriving guests & VIP concierge
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
              {upcomingList.filter(u => u.status === 'Confirmed').length} Confirmed
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
                    background: item.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: item.status === 'Confirmed' ? 'var(--success)' : 'var(--warning)'
                  }}>
                    {item.status}
                  </span>
                </div>

                <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  {item.outlet} · {item.date} · {item.guests} guests
                </p>

                {item.notes && (
                  <p style={{ fontSize: 11, color: 'var(--text-dim)', margin: '4px 0 0 0', fontStyle: 'italic' }}>
                    "{item.notes}"
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
                      <Check size={11} /> Seat
                    </button>
                  )}
                  {item.status === 'Pending' && (
                    <button
                      onClick={() => updateUpcomingStatus(item.id, 'Confirmed')}
                      style={{
                        padding: '4px 10px',
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 8,
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#070A09',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      Confirm
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
              Live Host Station & Table Bookings
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Manage seating allocations, special requests and guest arrivals in real time
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Manage Dynamic Slots Button */}
            <button
              onClick={() => setShowSlotModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 700,
                background: 'var(--surface-alt)',
                color: 'var(--primary)',
                border: '1px solid var(--gold)',
                cursor: 'pointer'
              }}
            >
              <Clock size={14} color="var(--gold)" />
              Manage Time Slots ({slotsList.filter(s => s.active).length} Active)
            </button>

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
              {['All', 'Yanki Sizzlerr', 'House of Yanki', 'Dough by Yanki'].map((outlet) => (
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
                    boxShadow: selectedOutlet === outlet ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
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
              <option value="Pending">Pending</option>
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
                <th style={{ padding: '12px 14px' }}>Status</th>
                <th style={{ padding: '12px 14px' }}>Special Requests</th>
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
                          <Crown size={11} color="var(--gold)" /> ★ VIP PRIORITY · {item.tierPriorityTag || 'VIP'}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
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
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: item.advanceDeducted ? 'var(--text-muted)' : '#10B981',
                            background: item.advanceDeducted ? 'var(--surface-alt)' : 'rgba(16, 185, 129, 0.08)',
                            padding: '2px 6px',
                            borderRadius: 6
                          }}>
                            {item.advanceDeducted ? '✓ ₹100 Advance Deducted' : '₹100 Holding Advance (POS Deductible)'}
                          </span>
                        </div>
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
                  <td style={{ padding: '14px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 9999,
                      fontSize: 10.5,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: item.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.12)' :
                                  item.status === 'Completed' ? 'rgba(14, 59, 50, 0.12)' :
                                  item.status === 'Pending' ? 'rgba(245, 158, 11, 0.12)' :
                                  'rgba(239, 68, 68, 0.12)',
                      color: item.status === 'Confirmed' ? 'var(--success)' :
                             item.status === 'Completed' ? 'var(--primary)' :
                             item.status === 'Pending' ? 'var(--warning)' :
                             'var(--danger)'
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px', fontSize: 12, color: 'var(--text-muted)' }}>
                    {item.notes || 'No special requests'}
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      {item.status !== 'Completed' && (
                        <button
                          onClick={() => updateUpcomingStatus(item.id, 'Completed')}
                          style={{
                            padding: '6px 12px',
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
                          <Check size={12} /> Seat
                        </button>
                      )}
                      {item.status === 'Pending' && (
                        <button
                          onClick={() => updateUpcomingStatus(item.id, 'Confirmed')}
                          style={{
                            padding: '6px 12px',
                            fontSize: 11,
                            fontWeight: 600,
                            borderRadius: 8,
                            background: 'var(--primary)',
                            border: 'none',
                            color: '#070A09',
                            cursor: 'pointer'
                          }}
                        >
                          Confirm
                        </button>
                      )}
                      {item.status !== 'Cancelled' && (
                        <button
                          onClick={() => updateUpcomingStatus(item.id, 'Cancelled')}
                          style={{
                            padding: '6px 12px',
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
                          <X size={12} /> Cancel
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

      {/* Dynamic Outlet Time Slots Modal */}
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
              padding: 16, 
              borderRadius: 14, 
              border: '1px solid var(--border)',
              marginBottom: 20 
            }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-main)' }}>Add New Slot</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="e.g. 01:15 PM"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    fontSize: 12,
                    color: 'var(--text-main)'
                  }}
                  required
                />
                <select
                  value={newSlotSession}
                  onChange={(e) => setNewSlotSession(e.target.value as any)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    fontSize: 12,
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="LUNCH">Lunch Session</option>
                  <option value="DINNER">Dinner Session</option>
                </select>
                <select
                  value={newSlotOutlet}
                  onChange={(e) => setNewSlotOutlet(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    fontSize: 12,
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="All Outlets">All Outlets</option>
                  <option value="Yanki Sizzlerr Bodakdev">Bodakdev</option>
                  <option value="Yanki Sizzlerr SG Highway">SG Highway</option>
                  <option value="Dough by Yanki CG Road">CG Road</option>
                </select>
                <button
                  type="submit"
                  className="btn btn-gold"
                  disabled={isSavingSlot}
                  style={{ padding: '8px 14px', fontSize: 12, whiteSpace: 'nowrap' }}
                >
                  + Add
                </button>
              </div>
            </form>

            {/* List of Existing Slots */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Configured Slots</h4>
              {slotsList.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No slots configured yet.</p>
              ) : (
                slotsList.map((slot) => (
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
