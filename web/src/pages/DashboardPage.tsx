import React from 'react';
import { TrendingUp, TrendingDown, Users, CreditCard, Ticket, Calendar, ArrowUpRight } from 'lucide-react';
import { KPI, RevenuePoint, Outlet, Reservation } from '../types';

interface DashboardPageProps {
  kpis: KPI[];
  revenueSeries: RevenuePoint[];
  outlets: Outlet[];
  reservations: Reservation[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  revenueSeries,
  outlets,
  reservations,
}) => {
  return (
    <div>
      {/* 6-Grid KPIs */}
      <div className="kpi-grid">
        {kpis.map((kpi, idx) => {
          const isUp = kpi.trend === 'up';
          return (
            <div key={idx} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{kpi.label}</span>
                <span className={`kpi-delta ${isUp ? 'delta-up' : 'delta-down'}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.delta}
                </span>
              </div>
              <div className="kpi-value">{kpi.value}</div>
            </div>
          );
        })}
      </div>

      {/* Mid Section: Revenue Performance & Top Venues */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Revenue Trends Chart Card */}
        <div style={{
          background: 'white',
          borderRadius: 18,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Revenue & Membership Trends</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly gross billing vs membership subscription volume</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                Total Revenue (₹ Lakh)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--gold)' }} />
                Membership Fees
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div style={{ height: 220, display: 'flex', alignItems: 'flex-end', gap: 14, paddingTop: 20 }}>
            {revenueSeries.map((item, i) => {
              const maxRev = 35;
              const revHeight = (item.revenue / maxRev) * 160;
              const memHeight = (item.membership / maxRev) * 160;

              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, height: 160 }}>
                    <div 
                      title={`Gross: ₹${item.revenue}L`}
                      style={{
                        width: '45%',
                        height: `${revHeight}px`,
                        background: 'linear-gradient(180deg, #0A3175 0%, #001D4A 100%)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }} 
                    />
                    <div 
                      title={`Membership: ₹${item.membership}L`}
                      style={{
                        width: '45%',
                        height: `${memHeight}px`,
                        background: 'linear-gradient(180deg, #F3C762 0%, #E8B84A 100%)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{item.m}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Venue Breakdown */}
        <div style={{
          background: 'white',
          borderRadius: 18,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Top Performing Venues</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>Ranked by monthly gross volume</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {outlets.slice(0, 4).map((outlet) => (
              <div key={outlet.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: 12 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>{outlet.name}</h4>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{outlet.activeMembers} patrons · ABV ₹{outlet.averageBillValue}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>₹{outlet.revenueLakhs}L</p>
                  <span className="badge badge-gold" style={{ fontSize: 9 }}>★ {outlet.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="data-table-card">
        <div className="table-header-bar">
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Live Reservations & Dining Pipeline</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time bookings from Sizzlo mobile members</p>
          </div>
        </div>
        <table className="sizzlo-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Customer</th>
              <th>Outlet</th>
              <th>Time Slot</th>
              <th>Party</th>
              <th>Status</th>
              <th>Special Notes</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.bookingReference}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{r.customerName}</span>
                    {r.vip && <span className="badge badge-gold">VIP</span>}
                  </div>
                </td>
                <td>{r.outlet}</td>
                <td>{r.reservationTime}</td>
                <td style={{ fontWeight: 600 }}>{r.guests} Guests</td>
                <td>
                  <span className={`badge ${r.status === 'Confirmed' ? 'badge-success' : 'badge-gold'}`}>
                    {r.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.specialRequests || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
