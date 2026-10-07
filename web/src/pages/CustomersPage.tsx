import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Mail, Phone, MapPin, Crown, Eye, X, Send, RefreshCw, Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';
import { Member } from '../types';
import { fallbackCustomers } from '../api/client';

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
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Renewal Due' | 'Expired'>('All');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [memberActivities, setMemberActivities] = useState<any[]>([]);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

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

  const filtered = memberList.filter((m) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (m.fullName || '').toLowerCase().includes(term) ||
                          (m.membershipId || '').toLowerCase().includes(term) ||
                          (m.mobile || '').includes(term);
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReminder = (name: string) => {
    setActionNotice(`Renewal & privilege reminder sent to ${name} via WhatsApp and Email.`);
    setTimeout(() => setActionNotice(null), 3500);
  };

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

      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input" style={{ width: 320 }}>
            <Search size={16} color="#94A3B8" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            {(['All', 'Active', 'Renewal Due'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: statusFilter === tab ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab ? '#070A09' : 'var(--text-muted)',
                  boxShadow: statusFilter === tab ? '0 2px 4px rgba(0,0,0,0.3)' : 'none',
                  transition: 'all 0.2s ease'
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
            Refresh CRM
          </button>
          <button 
            className="primary-btn" 
            onClick={() => {
              if (memberList.length > 0) setSelectedMember(memberList[0]);
            }}
          >
            <ShieldCheck size={15} />
            Member Pass Viewer
          </button>
        </div>
      </div>

      {/* Customer CRM Table */}
      <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Membership ID</th>
              <th>Member Name</th>
              <th>Purchased Card / Tier</th>
              <th>Status</th>
              <th>Total Spend</th>
              <th>Coupons Vault</th>
              <th>Loyalty Pts</th>
              <th>Pending Dues</th>
              <th>Card Validity</th>
              <th style={{ textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching patron accounts from live backend...' : 'No patron accounts matching search criteria.'}
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const tier = (m.membershipType || 'REGISTERED USER').toUpperCase();
                const isSignature = tier.includes('SIGNATURE');
                const isElite = tier.includes('ELITE');
                const isClassic = tier.includes('CLASSIC');
                const isPaid = isSignature || isElite || isClassic;

                return (
                  <tr key={m.id || m.membershipId}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace', fontSize: 13 }}>
                      {m.membershipId}
                    </td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: 13 }}>{m.fullName || 'Patron'}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{m.mobile}</p>
                      </div>
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
                        {tier}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 20,
                        background: m.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: m.status === 'Active' ? '#10B981' : '#F59E0B',
                        border: `1px solid ${m.status === 'Active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        {m.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {safeCurrency(m.totalSpend)}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: isPaid ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: 12
                      }}>
                        {Number(m.couponsUsed || 0)} / {Number(m.couponsTotal || (isPaid ? 12 : 0))}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--gold)' }}>
                      {Number(m.loyaltyPoints || 0).toLocaleString('en-IN')}
                    </td>
                    <td>
                      {Number(m.pendingDues || 0) > 0 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 800 }}>
                          {safeCurrency(m.pendingDues)}
                        </span>
                      ) : (
                        <span style={{ color: '#10B981', fontSize: 11, fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                          Cleared
                        </span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {m.expiryDate || 'Annual Plan'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedMember(m)}
                        style={{
                          background: 'rgba(255, 138, 0, 0.12)',
                          border: '1px solid rgba(255, 138, 0, 0.3)',
                          color: 'var(--primary)',
                          padding: '6px 12px',
                          borderRadius: 8,
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5
                        }}
                      >
                        <Eye size={12} /> 360 View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Customer 360 Modal (matching demo_code admin.customers.$id.tsx) */}
      {selectedMember && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 18, 46, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: 24,
            width: '100%',
            maxWidth: 880,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 32,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedMember(null)}
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="var(--primary)" />
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28 }}>
              {/* Profile Card Sidebar */}
              <div style={{
                background: 'var(--surface-alt)',
                borderRadius: 20,
                padding: 24,
                border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.2), rgba(201, 162, 77, 0.2))',
                    color: 'var(--gold)',
                    fontSize: 22,
                    fontWeight: 800,
                    display: 'grid',
                    placeItems: 'center',
                    border: '1.5px solid var(--gold)'
                  }}>
                    {selectedMember.fullName[0]}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>{selectedMember.fullName}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selectedMember.membershipId}</p>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--gold)',
                      background: 'rgba(201, 162, 77, 0.15)',
                      padding: '2px 8px',
                      borderRadius: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      marginTop: 4
                    }}>
                      <Crown size={10} /> {selectedMember.membershipType}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                    <Phone size={14} color="var(--text-muted)" /> {selectedMember.mobile}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                    <Mail size={14} color="var(--text-muted)" /> {selectedMember.email}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-main)' }}>
                    <MapPin size={14} color="var(--text-muted)" /> Bodakdev, Ahmedabad
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
                  <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{selectedMember.status}</div>
                  </div>
                  <div style={{ background: 'var(--surface)', padding: 10, borderRadius: 10, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Expires</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{selectedMember.expiryDate}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                  <button
                    onClick={() => handleReminder(selectedMember.fullName)}
                    className="primary-btn"
                    style={{ flex: 1, fontSize: 12, padding: '10px 0', textAlign: 'center' }}
                  >
                    Send Nudge
                  </button>
                  <button
                    onClick={() => handleReminder(selectedMember.fullName)}
                    style={{
                      flex: 1,
                      fontSize: 12,
                      padding: '10px 0',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Renew Plan
                  </button>
                </div>
              </div>

              {/* Right Area: Lifetime Value & History */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Purchased VIP Card & Membership Pass */}
                {(() => {
                  const tier = (selectedMember.membershipType || 'REGISTERED USER').toUpperCase();
                  const isSignature = tier.includes('SIGNATURE');
                  const isElite = tier.includes('ELITE');
                  const isClassic = tier.includes('CLASSIC');
                  const isPaid = isSignature || isElite || isClassic;
                  const planValue = isElite ? '₹15,000 / Year' : isSignature ? '₹10,000 / Year' : isClassic ? '₹5,000 / Year' : 'Free User';

                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, #0A1C14 0%, #07120D 100%)',
                      border: '1px solid rgba(232, 184, 74, 0.4)',
                      borderRadius: 20,
                      padding: 22,
                      boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CreditCard size={18} color="var(--gold)" />
                          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--gold)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Purchased VIP Card Pass
                          </span>
                        </div>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 800,
                          background: isPaid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isPaid ? '#10B981' : 'var(--text-muted)',
                          border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)'}`
                        }}>
                          {isPaid ? 'LIVE DIGITAL PASS' : 'STANDARD REGISTRATION'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subscription Plan</span>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', marginTop: 4 }}>{tier}</div>
                          <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>{planValue}</span>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Card Validity</span>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', marginTop: 4 }}>
                            {selectedMember.expiryDate || 'Active 365 Days'}
                          </div>
                          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 600 }}>● Razorpay Verified</span>
                        </div>

                        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: 12, borderRadius: 12, border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Vault Status</span>
                          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>
                            {Number(selectedMember.couponsUsed || 0)} / {Number(selectedMember.couponsTotal || (isPaid ? 12 : 0))} Used
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {Math.max(0, Number(selectedMember.couponsTotal || (isPaid ? 12 : 0)) - Number(selectedMember.couponsUsed || 0))} Available
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Spend:</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: '#FFFFFF' }}>{safeCurrency(selectedMember.totalSpend)}</span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loyalty Points:</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--gold)' }}>{Number(selectedMember.loyaltyPoints || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dues:</span>
                          <span style={{ fontSize: 14, fontWeight: 800, color: Number(selectedMember.pendingDues || 0) > 0 ? 'var(--danger)' : '#10B981' }}>
                            {Number(selectedMember.pendingDues || 0) > 0 ? safeCurrency(selectedMember.pendingDues) : 'Cleared'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Subsections: Dining & Coupon History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 18, background: 'var(--surface)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                      Live Dining Activity
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                      {memberActivities.length > 0 ? (
                        memberActivities.slice(0, 4).map((act, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{act.outletName || act.title}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{act.type || 'Dining Visit'}</div>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{act.points > 0 ? `+${act.points} pts` : `${act.points || 0} pts`}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '12px 0' }}>
                          No recent dining settlements logged for this patron.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 18, background: 'var(--surface)' }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
                      12-Voucher Privilege Vault
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, maxHeight: 200, overflowY: 'auto' }}>
                      {availableCoupons.length > 0 ? (
                        availableCoupons.map((c, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                            <div>
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: 11 }}>[{c.code}]</span>
                              <span style={{ marginLeft: 6, color: '#FFFFFF' }}>{c.name}</span>
                            </div>
                            <span style={{
                              padding: '2px 7px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              background: c.leftCount > 0 ? 'rgba(201, 162, 77, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: c.leftCount > 0 ? 'var(--gold)' : '#10B981'
                            }}>
                              {c.leftCount > 0 ? `${c.leftCount} Available` : 'Redeemed'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '12px 0' }}>
                          No active vouchers in this patron vault. Subscribing to an annual card automatically generates the 12-voucher vault.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
