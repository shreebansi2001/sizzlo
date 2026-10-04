import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, Mail, Phone, MapPin, Crown, Eye, X, Send, RefreshCw, Calendar, CreditCard } from 'lucide-react';
import axios from 'axios';
import { Member } from '../types';
import { fallbackCustomers } from '../api/client';

interface CustomersPageProps {
  members?: Member[];
  onRefresh?: () => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ members: initialMembers, onRefresh }) => {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers || fallbackCustomers);
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
          if (res.data?.success && res.data.data) {
            setMemberActivities(res.data.data);
          }
        })
        .catch(() => {});

      axios.get('/api/coupons')
        .then(res => {
          if (res.data?.success && res.data.data) {
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
      if (res.data?.success && res.data.data?.length) {
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
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.mobile.includes(searchTerm);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-input" style={{ width: 280 }}>
            <Search size={16} color="#64748B" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, background: 'var(--surface-alt)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
            {(['All', 'Active', 'Renewal Due'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === tab ? 'var(--primary)' : 'transparent',
                  color: statusFilter === tab ? '#070A09' : 'var(--text-muted)',
                  boxShadow: statusFilter === tab ? '0 2px 4px rgba(0,0,0,0.3)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <button className="primary-btn" onClick={() => setSelectedMember(memberList[0])} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShieldCheck size={16} />
          Issue New VIP Card
        </button>
      </div>

      {/* Customer CRM Table */}
      <div className="data-table-card" style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Total Spend</th>
              <th>Coupons Used</th>
              <th>Loyalty Pts</th>
              <th>Pending Dues</th>
              <th>Last Seen</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.membershipId}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.fullName}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.mobile}</p>
                  </div>
                </td>
                <td>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: m.membershipType.includes('DIAMOND') ? 'rgba(232, 184, 74, 0.2)' : 'rgba(0, 29, 74, 0.08)',
                    color: m.membershipType.includes('DIAMOND') ? 'var(--gold-dark)' : 'var(--primary)'
                  }}>
                    {m.membershipType}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: m.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: m.status === 'Active' ? '#059669' : '#D97706'
                  }}>
                    {m.status}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>₹{m.totalSpend.toLocaleString()}</td>
                <td>{m.couponsUsed} / {m.couponsTotal}</td>
                <td style={{ fontWeight: 700, color: 'var(--gold-dark)' }}>{m.loyaltyPoints.toLocaleString()}</td>
                <td>
                  {m.pendingDues > 0 ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{m.pendingDues.toLocaleString()}</span>
                  ) : (
                    <span style={{ color: '#059669', fontSize: 12, fontWeight: 600 }}>Cleared</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.lastVisit}</td>
                <td>
                  <button
                    onClick={() => setSelectedMember(m)}
                    style={{
                      background: 'rgba(0, 29, 74, 0.06)',
                      border: '1px solid rgba(0, 29, 74, 0.1)',
                      color: 'var(--primary)',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <Eye size={12} /> 360 View
                  </button>
                </td>
              </tr>
            ))}
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
                {/* LTV Metric Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #001D4A, #0A3175)',
                  borderRadius: 20,
                  padding: 20,
                  color: 'white'
                }}>
                  <span style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
                    Customer Lifetime Value (LTV)
                  </span>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
                    ₹{(selectedMember.totalSpend + 28000).toLocaleString('en-IN')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 16 }}>
                    {[
                      { label: 'Spend', val: `₹${(selectedMember.totalSpend / 1000).toFixed(0)}k` },
                      { label: 'Coupons', val: `${selectedMember.couponsUsed}/${selectedMember.couponsTotal}` },
                      { label: 'Points', val: selectedMember.loyaltyPoints.toLocaleString() },
                      { label: 'Visits', val: '42' },
                    ].map((s) => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 10px', borderRadius: 10 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>{s.label}</span>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#E8B84A' }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subsections: Dining & Coupon History */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>Dining History</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                      {memberActivities.length > 0 ? (
                        memberActivities.slice(0, 3).map((act, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{act.outletName || act.title}</span>
                            <span style={{ fontWeight: 700 }}>{act.points > 0 ? `+${act.points} pts` : `${act.points} pts`}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          No recent dining activity recorded for this member.
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>Voucher Redemptions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                      {availableCoupons.length > 0 ? (
                        availableCoupons.slice(0, 3).map((c, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{c.code} {c.name}</span>
                            <span style={{ color: c.leftCount > 0 ? 'var(--gold)' : '#10B981', fontWeight: 600 }}>
                              {c.leftCount > 0 ? `${c.leftCount} Left` : 'Redeemed'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          Loading member vouchers...
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
