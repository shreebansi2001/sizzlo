import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, Mail, Phone, MapPin, Crown, Eye, X, Send, 
  RefreshCw, Calendar, CreditCard, User, UserCheck, UserX, Sparkles, CheckCircle2
} from 'lucide-react';
import axios from 'axios';
import { Member } from '../types';

interface CustomersPageProps {
  members?: Member[];
  onRefresh?: () => void;
}

const safeCurrency = (val: any): string => {
  const num = Number(val);
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

export const CustomersPage: React.FC<CustomersPageProps> = ({ members: initialMembers, onRefresh }) => {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers || []);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Primary Segmentation Filter: All | Subscribed | Non-Subscribed
  const [subscriptionSegment, setSubscriptionSegment] = useState<'All' | 'Subscribed' | 'Non-Subscribed'>('All');
  
  // Secondary Status Filter: All | Active | Renewal Due
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Renewal Due' | 'Expired'>('All');
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [memberActivities, setMemberActivities] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  // Manual VIP Upgrade Modal State
  const [upgradeTargetMember, setUpgradeTargetMember] = useState<Member | null>(null);
  const [selectedTierToGrant, setSelectedTierToGrant] = useState<'classic' | 'signature' | 'elite'>('signature');
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (selectedMember) {
      axios.get(`/api/members/${selectedMember.membershipId}/loyalty`)
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setMemberActivities(res.data.data);
          }
        })
        .catch(() => {});

      axios.get(`/api/coupons?membershipId=${encodeURIComponent(selectedMember.membershipId)}&mobile=${encodeURIComponent(selectedMember.mobile || '')}`)
        .then(res => {
          if (res.data?.success && Array.isArray(res.data.data)) {
            setAvailableCoupons(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [selectedMember]);

  const fetchLiveMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/members');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMemberList(res.data.data);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveMembers();
  }, []);

  const isUserSubscribed = (m: Member): boolean => {
    const tier = (m.membershipType || '').toUpperCase();
    const plan = (m.planId || '').toLowerCase();
    return plan === 'classic' || plan === 'signature' || plan === 'elite' ||
           tier.includes('SUBSCRIBER') || tier.includes('CLASSIC') || 
           tier.includes('SIGNATURE') || tier.includes('ELITE');
  };

  const filtered = memberList.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (m.fullName || '').toLowerCase().includes(term) ||
                          (m.membershipId || '').toLowerCase().includes(term) ||
                          (m.mobile || '').includes(term);

    const isSub = isUserSubscribed(m);
    let matchesSegment = true;
    if (subscriptionSegment === 'Subscribed') {
      matchesSegment = isSub;
    } else if (subscriptionSegment === 'Non-Subscribed') {
      matchesSegment = !isSub;
    }

    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesSegment && matchesStatus;
  });

  const handleManualVipUpgrade = async () => {
    if (!upgradeTargetMember) return;
    setIsUpgrading(true);
    try {
      const res = await axios.post('/api/payment/verify-razorpay', {
        mobile: upgradeTargetMember.mobile,
        membershipId: upgradeTargetMember.membershipId,
        planId: selectedTierToGrant,
        razorpayPaymentId: `admin_grant_${Date.now()}`,
        razorpayOrderId: `ord_admin_${Date.now()}`,
        razorpaySignature: 'sig_mock_admin',
        amount: selectedTierToGrant === 'classic' ? 5000 : selectedTierToGrant === 'signature' ? 10000 : 15000
      });

      if (res.data?.success) {
        setActionNotice(`🎉 Successfully activated ${selectedTierToGrant.toUpperCase()} VIP Plan for ${upgradeTargetMember.fullName || 'User'}!`);
        setUpgradeTargetMember(null);
        await fetchLiveMembers();
      } else {
        setActionNotice(`Failed to activate plan: ${res.data?.message || 'Error'}`);
      }
    } catch (e: any) {
      setActionNotice(`Error activating VIP plan: ${e.message}`);
    } finally {
      setIsUpgrading(false);
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Metric counts
  const totalUsers = memberList.length;
  const subscribedUsers = memberList.filter(isUserSubscribed).length;
  const nonSubscribedUsers = totalUsers - subscribedUsers;
  const totalLoyaltyPoints = memberList.reduce((acc, m) => acc + (Number(m.loyaltyPoints) || 0), 0);

  return (
    <div>
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          background: 'rgba(232, 184, 74, 0.15)',
          border: '1px solid var(--gold)',
          color: 'var(--primary)',
          padding: '12px 18px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <Crown size={16} color="var(--gold-dark)" />
          {actionNotice}
        </div>
      )}

      {/* 4 Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card">
          <span className="kpi-label">TOTAL REGISTERED USERS</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 26, color: 'var(--primary)' }}>
            {totalUsers}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>All platform accounts</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">VIP SUBSCRIBED USERS</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 26, color: '#10B981' }}>
            {subscribedUsers}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Active annual memberships</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">NON-SUBSCRIBED (FREE)</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 26, color: '#F59E0B' }}>
            {nonSubscribedUsers}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Standard registered accounts</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">TOTAL LOYALTY POINTS</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 26, color: 'var(--gold)' }}>
            {totalLoyaltyPoints.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Issued reward balance</span>
        </div>
      </div>

      {/* Primary Segment Filters & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Box */}
          <div className="search-input" style={{ width: 300 }}>
            <Search size={16} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Search user name, ID, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Subscribed vs Non-Subscribed Segment Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setSubscriptionSegment('All')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: subscriptionSegment === 'All' ? 'var(--primary)' : 'transparent',
                color: subscriptionSegment === 'All' ? '#070A09' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              All Users ({totalUsers})
            </button>
            <button
              onClick={() => setSubscriptionSegment('Subscribed')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: subscriptionSegment === 'Subscribed' ? '#10B981' : 'transparent',
                color: subscriptionSegment === 'Subscribed' ? '#FFFFFF' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease'
              }}
            >
              <Crown size={12} /> VIP Subscribed ({subscribedUsers})
            </button>
            <button
              onClick={() => setSubscriptionSegment('Non-Subscribed')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                background: subscriptionSegment === 'Non-Subscribed' ? '#F59E0B' : 'transparent',
                color: subscriptionSegment === 'Non-Subscribed' ? '#070A09' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.2s ease'
              }}
            >
              <User size={12} /> Non-Subscribed ({nonSubscribedUsers})
            </button>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            {(['All', 'Active', 'Renewal Due'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: statusFilter === tab ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={fetchLiveMembers}
            className="btn btn-outline" 
            style={{ fontSize: 12, padding: '8px 14px' }}
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh Users
          </button>
        </div>
      </div>

      {/* Users CRM Table */}
      <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>User ID</th>
              <th>User Name &amp; Phone</th>
              <th>Subscription Status</th>
              <th>Account Tier</th>
              <th>Coupons Vault</th>
              <th>Loyalty Points</th>
              <th>Total Spend</th>
              <th>Validity</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching users from live backend...' : 'No users matching selected filter criteria.'}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const tier = (m.membershipType || 'REGISTERED USER').toUpperCase();
                const isSignature = tier.includes('SIGNATURE');
                const isElite = tier.includes('ELITE');
                const isClassic = tier.includes('CLASSIC');
                const isPaid = isSignature || isElite || isClassic || isUserSubscribed(m);

                return (
                  <tr key={m.id || m.membershipId}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 13 }}>
                      {m.membershipId}
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>{m.fullName || 'User'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.mobile}</p>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.12)',
                        color: isPaid ? '#10B981' : '#F59E0B',
                        border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {isPaid ? <CheckCircle2 size={11} /> : <User size={11} />}
                        {isPaid ? 'SUBSCRIBED' : 'NON-SUBSCRIBED'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        padding: '4px 9px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        background: isElite ? 'rgba(232, 184, 74, 0.2)' : isSignature ? 'rgba(16, 185, 129, 0.15)' : isClassic ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isElite ? 'var(--gold)' : isSignature ? '#10B981' : isClassic ? '#60A5FA' : 'var(--text-muted)',
                        border: `1px solid ${isElite ? 'rgba(232, 184, 74, 0.4)' : isSignature ? 'rgba(16, 185, 129, 0.3)' : isClassic ? 'rgba(59, 130, 246, 0.3)' : 'var(--border)'}`
                      }}>
                        {isPaid && <Crown size={11} />}
                        {isPaid ? tier : 'FREE ACCOUNT'}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: isPaid ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: 12
                      }}>
                        {isPaid 
                          ? `${Math.max(0, Number(m.couponsTotal || 12) - Number(m.couponsUsed || 0))} Vouchers`
                          : '0 (No Vault)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--gold)', fontSize: 13 }}>
                      {Number(m.loyaltyPoints || 0).toLocaleString('en-IN')} pts
                    </td>
                    <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {safeCurrency(m.totalSpend)}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {isPaid ? (m.expiryDate || '365 Days') : 'Free Tier'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                        <button
                          onClick={() => setSelectedMember(m)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 8,
                            background: 'var(--surface-alt)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Eye size={12} /> View Profile
                        </button>

                        {!isPaid && (
                          <button
                            onClick={() => setUpgradeTargetMember(m)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: 'rgba(232, 184, 74, 0.15)',
                              border: '1px solid var(--gold)',
                              color: 'var(--gold)',
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            <Crown size={12} /> Activate VIP
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: MANUAL VIP UPGRADE FOR NON-SUBSCRIBED USER */}
      {upgradeTargetMember && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 480,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Activate VIP Subscription
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  For user: <strong>{upgradeTargetMember.fullName}</strong> ({upgradeTargetMember.mobile})
                </p>
              </div>
              <button
                onClick={() => setUpgradeTargetMember(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                Select VIP Plan to Activate:
              </label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'classic', name: 'Classic VIP Annual Pass', perks: '6 Vouchers Vault • Flat 15% Off', color: '#60A5FA' },
                  { id: 'signature', name: 'Signature VIP Annual Pass', perks: '12 Vouchers Vault • Flat 20% Off • Priority Table', color: '#10B981' },
                  { id: 'elite', name: 'Elite VIP Annual Pass', perks: '18 Vouchers Vault • 5 Gift Vouchers • Highest Priority', color: 'var(--gold)' },
                ].map(p => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedTierToGrant(p.id as any)}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: `1.5px solid ${selectedTierToGrant === p.id ? p.color : 'var(--border)'}`,
                      background: selectedTierToGrant === p.id ? 'rgba(255,255,255,0.05)' : 'var(--surface-alt)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 13, color: p.color }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{p.perks}</div>
                    </div>
                    {selectedTierToGrant === p.id && <Crown size={16} color={p.color} />}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: 12,
              borderRadius: 10,
              background: 'rgba(255, 138, 0, 0.08)',
              border: '1px solid rgba(255, 138, 0, 0.2)',
              fontSize: 11,
              color: 'var(--text-muted)',
              marginBottom: 18
            }}>
              💡 Activating VIP membership will automatically generate the voucher vault, grant 365-day validity, and unlock table booking privileges in the mobile app.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setUpgradeTargetMember(null)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                disabled={isUpgrading}
                onClick={handleManualVipUpgrade}
                style={{
                  padding: '9px 20px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {isUpgrading ? 'Activating...' : 'Confirm VIP Activation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER 360 PROFILE & PASS DRAWER */}
      {selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            width: '100%',
            maxWidth: 620,
            height: '100%',
            padding: 24,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>User 360 Profile</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>ID: {selectedMember.membershipId}</p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Info Card */}
            <div style={{
              background: 'var(--surface-alt)',
              borderRadius: 16,
              padding: 18,
              border: '1px solid var(--border)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#FFFFFF' }}>{selectedMember.fullName || 'User'}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{selectedMember.mobile}</p>
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 800,
                  background: isUserSubscribed(selectedMember) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  color: isUserSubscribed(selectedMember) ? '#10B981' : 'var(--text-muted)',
                  border: `1px solid ${isUserSubscribed(selectedMember) ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)'}`
                }}>
                  {isUserSubscribed(selectedMember) ? 'VIP SUBSCRIBER' : 'FREE ACCOUNT'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Spend</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF', marginTop: 2 }}>{safeCurrency(selectedMember.totalSpend)}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Loyalty Points</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)', marginTop: 2 }}>{Number(selectedMember.loyaltyPoints || 0).toLocaleString('en-IN')}</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 10 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Coupons Vault</span>
                  <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                    {isUserSubscribed(selectedMember) ? `${selectedMember.couponsUsed || 0} / ${selectedMember.couponsTotal || 12} Used` : 'No Vault'}
                  </div>
                </div>
              </div>

              {!isUserSubscribed(selectedMember) && (
                <button
                  onClick={() => {
                    setUpgradeTargetMember(selectedMember);
                    setSelectedMember(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 10,
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6
                  }}
                >
                  <Crown size={14} /> Upgrade User to VIP Plan
                </button>
              )}
            </div>

            {/* Dining Activity & Coupons Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--surface-alt)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
                  Recent Dining Settlements
                </h4>
                {memberActivities.length > 0 ? (
                  memberActivities.slice(0, 4).map((act, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{act.outletName || act.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{act.type || 'Visit'}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--gold)' }}>+{act.points} pts</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent dining activity recorded.</p>
                )}
              </div>

              <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--surface-alt)' }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 10 }}>
                  Active Vouchers in Vault
                </h4>
                {availableCoupons.length > 0 ? (
                  availableCoupons.map((c, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>[{c.code}]</span> {c.name}
                      </div>
                      <span style={{ color: c.leftCount > 0 ? 'var(--gold)' : 'var(--text-muted)', fontWeight: 700, fontSize: 11 }}>
                        {c.leftCount > 0 ? `${c.leftCount} Available` : 'Redeemed'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {isUserSubscribed(selectedMember) ? 'All coupons redeemed or none found.' : 'Free account has no coupon vault. Upgrade to VIP to generate 12 vouchers.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
