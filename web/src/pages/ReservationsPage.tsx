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
import { Reservation } from '../types';

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

const kpiStats = [
  { k: 'Total Reservations', v: '0', icon: Calendar, delta: '0%' },
  { k: 'VIP Bookings', v: '0', icon: Crown, delta: '0% VIP share' },
  { k: 'Peak Hour', v: '--', icon: Clock, delta: 'No data' },
  { k: 'Popular Outlet', v: '--', icon: MapPin, delta: 'No data' },
  { k: 'Avg Guests', v: '0', icon: Users, delta: 'No data' },
  { k: 'Cancellation Rate', v: '0%', icon: TrendingUp, delta: 'No data' }
];

interface UpcomingItem {
  dbId: string | number;
  id: string;
  customer: string;
  outlet: string;
  date: string;
  guests: number;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
  vip: boolean;
  notes?: string;
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ reservations: initialReservations, onRefresh }) => {
  const mapReservations = (list: Reservation[]): UpcomingItem[] => {
    return list.map(r => ({
      dbId: r.id,
      id: r.bookingReference || `R-${r.id}`,
      customer: r.customerName,
      outlet: r.outlet,
      date: r.reservationTime,
      guests: r.guests,
      status: (r.status as any) || 'Confirmed',
      vip: r.vip,
      notes: r.specialRequests,
    }));
  };

  const [upcomingList, setUpcomingList] = useState<UpcomingItem[]>(() => mapReservations(initialReservations));
  const [selectedOutlet, setSelectedOutlet] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
  }, []);

  useEffect(() => {
    if (initialReservations && initialReservations.length > 0) {
      setUpcomingList(mapReservations(initialReservations));
    }
  }, [initialReservations]);

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

  const dynamicKpiStats = [
    { k: 'Total Reservations', v: `${upcomingList.length}`, icon: Calendar, delta: 'Live in-system bookings' },
    { k: 'VIP Bookings', v: `${upcomingList.filter(u => u.vip).length}`, icon: Crown, delta: `${upcomingList.length ? Math.round((upcomingList.filter(u => u.vip).length / upcomingList.length) * 100) : 0}% VIP share` },
    { k: 'Peak Hour', v: '8 PM', icon: Clock, delta: 'Dinner peak rush' },
    { k: 'Popular Outlet', v: 'Yanki Sizzlerr', icon: MapPin, delta: 'Top destination' },
    { k: 'Avg Party Size', v: `${(upcomingList.reduce((sum, r) => sum + (r.guests || 2), 0) / (upcomingList.length || 1)).toFixed(1)}`, icon: Users, delta: 'Guests per table' },
    { k: 'Confirmed', v: `${upcomingList.filter(u => u.status === 'Confirmed').length}`, icon: TrendingUp, delta: 'Ready for seating' }
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
                <th style={{ padding: '12px 14px' }}>Customer</th>
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
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px', fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>
                    {item.id}
                  </td>
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{item.customer}</span>
                      {item.vip && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2,
                          background: 'rgba(201, 162, 77, 0.15)',
                          color: 'var(--gold-dark)',
                          borderRadius: 9999,
                          padding: '1px 6px',
                          fontSize: 10,
                          fontWeight: 700
                        }}>
                          <Crown size={10} color="var(--gold)" /> VIP
                        </span>
                      )}
                    </div>
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
    </div>
  );
};
