import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BadgeCheck, 
  AlertCircle, 
  RefreshCw, 
  Wallet, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Sparkles, 
  Crown, 
  CheckCircle2, 
  Zap,
  ArrowRight,
  Gift,
  Edit3,
  X
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';
import { Member, SubscriptionPlan } from '../types';
import { fetchPlans, addOfferToPlan, removeOfferFromPlan, resetPlans, updatePlanDetails } from '../api/client';
import { DEFAULT_USERS_DATASET } from '../data/defaultUsers';

export const MembershipsPage: React.FC = () => {
  const [memberList, setMemberList] = useState<Member[]>(DEFAULT_USERS_DATASET);
  const [membershipRev, setMembershipRev] = useState('₹1.10 Lakh');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('signature');
  const [newOfferText, setNewOfferText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Edit Plan & Pricing Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    memberLabel: string;
    price: number;
    offerLabel: string;
    description: string;
    highlights: string[];
    newHighlightInput: string;
  }>({
    name: '',
    memberLabel: '',
    price: 0,
    offerLabel: '',
    description: '',
    highlights: [],
    newHighlightInput: '',
  });

  const handleOpenEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      memberLabel: plan.memberLabel,
      price: plan.price,
      offerLabel: plan.offerLabel,
      description: plan.description,
      highlights: [...(plan.highlights || [])],
      newHighlightInput: '',
    });
  };

  const handleSavePlanEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setIsSubmitting(true);
    try {
      const updated = await updatePlanDetails(editingPlan.id, {
        name: editForm.name,
        memberLabel: editForm.memberLabel,
        price: Number(editForm.price),
        offerLabel: editForm.offerLabel,
        description: editForm.description,
        highlights: editForm.highlights,
      });
      if (updated) {
        setPlans(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        setSyncToast(`Plan "${updated.name}" pricing & offers saved and synced to Mobile App!`);
        setEditingPlan(null);
        setTimeout(() => setSyncToast(null), 4000);
      }
    } catch (err: any) {
      setSyncToast(`Failed to update plan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPlans = async () => {
    setIsLoadingPlans(true);
    try {
      const data = await fetchPlans();
      if (data && data.length > 0) {
        setPlans(data);
      }
    } finally {
      setIsLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();

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

  const handleOpenAddModal = (planId?: string) => {
    if (planId) setSelectedPlanId(planId);
    setNewOfferText('');
    setShowAddModal(true);
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOfferText.trim()) return;

    setIsSubmitting(true);
    const updatedPlan = await addOfferToPlan(selectedPlanId, newOfferText.trim());
    setIsSubmitting(false);

    if (updatedPlan) {
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setSyncToast(`Offer added to ${updatedPlan.name} and synced to mobile app!`);
      setShowAddModal(false);
      setNewOfferText('');
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const handleDeleteOffer = async (planId: string, offer: string) => {
    if (!window.confirm(`Remove offer "${offer}" from ${planId.toUpperCase()} plan?`)) return;
    const updatedPlan = await removeOfferFromPlan(planId, offer);
    if (updatedPlan) {
      setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      setSyncToast(`Offer removed and mobile app synced!`);
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

  const handleResetPlans = async () => {
    if (!window.confirm('Reset all plans and offers to original defaults?')) return;
    const defaultPlans = await resetPlans();
    if (defaultPlans && defaultPlans.length > 0) {
      setPlans(defaultPlans);
      setSyncToast('Plans and offers restored to initial baseline!');
      setTimeout(() => setSyncToast(null), 4000);
    }
  };

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

  // Helper colors for plan cards
  const getPlanStyling = (planId: string) => {
    switch (planId) {
      case 'classic':
        return {
          badgeClass: 'badge-gold',
          accentColor: '#DFC27D',
          border: '1px solid rgba(201, 162, 77, 0.35)',
          background: 'linear-gradient(145deg, #1C1510 0%, #120D09 100%)',
          glow: 'rgba(201, 162, 77, 0.1)',
        };
      case 'signature':
        return {
          badgeClass: 'badge-orange',
          accentColor: '#4EE3B8',
          border: '1px solid rgba(78, 227, 184, 0.4)',
          background: 'linear-gradient(145deg, #0F2D25 0%, #071914 100%)',
          glow: 'rgba(78, 227, 184, 0.15)',
        };
      case 'elite':
      default:
        return {
          badgeClass: 'badge-gold',
          accentColor: '#FFB800',
          border: '1px solid rgba(255, 184, 0, 0.45)',
          background: 'linear-gradient(145deg, #221A0F 0%, #140E06 100%)',
          glow: 'rgba(255, 184, 0, 0.15)',
        };
    }
  };

  const sampleQuickOffers = [
    '15% off across weekend dining',
    'Complimentary Chef Special Dessert',
    'Buy 1 Get 1 Pizza at Dough by Yanki',
    'Free Banquet Mocktails for 10 Guests',
    'Priority Valet & VIP Table Window',
  ];

  return (
    <div>
      {/* Toast Notification */}
      {syncToast && (
        <div style={{
          position: 'fixed',
          top: 84,
          right: 32,
          zIndex: 1000,
          background: '#0E3B32',
          border: '1px solid #4EE3B8',
          color: '#4EE3B8',
          padding: '12px 20px',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          animation: 'modalEnter 0.25s ease-out',
        }}>
          <CheckCircle2 size={18} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{syncToast}</span>
        </div>
      )}

      {/* Plan & Offer Management Section Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24,
        background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.08) 0%, rgba(255, 138, 0, 0.04) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '20px 24px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Crown size={22} color="var(--gold)" />
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
              Privilege Subscription Plans & Offers Manager
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981',
              padding: '3px 10px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}>
              <Zap size={12} />
              LIVE APP SYNC ACTIVE
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Add, update, or remove offers from any plan. Changes automatically reflect in real time on the VIP Mobile App.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            className="btn btn-outline btn-sm"
            onClick={handleResetPlans}
            title="Reset plans to default values"
            style={{ fontSize: 12 }}
          >
            <RefreshCw size={13} />
            <span>Reset Baseline</span>
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenAddModal()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 13 }}
          >
            <Plus size={16} />
            <span>Add Offer to Plan</span>
          </button>
        </div>
      </div>

      {/* 3 Interactive Plan Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 20,
        marginBottom: 32,
      }}>
        {plans.filter(p => p.id !== 'free').map((p) => {
          const style = getPlanStyling(p.id);
          return (
            <div
              key={p.id}
              style={{
                background: style.background,
                border: style.border,
                borderRadius: 22,
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: `0 12px 32px ${style.glow}`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      color: style.accentColor,
                    }}>
                      {p.memberLabel}
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                      {p.name}
                    </h3>
                  </div>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    color: style.accentColor,
                  }}>
                    {p.offerLabel}
                  </span>
                </div>

                {/* Price & Edit Button Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--gold)' }}>
                      {p.price === 0 ? 'FREE' : `₹${p.price.toLocaleString('en-IN')}`}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.price === 0 ? 'forever' : 'annually'}</span>
                  </div>
                  <button
                    onClick={() => handleOpenEditPlan(p)}
                    style={{
                      background: 'rgba(232, 184, 74, 0.12)',
                      border: '1px solid rgba(232, 184, 74, 0.4)',
                      color: 'var(--gold)',
                      borderRadius: 8,
                      padding: '5px 11px',
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Edit3 size={12} />
                    <span>Edit Plan &amp; Price</span>
                  </button>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>
                  {p.description}
                </p>

                {/* Offer Highlights Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                  paddingTop: 14,
                  marginBottom: 12,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Active Offers & Highlights ({p.highlights?.length || 0})
                  </span>
                  <button
                    onClick={() => handleOpenAddModal(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: style.accentColor,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Plus size={13} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Offers List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                  {p.highlights?.map((h, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 12,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                        <span style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: style.accentColor,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}>
                          <CheckCircle2 size={12} color="#070A09" />
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-main)', whiteSpace: 'normal' }}>
                          {h}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteOffer(p.id, h)}
                        title="Remove offer from plan"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          padding: 4,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          opacity: 0.7,
                          transition: 'opacity 0.2s ease',
                          flexShrink: 0,
                          marginLeft: 8,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Button */}
              <button
                onClick={() => handleOpenAddModal(p.id)}
                style={{
                  width: '100%',
                  marginTop: 18,
                  padding: '10px',
                  borderRadius: 12,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${style.accentColor}40`,
                  color: style.accentColor,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'all 0.2s ease',
                }}
              >
                <Plus size={14} />
                <span>Add Offer to {p.name}</span>
              </button>
            </div>
          );
        })}
      </div>

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
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Projected renewals vs dues based on user telemetry</p>
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
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>User distribution across privilege plans</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { name: 'Elite VIP Connoisseur', price: '₹15,000/yr', count: `${plans.find(p=>p.id==='elite')?.highlights.length || 3} Offers`, pct: 35, color: 'var(--gold)' },
                { name: 'Signature Gourmet', price: '₹10,000/yr', count: `${plans.find(p=>p.id==='signature')?.highlights.length || 3} Offers`, pct: 45, color: 'var(--primary)' },
                { name: 'Classic Privileges', price: '₹5,000/yr', count: `${plans.find(p=>p.id==='classic')?.highlights.length || 3} Offers`, pct: 20, color: '#60A5FA' },
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

          <button 
            className="btn btn-outline" 
            style={{ width: '100%', marginTop: 16 }}
            onClick={() => handleOpenAddModal()}
          >
            <Sparkles size={14} color="var(--gold)" />
            <span>Configure Plan Privileges</span>
          </button>
        </div>
      </div>

      {/* Modal: Add Offer to Plan */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: 480,
            borderRadius: 24,
            padding: 28,
            border: '1px solid rgba(201, 162, 77, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
            animation: 'modalEnter 0.25s ease-out',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Gift size={20} color="var(--gold)" />
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
                Add Privilege Offer to Plan
              </h3>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              This offer will instantly sync and appear for users under this subscription on the VIP mobile app.
            </p>

            <form onSubmit={handleAddOffer}>
              {/* Select Target Plan */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Target Subscription Plan
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  <option value="classic">Classic Subscription (₹5,000 / yr)</option>
                  <option value="signature">Signature Subscription (₹10,000 / yr)</option>
                  <option value="elite">Elite Subscription (₹15,000 / yr)</option>
                </select>
              </div>

              {/* Offer Text */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Offer Title / Privilege Benefit
                </label>
                <input
                  type="text"
                  placeholder="e.g. 20% off all chef tasting menus"
                  value={newOfferText}
                  onChange={(e) => setNewOfferText(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Quick Suggestion Chips */}
              <div style={{ marginBottom: 22 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
                  Quick Suggestions
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sampleQuickOffers.map((suggest) => (
                    <button
                      key={suggest}
                      type="button"
                      onClick={() => setNewOfferText(suggest)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-muted)',
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      + {suggest}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{isSubmitting ? 'Syncing...' : 'Add & Sync to App'}</span>
                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PLAN & PRICING */}
      {editingPlan && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '28px',
            maxWidth: 620,
            width: '100%',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Crown size={22} color="var(--gold)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
                  Edit Plan &amp; Pricing: {editingPlan.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Update the annual membership fee, display labels, outlet scope, and all active offer bullet points. Changes will sync immediately to the VIP mobile app.
            </p>

            <form onSubmit={handleSavePlanEdit}>
              {/* Row 1: Plan Name & Member Tier Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Plan Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Member Badge / Tag
                  </label>
                  <input
                    type="text"
                    value={editForm.memberLabel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, memberLabel: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row 2: Price & Offer Tagline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Annual Price (₹)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontWeight: 700 }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 30px',
                        borderRadius: 12,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 14,
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                  </div>

                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Offer Badge / Tagline
                  </label>
                  <input
                    type="text"
                    value={editForm.offerLabel}
                    onChange={(e) => setEditForm(prev => ({ ...prev, offerLabel: e.target.value }))}
                    placeholder="e.g. 6 OFFERS or FREE TIER PERKS"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Description */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Plan Scope / Outlets Valid
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Row 4: Editable Perks & Offers List */}
              <div style={{
                marginBottom: 22,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
                    Active Offers &amp; Highlights ({editForm.highlights.length})
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Edit or delete bullet points</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', marginBottom: 14 }}>
                  {editForm.highlights.map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="text"
                        value={h}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditForm(prev => {
                            const updated = [...prev.highlights];
                            updated[idx] = val;
                            return { ...prev, highlights: updated };
                          });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-main)',
                          fontSize: 12,
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setEditForm(prev => ({
                            ...prev,
                            highlights: prev.highlights.filter((_, i) => i !== idx)
                          }));
                        }}
                        title="Remove perk"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          color: '#EF4444',
                          borderRadius: 8,
                          padding: '8px',
                          cursor: 'pointer',
                          display: 'grid',
                          placeItems: 'center'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  {editForm.highlights.length === 0 && (
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center', padding: 12 }}>
                      No offers configured for this plan. Add one below!
                    </div>
                  )}
                </div>

                {/* Add new perk row inside modal */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Type new offer/perk to add..."
                    value={editForm.newHighlightInput}
                    onChange={(e) => setEditForm(prev => ({ ...prev, newHighlightInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editForm.newHighlightInput.trim()) {
                          setEditForm(prev => ({
                            ...prev,
                            highlights: [...prev.highlights, prev.newHighlightInput.trim()],
                            newHighlightInput: '',
                          }));
                        }
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 12,
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (editForm.newHighlightInput.trim()) {
                        setEditForm(prev => ({
                          ...prev,
                          highlights: [...prev.highlights, prev.newHighlightInput.trim()],
                          newHighlightInput: '',
                        }));
                      }
                    }}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: 'rgba(255, 138, 0, 0.15)',
                      border: '1px solid var(--primary)',
                      color: 'var(--primary)',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Perk
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingPlan(null)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{isSubmitting ? 'Saving Changes...' : 'Save Plan & Sync to App'}</span>
                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
