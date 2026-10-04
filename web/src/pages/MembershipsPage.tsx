import React, { useState, useEffect } from 'react';
import { Users, BadgeCheck, AlertCircle, RefreshCw, Wallet, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import axios from 'axios';
import { Member } from '../types';

export const MembershipsPage: React.FC = () => {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [membershipRev, setMembershipRev] = useState('₹1.10 Lakh');

  useEffect(() => {
    axios.get('/api/members')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setMemberList(res.data.data);
        }
      })
      .catch(() => {});

    axios.get('/api/admin/dashboard')
      .then(res => {
        if (res.data?.success && res.data.data?.kpis) {
          const rev = res.data.data.kpis.find((k: any) => k.label.toLowerCase().includes('membership revenue'));
          if (rev) setMembershipRev(rev.value);
        }
      })
      .catch(() => {});
  }, []);

  const totalSubscribers = memberList.length;
  const activeCount = memberList.filter(m => m.status === 'Active').length;
  const renewalDueCount = memberList.filter(m => m.status === 'Renewal Due').length;
  const expiredCount = memberList.filter(m => m.status === 'Expired').length;

  const dynamicStats = [
    { k: 'Total Subscribers', v: String(totalSubscribers), icon: Users },
    { k: 'Active Members', v: String(activeCount), icon: BadgeCheck, delta: '+8.2%' },
    { k: 'Expired', v: String(expiredCount), icon: AlertCircle },
    { k: 'Renewals Due (30d)', v: String(renewalDueCount), icon: RefreshCw },
    { k: 'Subscription Revenue', v: membershipRev, icon: Wallet, delta: '+12.4%' },
    { k: 'Forecast Run-Rate', v: `₹${(totalSubscribers * 1.2).toFixed(1)} Lakh`, icon: TrendingUp, delta: '+18.0%' },
  ];

  const forecastData = [
    { m: 'Jun', renewed: Math.round(totalSubscribers * 0.4), due: renewalDueCount },
    { m: 'Jul', renewed: Math.round(totalSubscribers * 0.5), due: Math.round(renewalDueCount * 1.2) },
    { m: 'Aug', renewed: Math.round(totalSubscribers * 0.6), due: Math.round(renewalDueCount * 1.1) },
    { m: 'Sep', renewed: Math.round(totalSubscribers * 0.7), due: Math.round(renewalDueCount * 1.3) },
    { m: 'Oct', renewed: Math.round(totalSubscribers * 0.8), due: Math.round(renewalDueCount * 1.2) },
    { m: 'Nov', renewed: Math.round(totalSubscribers * 0.9), due: Math.round(renewalDueCount * 1.4) },
  ];

  return (
    <div>
      {/* 6 Metric Cards */}
      <div className="kpi-grid">
        {dynamicStats.map((s) => {
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
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-card)'
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.08)" />
                <XAxis dataKey="m" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface-alt)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-main)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                />
                <Line type="monotone" dataKey="renewed" stroke="#C9A24D" strokeWidth={3} dot={{ r: 4, fill: '#C9A24D' }} />
                <Line type="monotone" dataKey="due" stroke="#FF8A00" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: '#FF8A00' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tier Distribution */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Tier Breakdown</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Patron distribution across privilege plans</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Elite VIP Connoisseur', price: '₹14,999/yr', count: '0', pct: 0, color: 'var(--gold)' },
                { name: 'Signature Gourmet', price: '₹9,999/yr', count: '0', pct: 0, color: 'var(--primary)' },
                { name: 'Classic Privileges', price: '₹4,999/yr', count: '0', pct: 0, color: '#64748B' },
              ].map((tier) => (
                <div key={tier.name} style={{ padding: '12px 14px', borderRadius: 14, background: 'var(--surface-alt)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{tier.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: tier.color }}>{tier.count}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                    <span>{tier.price}</span>
                    <span>{tier.pct}% share</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' }}>
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
