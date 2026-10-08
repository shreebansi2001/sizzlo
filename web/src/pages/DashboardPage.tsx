import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  MoreHorizontal, 
  Download, 
  Plus, 
  Store, 
  Activity,
  CalendarCheck
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import axios from 'axios';
import { KPI, RevenuePoint, Outlet, Reservation } from '../types';
import { 
  fallbackKPIs, 
  fallbackRevenueSeries, 
  fallbackOutlets, 
  fallbackReservations 
} from '../api/client';

interface DashboardPageProps {
  kpis?: KPI[];
  revenueSeries?: RevenuePoint[];
  outlets?: Outlet[];
  reservations?: Reservation[];
}

const defaultPalette = ["#FF8A00", "#C9A24D", "#3B82F6", "#10B981", "#EC4899", "#8B5CF6"];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis: initialKpis,
  revenueSeries: initialRevenue,
  outlets: initialOutlets,
  reservations: initialReservations,
}) => {
  const [kpis, setKpis] = useState<KPI[]>(initialKpis || fallbackKPIs);
  const [revenueSeries, setRevenueSeries] = useState<RevenuePoint[]>(initialRevenue || fallbackRevenueSeries);
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets || fallbackOutlets);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations || fallbackReservations);
  const [couponMix, setCouponMix] = useState<{ name: string; value: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState<'Daily' | 'Monthly' | 'Annually'>('Monthly');

  useEffect(() => {
    // Feature-wise load: Only fetch dashboard data when this view is rendered
    axios.get('/api/admin/dashboard')
      .then(res => {
        if (res.data?.success && res.data.data) {
          const d = res.data.data;
          if (d.kpis) setKpis(d.kpis);
          if (d.revenueSeries) setRevenueSeries(d.revenueSeries);
          if (d.outletPerformance) setOutlets(d.outletPerformance);
        }
      })
      .catch(() => {});

    axios.get('/api/reservations')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setReservations(res.data.data);
        }
      })
      .catch(() => {});

    axios.get('/api/coupons')
      .then(res => {
        if (res.data?.success && res.data.data?.length) {
          const mapped = res.data.data.map((c: any) => ({
            name: c.name,
            value: Math.max(1, (c.totalCount || 0) - (c.leftCount || 0)),
          }));
          setCouponMix(mapped);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img 
            src="/sizzlo-mascot.png" 
            alt="Sizzlo" 
            className="animate-float"
            style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(255, 138, 0, 0.4))' }} 
          />
          <div>
            <h1 className="page-title">Executive Operations Hub</h1>
            <p className="page-subtitle">Live real-time telemetry across all Yanki hospitality outlets & user activities.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline">
            <Download size={15} /> Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={15} /> Quick Action
          </button>
        </div>
      </div>

      {/* 6 KPIs Grid */}
      <div className="kpi-grid">
        {kpis.map((k, idx) => {
          const isUp = k.trend === 'up';
          return (
            <div key={idx} className="kpi-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span className="kpi-label">{k.label}</span>
                <MoreHorizontal size={16} color="var(--text-dim)" />
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-trend ${isUp ? 'up' : 'down'}`}>
                {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{k.delta}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mid Charts: Revenue Analytics (AreaChart) + Coupon Mix (PieChart) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Revenue Analytics */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 className="card-title">Revenue Analytics</h2>
              <p className="card-subtitle">Monthly gross revenue vs membership subscription revenue (₹ Lakhs)</p>
            </div>
            <div style={{ display: 'flex', background: 'var(--surface-alt)', borderRadius: 12, padding: 3, border: '1px solid var(--border)' }}>
              {(['Daily', 'Monthly', 'Annually'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 9,
                    fontSize: 11,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: chartPeriod === p ? 'var(--primary)' : 'transparent',
                    color: chartPeriod === p ? '#070A09' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF8A00" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A24D" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A24D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="m" stroke="var(--text-dim)" fontSize={12} />
                <YAxis stroke="var(--text-dim)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2220', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12 
                  }} 
                />
                <Area type="monotone" dataKey="revenue" name="Total Revenue (₹L)" stroke="#FF8A00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="membership" name="Subscription Revenue (₹L)" stroke="#C9A24D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMem)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coupon Mix */}
        <div className="card">
          <h2 className="card-title">Coupon Mix</h2>
          <p className="card-subtitle">Redemptions across voucher categories</p>
          <div style={{ height: 180, marginTop: 10 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={couponMix} 
                  dataKey="value" 
                  nameKey="name" 
                  innerRadius={48} 
                  outerRadius={75} 
                  paddingAngle={3}
                >
                  {couponMix.map((_, i) => (
                    <Cell key={i} fill={defaultPalette[i % defaultPalette.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: '#1F2220', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    borderRadius: 12,
                    color: '#fff',
                    fontSize: 12 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {couponMix.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: defaultPalette[i % defaultPalette.length] }} />
                  {c.name}
                </span>
                <strong style={{ color: 'var(--text-main)' }}>{c.value.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Venue Performance Directory & Today's Bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* Venue Directory */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 className="card-title">Outlet Performance</h2>
              <p className="card-subtitle">Top revenue and active VIP users by dining outlet</p>
            </div>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Outlet Venue</th>
                  <th>Revenue</th>
                  <th>Users</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {outlets.map(o => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.name}</strong>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.address}</p>
                    </td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>₹{o.revenueLakhs} Lakh</td>
                    <td>{o.activeMembers} VIPs</td>
                    <td>
                      <span className="badge badge-gold">★ {o.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Host Station Bookings */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div>
              <h2 className="card-title">Live Host Station</h2>
              <p className="card-subtitle">Tonight's seated and upcoming reservations</p>
            </div>
            <span className="badge badge-orange">{reservations.length} Booked</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reservations.slice(0, 4).map(r => (
              <div 
                key={r.id} 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{r.customerName}</strong>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {r.outlet} · {r.reservationTime} · {r.guests} Guests
                  </p>
                </div>
                {r.vip ? (
                  <span className="badge badge-gold">VIP DINER</span>
                ) : (
                  <span className="badge badge-success">{r.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
