import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, RefreshCw, Award, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import { Member } from '../types';
import { DEFAULT_USERS_DATASET } from '../data/defaultUsers';

export const LoyaltyPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>(DEFAULT_USERS_DATASET);

  useEffect(() => {
    axios.get('/api/members')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setMembers(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const totalPoints = members.reduce((sum, m) => sum + (m.loyaltyPoints || 0), 0);
  const avgPoints = members.length > 0 ? Math.round(totalPoints / members.length) : 0;
  const renewalsEarned = members.filter(m => (m.loyaltyPoints || 0) >= (m.loyaltyGoal || 250000)).length;

  const topLoyaltyMembers = [...members]
    .sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0))
    .slice(0, 10)
    .map((m, i) => {
      const pts = m.loyaltyPoints || 0;
      const goal = m.loyaltyGoal || 250000;
      const progressPercent = Math.min(100, Math.round((pts / goal) * 100));
      return {
        rank: i + 1,
        name: m.fullName,
        id: m.membershipId,
        pts,
        goal,
        progressPercent,
        points: pts.toLocaleString('en-IN'),
        tier: m.membershipType,
        renewals: pts >= goal ? 1 : 0,
      };
    });

  const distributionData = [
    { name: '0 – 25k', value: members.filter(m => (m.loyaltyPoints || 0) < 25000).length, color: '#3B82F6' },
    { name: '25k – 75k', value: members.filter(m => (m.loyaltyPoints || 0) >= 25000 && (m.loyaltyPoints || 0) < 75000).length, color: '#E8B84A' },
    { name: '75k – 150k', value: members.filter(m => (m.loyaltyPoints || 0) >= 75000 && (m.loyaltyPoints || 0) < 150000).length, color: '#10B981' },
    { name: '150k – 250k', value: members.filter(m => (m.loyaltyPoints || 0) >= 150000 && (m.loyaltyPoints || 0) < 250000).length, color: '#001D4A' },
    { name: '250k+ (Goal Met)', value: renewalsEarned, color: '#8B5CF6' },
  ];

  const dynamicKpis = [
    { label: 'TOTAL POINTS ISSUED', val: totalPoints.toLocaleString('en-IN'), sub: `Across ${members.length} VIP accounts`, icon: Sparkles },
    { label: 'AVG POINTS / MEMBER', val: avgPoints.toLocaleString('en-IN'), sub: 'Healthy engagement index', icon: Award },
    { label: 'FREE RENEWALS EARNED', val: `${renewalsEarned} Members`, sub: 'Achieved 250,000 pts goal', icon: RefreshCw },
    { label: 'TOP BALANCE', val: topLoyaltyMembers[0]?.points || '0', sub: topLoyaltyMembers[0]?.name || 'Leader', icon: Gift },
  ];

  return (
    <div>
      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {dynamicKpis.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{s.label}</span>
                <Icon size={16} color="var(--gold)" />
              </div>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24 }}>{s.val}</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {s.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid: Distribution Chart & Top Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: 24 }}>
        {/* Pie Chart Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Points Balance Distribution</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Categorization by user point accumulation</p>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} members`, 'Count']}
                  contentStyle={{ background: 'var(--surface-alt)', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {distributionData.map((d) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                  {d.name}
                </span>
                <span style={{ fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Members Leaderboard */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Top Loyalty Users</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Highest point holders eligible for exclusive privileges</p>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--gold-dark)',
              background: 'rgba(232, 184, 74, 0.15)',
              padding: '4px 10px',
              borderRadius: 20
            }}>
              Goal: 250,000 Pts
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Member Name</th>
                  <th>Points Balance</th>
                  <th>Privilege Tier</th>
                  <th>Renewals Earned</th>
                </tr>
              </thead>
              <tbody>
                {topLoyaltyMembers.map((m) => (
                  <tr key={m.rank}>
                    <td style={{ fontWeight: 800, color: m.rank === 1 ? 'var(--gold)' : 'var(--text-muted)' }}>
                      #{m.rank}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.id}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>
                        {m.points}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: m.tier === 'Connoisseur' ? 'rgba(232, 184, 74, 0.2)' : 'rgba(0, 29, 74, 0.08)',
                        color: m.tier === 'Connoisseur' ? 'var(--gold-dark)' : 'var(--primary)'
                      }}>
                        {m.tier}
                      </span>
                    </td>
                    <td>
                      {m.pts >= m.goal ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>
                          Achieved (1 Year Free)
                        </span>
                      ) : m.pts > 0 ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                          In Progress ({m.progressPercent}%)
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)' }}>
                          0% (250,000 pts needed)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
