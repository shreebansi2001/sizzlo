import React from 'react';
import { Users, BadgeCheck, AlertCircle, RefreshCw, Wallet, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const forecastData = [
  { m: 'Jun', renewed: 312, due: 150 },
  { m: 'Jul', renewed: 280, due: 180 },
  { m: 'Aug', renewed: 340, due: 210 },
  { m: 'Sep', renewed: 360, due: 240 },
  { m: 'Oct', renewed: 410, due: 280 },
  { m: 'Nov', renewed: 460, due: 320 },
];

const stats = [
  { k: 'Total Subscribers', v: '5,128', icon: Users },
  { k: 'Active Members', v: '4,582', icon: BadgeCheck, delta: '+8.2%' },
  { k: 'Expired', v: '412', icon: AlertCircle },
  { k: 'Renewals Due (30d)', v: '150', icon: RefreshCw },
  { k: 'Subscription Revenue', v: '₹42 Lakh', icon: Wallet, delta: '+12.4%' },
  { k: 'Forecast (90d)', v: '₹68 Lakh', icon: TrendingUp, delta: '+18.0%' },
];

export const MembershipsPage: React.FC = () => {
  return (
    <div>
      {/* 6 Metric Cards */}
      <div className="kpi-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.k} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{s.k}</span>
                <Icon size={16} color="var(--gold)" />
              </div>
              <div className="kpi-value">{s.v}</div>
              {s.delta && (
                <span className="kpi-delta delta-up" style={{ marginTop: 4, display: 'inline-block' }}>
                  {s.delta} growth
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid: Forecast Chart & Plan Tiers */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginTop: 24 }}>
        {/* Forecast Chart */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Renewal Forecast (6 Months)</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Projected renewals vs dues based on patron telemetry</p>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />
                Renewed
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />
                Due
              </span>
            </div>
          </div>

          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="m" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
                />
                <Line type="monotone" dataKey="renewed" stroke="#E8B84A" strokeWidth={3} dot={{ r: 4, fill: '#E8B84A' }} />
                <Line type="monotone" dataKey="due" stroke="#001D4A" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#001D4A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Tier Breakdown</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Patron distribution across privilege plans</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Elite VIP Connoisseur', price: '₹14,999/yr', count: '1,842', pct: 40, color: 'var(--gold)' },
                { name: 'Signature Gourmet', price: '₹9,999/yr', count: '1,920', pct: 42, color: 'var(--primary)' },
                { name: 'Classic Privileges', price: '₹4,999/yr', count: '820', pct: 18, color: '#64748B' },
              ].map((tier) => (
                <div key={tier.name} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{tier.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.count}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>{tier.price}</span>
                    <span>{tier.pct}% share</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{ width: `${tier.pct}%`, height: '100%', background: tier.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="primary-btn" style={{ width: '100%', marginTop: 16 }}>
            Export Membership Analytics
          </button>
        </div>
      </div>
    </div>
  );
};
