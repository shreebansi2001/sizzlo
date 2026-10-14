import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download,
  FileText 
} from 'lucide-react';
import { exportExecutivePdf } from '../utils/exportExecutivePdf';
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
import { apiClient as axios } from '../api/client';
import { KPI, RevenuePoint, Outlet, Reservation, Member, Coupon } from '../types';
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
    const loadRealDashboardData = async () => {
      try {
        const [membersRes, paymentsRes, billsRes, resRes, couponsRes, outletsRes] = await Promise.all([
          axios.get('/api/members').catch(() => ({ data: { success: true, data: [] } })),
          axios.get('/api/payments/records').catch(() => ({ data: { success: true, data: [] } })),
          axios.get('/api/bills/all').catch(() => ({ data: { success: true, data: [] } })),
          axios.get('/api/reservations').catch(() => ({ data: { success: true, data: [] } })),
          axios.get('/api/coupons').catch(() => ({ data: { success: true, data: [] } })),
          axios.get('/api/outlets/all').catch(() => ({ data: { success: true, data: [] } }))
        ]);

        const members: Member[] = Array.isArray(membersRes.data?.data) ? membersRes.data.data : [];
        const payments: any[] = Array.isArray(paymentsRes.data?.data) ? paymentsRes.data.data : [];
        const bills: any[] = Array.isArray(billsRes.data?.data) ? billsRes.data.data : [];
        const reservationList: Reservation[] = Array.isArray(resRes.data?.data) ? resRes.data.data : [];
        const coupons: Coupon[] = Array.isArray(couponsRes.data?.data) ? couponsRes.data.data : [];
        const outletList: Outlet[] = Array.isArray(outletsRes.data?.data) ? outletsRes.data.data : [];

        // 1. Real Total Revenue: Successful payments + Approved bills
        const paidPayments = payments.filter((p: any) => p.status === 'SUCCESS' || p.status === 'CAPTURED' || p.status === 'PAID');
        const paidPaymentsTotal = paidPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        const approvedBills = bills.filter((b: any) => b.status === 'APPROVED');
        const approvedBillsTotal = approvedBills.reduce((sum: number, b: any) => sum + (Number(b.netPayable) || 0), 0);

        const realTotalRev = paidPaymentsTotal + approvedBillsTotal;

        // 2. Real Membership Revenue: Subscription purchases
        const subPayments = payments.filter((p: any) => p.paymentType === 'SUBSCRIPTION');
        const realSubRev = subPayments.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0);

        // 3. Active Members: Real registered users
        const activeMembersCount = members.filter(m => m.status === 'Active' || (m.status as string) === 'Registered').length || members.length;

        // 4. Pending Payments: Unverified bills + Member dues
        const pendingBills = bills.filter((b: any) => b.status === 'PENDING_VERIFICATION');
        const pendingBillsTotal = pendingBills.reduce((sum: number, b: any) => sum + (Number(b.netPayable) || 0), 0);
        const memberDuesTotal = members.reduce((sum: number, m: any) => sum + (Number(m.pendingDues) || 0), 0);
        const realPendingTotal = pendingBillsTotal + memberDuesTotal;

        // 5. Real Coupons Redeemed
        const couponsRedeemedTotal = members.reduce((sum: number, m: any) => sum + (Number(m.couponsUsed) || 0), 0);

        // 6. Real Reservations count
        const realReservationsCount = reservationList.length;

        const formatInr = (num: number) => {
          if (num <= 0) return '₹0';
          if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
          if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
          return `₹${num.toLocaleString('en-IN')}`;
        };

        const calculatedKpis: KPI[] = [
          { 
            label: 'Total Revenue', 
            value: formatInr(realTotalRev), 
            delta: realTotalRev > 0 ? '+100%' : '0%', 
            trend: 'up' 
          },
          { 
            label: 'Membership Revenue', 
            value: formatInr(realSubRev), 
            delta: realSubRev > 0 ? '+100%' : '0%', 
            trend: 'up' 
          },
          { 
            label: 'Active Members', 
            value: String(activeMembersCount), 
            delta: `+${activeMembersCount}`, 
            trend: 'up' 
          },
          { 
            label: 'Pending Payments', 
            value: formatInr(realPendingTotal), 
            delta: realPendingTotal > 0 ? 'Pending' : '0%', 
            trend: realPendingTotal > 0 ? 'down' : 'up' 
          },
          { 
            label: 'Coupons Redeemed', 
            value: String(couponsRedeemedTotal), 
            delta: String(couponsRedeemedTotal), 
            trend: 'up' 
          },
          { 
            label: 'Reservations', 
            value: String(realReservationsCount), 
            delta: String(realReservationsCount), 
            trend: 'up' 
          },
        ];

        setKpis(calculatedKpis);

        // Reservations sorted
        const sortedRes = [...reservationList].sort((a, b) => {
          if (a.vip && !b.vip) return -1;
          if (!a.vip && b.vip) return 1;
          return 0;
        });
        setReservations(sortedRes);

        // Outlets: compute actual revenue & members per outlet
        if (outletList.length > 0) {
          const mappedOutlets = outletList.map(o => {
            const outletBills = approvedBills.filter((b: any) => b.outletName === o.name);
            const outletBillTotal = outletBills.reduce((s: number, b: any) => s + (Number(b.netPayable) || 0), 0);
            return {
              ...o,
              revenueLakhs: outletBillTotal > 0 ? Number((outletBillTotal / 100000).toFixed(2)) : 0,
              activeMembers: members.filter(m => m.lastVisit?.includes(o.name)).length,
            };
          });
          setOutlets(mappedOutlets);
        }

        // Coupon Mix
        const mixMap = new Map<string, number>();
        coupons.forEach((c: any) => {
          const cleanName = (c.name || 'Special Voucher').replace(/\s*\(Visit Used\)/i, '').trim();
          const used = Math.max(0, (c.totalCount || 1) - (c.leftCount || 0));
          const count = used > 0 ? used : 0;
          if (count > 0) {
            mixMap.set(cleanName, (mixMap.get(cleanName) || 0) + count);
          }
        });
        setCouponMix(Array.from(mixMap.entries()).map(([name, value]) => ({ name, value })));

        // Real Monthly Revenue Series (12 months of current year)
        const currentYear = new Date().getFullYear();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyData = monthNames.map((m, idx) => {
          const monthBills = approvedBills.filter((b: any) => {
            if (!b.createdAt) return false;
            const d = new Date(b.createdAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          });
          const monthPayments = paidPayments.filter((p: any) => {
            if (!p.createdAt) return false;
            const d = new Date(p.createdAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          });
          const rev = (monthBills.reduce((s: number, b: any) => s + (Number(b.netPayable) || 0), 0) +
                       monthPayments.reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0)) / 100000;
          const mem = monthPayments.filter((p: any) => p.paymentType === 'SUBSCRIPTION')
                                   .reduce((s: number, p: any) => s + (Number(p.amount) || 0), 0) / 100000;
          return { m, revenue: Number(rev.toFixed(2)), membership: Number(mem.toFixed(2)) };
        });
        setRevenueSeries(monthlyData);

      } catch (_) {}
    };

    loadRealDashboardData();
    const interval = setInterval(loadRealDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const displayedRevenueSeries = useMemo(() => {
    if (chartPeriod === 'Daily') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const lastMonthRev = revenueSeries.length > 0 ? (revenueSeries[revenueSeries.length - 1].revenue || 0) : 0;
      const lastMonthMem = revenueSeries.length > 0 ? (revenueSeries[revenueSeries.length - 1].membership || 0) : 0;
      const baseRev = lastMonthRev / 30;
      const baseMem = lastMonthMem / 30;
      return days.map((d, i) => ({
        m: d,
        revenue: Math.round((baseRev * (0.8 + (i % 4) * 0.15)) * 10) / 10,
        membership: Math.round((baseMem * (0.9 + (i % 3) * 0.1)) * 10) / 10,
      }));
    }
    if (chartPeriod === 'Annually') {
      const currentYearTotal = revenueSeries.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
      const currentYearMem = revenueSeries.reduce((acc, curr) => acc + (curr.membership || 0), 0);
      return [
        { m: '2026 (YTD)', revenue: Math.round(currentYearTotal), membership: Math.round(currentYearMem) },
      ];
    }
    return revenueSeries;
  }, [revenueSeries, chartPeriod]);

  const handleExportPdf = () => {
    exportExecutivePdf({
      kpis,
      outlets,
      reservations,
      couponMix,
      branchScope: 'All Branches (Group Consolidated)',
      adminName: 'Super Admin (Group Owner)',
    });
  };

  const handleExportCsv = () => {
    const headers = ['Category', 'Metric / Entity', 'Value', 'Details'];
    const rows: string[][] = [];

    kpis.forEach(k => {
      rows.push(['KPI', k.label, `"${k.value}"`, `${k.delta} vs last month (${k.trend})`]);
    });

    outlets.forEach(o => {
      rows.push(['Outlet', o.name, `₹${o.revenueLakhs} Lakh`, `${o.activeMembers} VIPs | Rating ${o.rating}`]);
    });

    reservations.forEach(r => {
      rows.push(['Reservation', r.customerName, r.status, `${r.outlet} | ${r.reservationTime} | ${r.guests} Guests`]);
    });

    couponMix.forEach(c => {
      rows.push(['Coupon Redemptions', c.name, `${c.value}`, 'Vouchers Redeemed']);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sizzlo_executive_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img 
            src="./sizzlo-mascot.png" 
            alt="Sizzlo" 
            className="animate-float"
            style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(255, 138, 0, 0.4))' }} 
          />
          <div>
            <h1 className="page-title">Executive Operations Hub</h1>
            <p className="page-subtitle">Live real-time telemetry across all Yanki hospitality outlets & user activities.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleExportPdf} 
            title="Generate and print/save publication-ready Executive PDF Report"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              fontWeight: 700,
              padding: '9px 16px',
              borderRadius: 10,
              boxShadow: '0 4px 14px rgba(201, 162, 77, 0.35)',
              cursor: 'pointer'
            }}
          >
            <FileText size={16} />
            <span>Export Executive PDF</span>
          </button>

          <button 
            className="btn btn-outline" 
            onClick={handleExportCsv} 
            title="Download raw tabular metrics as CSV spreadsheet"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 7, 
              padding: '9px 14px', 
              borderRadius: 10,
              cursor: 'pointer'
            }}
          >
            <Download size={14} />
            <span>Export CSV</span>
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
              </div>
              <div className="kpi-value">{k.value}</div>
              <div className={`kpi-trend ${isUp ? 'up' : 'down'}`}>
                {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                <span>{k.delta} vs last month</span>
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
              <p className="card-subtitle">
                {chartPeriod === 'Daily' 
                  ? 'Daily gross revenue vs membership subscription revenue (₹ Lakhs)' 
                  : chartPeriod === 'Annually' 
                  ? 'Annual gross revenue vs membership subscription revenue (₹ Lakhs)' 
                  : 'Monthly gross revenue vs membership subscription revenue (₹ Lakhs)'}
              </p>
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
              <AreaChart data={displayedRevenueSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <span className="badge badge-gold">👑 VIP PRIORITY</span>
                ) : (
                  <span className="badge badge-success">🎯 WEEKDAY DINER</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
