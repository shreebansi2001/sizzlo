import React, { useState, useEffect } from 'react';
import { Plus, Ticket, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { Coupon } from '../types';

interface CouponsPageProps {
  coupons: Coupon[];
  onRefresh?: () => void;
}

export const CouponsPage: React.FC<CouponsPageProps> = ({ coupons, onRefresh }) => {
  const [couponList, setCouponList] = useState<Coupon[]>(coupons);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('Exclusive VIP Dining privilege');
  const [newOutlet, setNewOutlet] = useState('All Yanki Outlets');
  const [newTargetAudience, setNewTargetAudience] = useState('ALL');
  const [newDiscountType, setNewDiscountType] = useState('PERCENT');
  const [newDiscountValue, setNewDiscountValue] = useState(15);
  const [newTotalCount, setNewTotalCount] = useState(3);
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null);

  const fetchLiveCoupons = () => {
    axios.get('/api/coupons')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setCouponList(res.data.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    setIsSubmitting(true);
    const isVip = newTargetAudience !== 'NON_SUBSCRIBED' && newTargetAudience !== 'ALL';
    const payload = {
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      subtitle: newSubtitle.trim(),
      description: `Exclusive privilege voucher issued from management desk for ${newOutlet}. Target: ${newTargetAudience}.`,
      leftCount: newTotalCount,
      totalCount: newTotalCount,
      expiryDate: '2027-12-31',
      status: 'available',
      outlet: newOutlet,
      color: isVip ? 'gold' : 'royal',
      targetAudience: newTargetAudience,
      vipOnly: isVip,
      discountType: newDiscountType,
      discountValue: Number(newDiscountValue),
    };

    try {
      const res = await axios.post('/api/coupons', payload);
      if (res.data?.success && res.data.data) {
        setCouponList(prev => [res.data.data, ...prev]);
      } else {
        fetchLiveCoupons();
      }
      setShowAddModal(false);
      setNewCode('');
      setNewName('');
      setNotificationNotice(`✅ Privilege Voucher "${payload.name}" published for ${payload.targetAudience}! Push Notification dispatched.`);
      setTimeout(() => setNotificationNotice(null), 5000);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to create coupon', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to deactivate and remove this voucher?')) return;
    try {
      await axios.delete(`/api/coupons/${id}`);
      setCouponList(prev => prev.filter(c => c.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete coupon', err);
    }
  };

  return (
    <div>
      {notificationNotice && (
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
          {notificationNotice}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Privilege Vouchers & Promotions</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure dining benefits, complimentary treats, and audience targeting</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Audience Filter Pills */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface-alt)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
            {[
              { id: 'ALL', label: 'All Vouchers' },
              { id: 'NON_SUBSCRIBED', label: '🎯 Non-Subscribed' },
              { id: 'VIP', label: '👑 VIP Subscribers' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setAudienceFilter(f.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 11,
                  fontWeight: audienceFilter === f.id ? 700 : 500,
                  background: audienceFilter === f.id ? 'var(--primary)' : 'transparent',
                  color: audienceFilter === f.id ? '#070A09' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            Create New Voucher
          </button>
        </div>
      </div>

      {/* Grid of Coupons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {couponList
          .filter(c => {
            if (audienceFilter === 'ALL') return true;
            if (audienceFilter === 'NON_SUBSCRIBED') return c.targetAudience === 'NON_SUBSCRIBED' || c.targetAudience === 'ALL';
            if (audienceFilter === 'VIP') return c.targetAudience !== 'NON_SUBSCRIBED';
            return true;
          })
          .map((c) => {
            const isNonSub = c.targetAudience === 'NON_SUBSCRIBED';
            const isElite = c.targetAudience === 'ELITE';
            const isSignature = c.targetAudience === 'SIGNATURE';
            const isClassic = c.targetAudience === 'CLASSIC';

            return (
              <div 
                key={c.id} 
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: isNonSub ? '1px solid rgba(16, 185, 129, 0.4)' : c.color === 'gold' ? '1px solid rgba(201, 162, 77, 0.4)' : '1px solid var(--border)',
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={`badge ${c.color === 'gold' ? 'badge-gold' : 'badge-royal'}`}>
                        {c.code}
                      </span>
                      {/* Target Audience Pill */}
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 700,
                        background: isNonSub ? 'rgba(16, 185, 129, 0.15)' : 'rgba(201, 162, 77, 0.15)',
                        color: isNonSub ? '#10B981' : 'var(--gold-dark)',
                        border: isNonSub ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(201, 162, 77, 0.3)'
                      }}>
                        {isNonSub ? '🎯 Non-Subscribed' : isElite ? '👑 Elite Only' : isSignature ? '⭐ Signature Only' : isClassic ? '🎖️ Classic Only' : '👥 All Guests'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: 'var(--primary)' }}>{c.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.subtitle}</p>
                  </div>
                  <span className={`badge ${c.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                    {c.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 14, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Outlet: <strong style={{ color: 'var(--text-main)' }}>{c.outlet}</strong></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.leftCount} / {c.totalCount} Left</span>
                    <button 
                      onClick={() => handleDeleteCoupon(c.id)}
                      title="Deactivate voucher"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        padding: 4,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 480,
            borderRadius: 20,
            padding: 28,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'var(--text-main)' }}>Create New Voucher</h3>
            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Voucher Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. C-09" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Title & Benefits</label>
                <input 
                  type="text" 
                  placeholder="e.g. 40% Chef Tasting Menu" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              {/* Target Audience / Plan Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Target Audience / Plan Tier
                </label>
                <select 
                  value={newTargetAudience} 
                  onChange={(e) => setNewTargetAudience(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                >
                  <option value="ALL">🌐 All Users (Subscribers & Non-Subscribers)</option>
                  <option value="NON_SUBSCRIBED">🎯 Non-Subscribed Guests Only</option>
                  <option value="SUBSCRIBERS_ONLY">👑 Subscribers Only (All Active VIPs)</option>
                  <option value="CLASSIC">🎖️ Classic Plan Only</option>
                  <option value="SIGNATURE">⭐ Signature Plan Only</option>
                  <option value="ELITE">👑 Elite Plan Only</option>
                </select>
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Discount Type</label>
                  <select 
                    value={newDiscountType} 
                    onChange={(e) => setNewDiscountType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="BOGO">Buy 1 Get 1 (BOGO)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Discount Value</label>
                  <input 
                    type="number" 
                    value={newDiscountValue} 
                    onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>

              {/* Branch / Outlet Selection */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Applicable Branch / Venue</label>
                <select 
                  value={newOutlet} 
                  onChange={(e) => setNewOutlet(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                >
                  <option value="All Yanki Outlets">All Yanki Outlets</option>
                  <option value="Yanki Sizzlerr Bodakdev">Yanki Sizzlerr Bodakdev</option>
                  <option value="Yanki Sizzlerr SG Highway">Yanki Sizzlerr SG Highway</option>
                  <option value="Dough by Yanki CG Road">Dough by Yanki CG Road</option>
                  <option value="House of Yanki Banquets Bopal">House of Yanki Banquets Bopal</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
                  {isSubmitting ? 'Publishing...' : 'Publish Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
