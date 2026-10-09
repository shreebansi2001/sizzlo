import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Gift, RefreshCw, Award, CheckCircle2, Search, Crown, 
  Settings2, X, Sliders, Check, Info 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import axios from 'axios';
import { Member } from '../types';

const STORAGE_KEY_MILESTONE = 'yanki_loyalty_milestone_target';

export const LoyaltyPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [milestoneFilter, setMilestoneFilter] = useState<'ALL' | 'ACHIEVED' | 'IN_PROGRESS'>('ALL');
  
  // Admin-configurable Milestone Goal (default 25,000 pts)
  const [milestoneTarget, setMilestoneTarget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MILESTONE);
      if (saved && !isNaN(Number(saved)) && Number(saved) > 0) {
        return Number(saved);
      }
    } catch (_) {}
    return 25000;
  });

  // Modal State for Configuring Milestone
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editMilestoneValue, setEditMilestoneValue] = useState<number>(milestoneTarget);
  const [isSavingMilestone, setIsSavingMilestone] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const fetchMembers = () => {
    axios.get('/api/members')
      .then(res => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMembers(res.data.data);
          // If the first member has a loyaltyGoal configured in DB, honor it
          if (res.data.data[0]?.loyaltyGoal && Number(res.data.data[0].loyaltyGoal) > 0) {
            const dbGoal = Number(res.data.data[0].loyaltyGoal);
            setMilestoneTarget(prev => {
              if (!localStorage.getItem(STORAGE_KEY_MILESTONE)) {
                return dbGoal;
              }
              return prev;
            });
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal = Number(editMilestoneValue);
    if (isNaN(newGoal) || newGoal <= 0) return;

    setIsSavingMilestone(true);
    try {
      // 1. Sync to backend so all member records and Mobile App inherit the new target
      await axios.put('/api/members/loyalty-goal', { goal: newGoal }, { timeout: 3000 });
    } catch (_) {
      // Backend may be offline; still persist locally
    }

    try {
      localStorage.setItem(STORAGE_KEY_MILESTONE, String(newGoal));
    } catch (_) {}

    setMilestoneTarget(newGoal);
    setShowMilestoneModal(false);
    setIsSavingMilestone(false);

    setActionNotice(`🎯 Loyalty Milestone Target updated to ${newGoal.toLocaleString('en-IN')} Points! All patron progress percentages and qualification thresholds recalculated.`);
    setTimeout(() => setActionNotice(null), 5000);
    fetchMembers();
  };

  const totalPoints = members.reduce((sum, m) => sum + (m.loyaltyPoints || 0), 0);
  const avgPoints = members.length > 0 ? Math.round(totalPoints / members.length) : 0;
  const renewalsEarned = members.filter(m => (m.loyaltyPoints || 0) >= milestoneTarget).length;

  // Process and sort top loyalty patrons user-wise
  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (b.loyaltyPoints || 0) - (a.loyaltyPoints || 0));
  }, [members]);

  const filteredMembers = useMemo(() => {
    return sortedMembers.filter(m => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch = !term ||
        (m.fullName || '').toLowerCase().includes(term) ||
        (m.membershipId || '').toLowerCase().includes(term) ||
        (m.mobile || '').includes(term);

      const pts = m.loyaltyPoints || 0;
      const isAchieved = pts >= milestoneTarget;

      if (milestoneFilter === 'ACHIEVED') return matchesSearch && isAchieved;
      if (milestoneFilter === 'IN_PROGRESS') return matchesSearch && !isAchieved;
      return matchesSearch;
    });
  }, [sortedMembers, searchTerm, milestoneFilter, milestoneTarget]);

  // Dynamic distribution buckets based on the configured milestone
  const b1 = Math.round(milestoneTarget * 0.2);
  const b2 = Math.round(milestoneTarget * 0.6);
  const b3 = milestoneTarget;

  const distributionData = [
    { 
      name: `0 – ${(b1 / 1000).toFixed(0)}k pts (Starter)`, 
      value: members.filter(m => (m.loyaltyPoints || 0) < b1).length, 
      color: '#3B82F6' 
    },
    { 
      name: `${(b1 / 1000).toFixed(0)}k – ${(b2 / 1000).toFixed(0)}k pts (Silver)`, 
      value: members.filter(m => (m.loyaltyPoints || 0) >= b1 && (m.loyaltyPoints || 0) < b2).length, 
      color: '#10B981' 
    },
    { 
      name: `${(b2 / 1000).toFixed(0)}k – ${(b3 / 1000).toFixed(0)}k pts (Near Goal)`, 
      value: members.filter(m => (m.loyaltyPoints || 0) >= b2 && (m.loyaltyPoints || 0) < b3).length, 
      color: '#FF8A00' 
    },
    { 
      name: `${(b3 / 1000).toFixed(0)}k+ pts (Free 1-Yr Renewal)`, 
      value: renewalsEarned, 
      color: '#C9A24D' 
    },
  ];

  const dynamicKpis = [
    { 
      label: 'TOTAL REWARD POINTS ACCRUED', 
      val: totalPoints.toLocaleString('en-IN'), 
      sub: `Across all ${members.length} registered patron accounts`, 
      icon: Sparkles 
    },
    { 
      label: 'AVERAGE BALANCE / PATRON', 
      val: avgPoints.toLocaleString('en-IN'), 
      sub: 'Cumulative guest engagement index', 
      icon: Award 
    },
    { 
      label: 'FREE 1-YEAR RENEWALS UNLOCKED', 
      val: `${renewalsEarned} Patrons`, 
      sub: `Achieved ${milestoneTarget.toLocaleString('en-IN')} pts target`, 
      icon: RefreshCw 
    },
    { 
      label: 'TOP POINTS ACCRUAL LEADER', 
      val: (sortedMembers[0]?.loyaltyPoints || 0).toLocaleString('en-IN') + ' pts', 
      sub: sortedMembers[0]?.fullName || 'Top Patron', 
      icon: Gift 
    },
  ];

  // Quick preset milestones
  const presets = [15000, 20000, 25000, 30000, 50000];

  return (
    <div>
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          {actionNotice}
        </div>
      )}

      {/* Program Context & Milestone Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1C1510 0%, #16100B 50%, #0E0A07 100%)',
        borderRadius: 20,
        padding: '24px 28px',
        border: '1.5px solid rgba(201, 162, 77, 0.35)',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: 'rgba(201, 162, 77, 0.15)',
            border: '1px solid var(--gold)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <Crown size={24} color="var(--gold)" />
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>
              Patron Loyalty Program &amp; Free Renewal Ledger
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4, maxWidth: 640 }}>
              Patrons earn loyalty points on every dining visit. Reaching the Admin-configured milestone of{' '}
              <strong style={{ color: 'var(--gold)', fontWeight: 800 }}>{milestoneTarget.toLocaleString('en-IN')} Points</strong>{' '}
              automatically grants a complimentary 100% Free 1-Year VIP Subscription Renewal.
            </p>
          </div>
        </div>

        {/* Admin Milestone Config Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(255, 138, 0, 0.12)',
            border: '1px solid rgba(255, 138, 0, 0.35)',
            padding: '8px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            color: '#FF8A00',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <CheckCircle2 size={14} />
            Target: {milestoneTarget.toLocaleString('en-IN')} Pts = Free 1-Yr Renewal
          </div>

          <button
            onClick={() => {
              setEditMilestoneValue(milestoneTarget);
              setShowMilestoneModal(true);
            }}
            className="btn btn-primary"
            style={{
              fontSize: 12,
              padding: '8px 16px',
              borderRadius: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700
            }}
          >
            <Settings2 size={14} />
            Set Milestone Goal
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
        {dynamicKpis.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{s.label}</span>
                <Icon size={16} color="var(--gold)" />
              </div>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--primary)' }}>{s.val}</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {s.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Grid: Distribution Chart & User-wise Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2.1fr', gap: 24 }}>
        {/* Pie Chart Card */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--shadow-card)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Points Balance Distribution</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Patron counts categorized by progress toward {milestoneTarget.toLocaleString('en-IN')} pts goal
          </p>

          <div style={{ height: 210 }}>
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
                  formatter={(value: any) => [`${value} patrons`, 'Count']}
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
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User-Wise Patron Loyalty Ledger */}
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Header & Controls */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Patron-Wise Loyalty Ledger</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Completion percentage = (Current Points ÷ {milestoneTarget.toLocaleString('en-IN')} Target) × 100
                </p>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
                {[
                  { id: 'ALL', label: `All Patrons (${members.length})` },
                  { id: 'ACHIEVED', label: `🎉 Goal Achieved (${renewalsEarned})` },
                  { id: 'IN_PROGRESS', label: `In Progress (${members.length - renewalsEarned})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setMilestoneFilter(f.id as any)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 7,
                      fontSize: 11,
                      fontWeight: milestoneFilter === f.id ? 700 : 500,
                      background: milestoneFilter === f.id ? 'var(--primary)' : 'transparent',
                      color: milestoneFilter === f.id ? '#070A09' : 'var(--text-muted)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="search-input" style={{ width: '100%', maxWidth: 360 }}>
              <Search size={15} color="#94A3B8" />
              <input
                type="text"
                placeholder="Search patron by name, mobile, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto', maxHeight: 420 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Patron Name &amp; ID</th>
                  <th>Privilege Tier</th>
                  <th>Points Balance</th>
                  <th style={{ width: 230 }}>
                    Progress to {milestoneTarget >= 1000 ? `${(milestoneTarget / 1000).toFixed(0)}k` : milestoneTarget} Pts Goal
                  </th>
                  <th>Renewal Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                      No patrons matching the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((m, idx) => {
                    const pts = m.loyaltyPoints || 0;
                    const progressPercent = Math.min(100, Math.round((pts / milestoneTarget) * 100));
                    const isAchieved = pts >= milestoneTarget;
                    const remainingPts = Math.max(0, milestoneTarget - pts);

                    return (
                      <tr key={m.id || idx}>
                        <td style={{ fontWeight: 800, color: idx === 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                          #{idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.fullName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {m.membershipId} · {m.mobile}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: m.membershipType?.includes('ELITE') 
                              ? 'rgba(232, 184, 74, 0.2)' 
                              : m.membershipType?.includes('SIGNATURE') 
                              ? 'rgba(78, 227, 184, 0.2)' 
                              : 'rgba(255, 255, 255, 0.08)',
                            color: m.membershipType?.includes('ELITE') 
                              ? 'var(--gold)' 
                              : m.membershipType?.includes('SIGNATURE') 
                              ? '#4EE3B8' 
                              : 'var(--text-muted)'
                          }}>
                            {m.membershipType || 'Standard'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>
                            {pts.toLocaleString('en-IN')} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>pts</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                              {pts.toLocaleString('en-IN')} / {milestoneTarget.toLocaleString('en-IN')} pts
                            </span>
                            <span style={{ fontWeight: 700, color: isAchieved ? '#10B981' : 'var(--gold)' }}>
                              {progressPercent}%
                            </span>
                          </div>
                          <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{
                              width: `${progressPercent}%`,
                              height: '100%',
                              borderRadius: 3,
                              background: isAchieved ? '#10B981' : 'linear-gradient(90deg, #FF8A00, #C9A24D)'
                            }} />
                          </div>
                        </td>
                        <td>
                          {isAchieved ? (
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.12)',
                              padding: '4px 8px',
                              borderRadius: 12,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <CheckCircle2 size={12} /> Achieved (Free 1-Yr Renewal)
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {remainingPts.toLocaleString('en-IN')} pts needed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Configure Loyalty Milestone Target */}
      {showMilestoneModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 120,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 480,
            maxWidth: '100%',
            borderRadius: 20,
            padding: 28,
            border: '1.5px solid var(--gold)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(201, 162, 77, 0.15)',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <Sliders size={18} color="var(--gold)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)' }}>
                    Configure Loyalty Milestone Goal
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Set the points threshold required for a complimentary 1-year renewal
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowMilestoneModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMilestone}>
              {/* Presets */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  QUICK PRESETS
                </label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {presets.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditMilestoneValue(p)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        border: editMilestoneValue === p ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                        background: editMilestoneValue === p ? 'rgba(201, 162, 77, 0.2)' : 'var(--surface-alt)',
                        color: editMilestoneValue === p ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {p.toLocaleString('en-IN')} Pts
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Number Input */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold)', display: 'block', marginBottom: 6 }}>
                  MILESTONE TARGET POINTS *
                </label>
                <input
                  type="number"
                  min="1000"
                  max="1000000"
                  step="500"
                  value={editMilestoneValue}
                  onChange={(e) => setEditMilestoneValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface-alt)',
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: 700,
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* Dynamic Preview of Changes */}
              <div style={{
                background: 'rgba(255, 138, 0, 0.08)',
                border: '1px solid rgba(255, 138, 0, 0.25)',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--text-main)',
                lineHeight: 1.5,
                marginBottom: 22
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#FF8A00', marginBottom: 4 }}>
                  <Info size={14} /> Immediate Recalculation Preview
                </div>
                With target set to <strong>{Number(editMilestoneValue || 0).toLocaleString('en-IN')} Points</strong>:
                <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                  <li>
                    <strong>{members.filter(m => (m.loyaltyPoints || 0) >= Number(editMilestoneValue || 0)).length}</strong> patrons will immediately qualify for Free 1-Year Renewal.
                  </li>
                  <li>
                    Table completion percentages and progress bars will recalculate dynamically for all <strong>{members.length}</strong> patrons.
                  </li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowMilestoneModal(false)}
                  disabled={isSavingMilestone}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSavingMilestone}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Check size={14} />
                  {isSavingMilestone ? 'Saving...' : 'Apply & Recalculate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
