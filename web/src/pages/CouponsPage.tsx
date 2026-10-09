import React, { useState, useEffect } from 'react';
import { Plus, Ticket, CheckCircle2, AlertCircle, Trash2, RefreshCw, X, Sparkles, Crown, Users } from 'lucide-react';
import { apiClient, fetchCoupons } from '../api/client';
import { Coupon } from '../types';

export type VoucherPlanCategory = 'ALL' | 'COMMON' | 'CLASSIC' | 'SIGNATURE' | 'ELITE' | 'NON_SUBSCRIBED';

export const getVoucherCategory = (c: Coupon): 'COMMON' | 'CLASSIC' | 'SIGNATURE' | 'ELITE' | 'NON_SUBSCRIBED' => {
  const aud = (c.targetAudience || '').toUpperCase();
  const code = (c.code || '').toUpperCase();
  const name = (c.name || '').toLowerCase();

  if (aud === 'COMMON' || aud === 'SUBSCRIBERS_ONLY' || aud === 'ALL_PLANS') return 'COMMON';
  if (aud === 'CLASSIC') return 'CLASSIC';
  if (aud === 'SIGNATURE') return 'SIGNATURE';
  if (aud === 'ELITE') return 'ELITE';
  if (aud === 'NON_SUBSCRIBED') return 'NON_SUBSCRIBED';

  if (code.includes('CPL50') || code.includes('DOUGH') || name.includes('couple') || name.includes('dough')) {
    return 'SIGNATURE';
  }
  if (code.includes('ODC') || name.includes('catering') || name.includes('banquet') || name.includes('vip pass')) {
    return 'ELITE';
  }
  if (code.includes('REG-5960') || name.includes('classic')) {
    return 'CLASSIC';
  }
  if (code.includes('10D') || code.includes('BDAY') || aud === 'ALL' || !c.vipOnly) {
    return 'COMMON';
  }

  return 'COMMON';
};

interface CouponsPageProps {
  coupons?: Coupon[];
  onRefresh?: () => void;
}

export const CouponsPage: React.FC<CouponsPageProps> = ({ coupons: initialCoupons, onRefresh }) => {
  const [couponList, setCouponList] = useState<Coupon[]>(initialCoupons || []);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('Exclusive VIP Dining privilege');
  const [newOutlet, setNewOutlet] = useState('All Yanki Outlets');
  const [newTargetCategory, setNewTargetCategory] = useState<'COMMON' | 'CLASSIC' | 'SIGNATURE' | 'ELITE' | 'NON_SUBSCRIBED'>('COMMON');
  const [newDiscountType, setNewDiscountType] = useState('PERCENTAGE');
  const [newDiscountVal, setNewDiscountVal] = useState(20);
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
  const [newTotalCount, setNewTotalCount] = useState(3);
  const [activePlanFilter, setActivePlanFilter] = useState<VoucherPlanCategory>('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationNotice, setNotificationNotice] = useState<string | null>(null);

  const fetchLiveCoupons = () => {
    setIsLoading(true);
    fetchCoupons()
      .then(coupons => {
        setCouponList(coupons);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLiveCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    setIsSubmitting(true);
    const isVip = newTargetCategory !== 'NON_SUBSCRIBED';
    const payload = {
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      subtitle: newSubtitle.trim(),
      description: `Exclusive privilege voucher issued for ${newOutlet}. Target Plan: ${newTargetCategory}.`,
      leftCount: Number(newTotalCount) || 1,
      totalCount: Number(newTotalCount) || 1,
      expiryDate: newExpiry || '2027-12-31',
      status: 'available',
      outlet: newOutlet,
      color: isVip ? 'gold' : 'royal',
      targetAudience: newTargetCategory,
      vipOnly: isVip,
      discountType: newDiscountType,
      discountValue: Number(newDiscountVal) || 0,
      termsAndConditions: '1. Non-transferable. 2. One coupon per table bill. 3. Zero points on banquet spend.'
    };

    try {
      const res = await apiClient.post('/coupons', payload);
      if (res.data?.success && res.data.data) {
        setCouponList(prev => [res.data.data, ...prev]);
      } else {
        fetchLiveCoupons();
      }
      setShowAddModal(false);
      setNewCode('');
      setNewName('');
      setNotificationNotice(`✅ Privilege Voucher "${payload.name}" published under ${newTargetCategory} category! Live synced with mobile app.`);
      setTimeout(() => setNotificationNotice(null), 5000);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to create coupon', err);
      alert('Failed to save coupon: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete and deactivate this voucher?')) return;
    try {
      await apiClient.delete(`/coupons/${id}`);
      setCouponList(prev => prev.filter(c => c.id !== id));
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to delete coupon', err);
    }
  };

  const getCategoryBadge = (category: 'COMMON' | 'CLASSIC' | 'SIGNATURE' | 'ELITE' | 'NON_SUBSCRIBED') => {
    switch (category) {
      case 'COMMON':
        return {
          label: '🌟 Common (All 3 Plans)',
          background: 'rgba(232, 184, 74, 0.15)',
          color: 'var(--gold)',
          border: '1px solid rgba(232, 184, 74, 0.4)',
        };
      case 'CLASSIC':
        return {
          label: '🥉 Classic Plan',
          background: 'rgba(223, 194, 125, 0.15)',
          color: '#DFC27D',
          border: '1px solid rgba(223, 194, 125, 0.4)',
        };
      case 'SIGNATURE':
        return {
          label: '🥈 Signature Plan',
          background: 'rgba(78, 227, 184, 0.15)',
          color: '#4EE3B8',
          border: '1px solid rgba(78, 227, 184, 0.4)',
        };
      case 'ELITE':
        return {
          label: '🥇 Elite VIP Plan',
          background: 'rgba(255, 184, 0, 0.18)',
          color: '#FFB800',
          border: '1px solid rgba(255, 184, 0, 0.5)',
        };
      case 'NON_SUBSCRIBED':
      default:
        return {
          label: '👥 All Guests / Welcome',
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#60A5FA',
          border: '1px solid rgba(59, 130, 246, 0.35)',
        };
    }
  };

  // Counts for each category
  const commonCount = couponList.filter(c => getVoucherCategory(c) === 'COMMON').length;
  const classicCount = couponList.filter(c => getVoucherCategory(c) === 'CLASSIC').length;
  const signatureCount = couponList.filter(c => getVoucherCategory(c) === 'SIGNATURE').length;
  const eliteCount = couponList.filter(c => getVoucherCategory(c) === 'ELITE').length;
  const nonSubCount = couponList.filter(c => getVoucherCategory(c) === 'NON_SUBSCRIBED').length;

  const filteredCoupons = couponList.filter(c => {
    if (activePlanFilter === 'ALL') return true;
    return getVoucherCategory(c) === activePlanFilter;
  });

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

      {/* Header and Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Privilege Vouchers &amp; Promotions</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Vouchers mapped to subscription plan tiers and universal VIP perks
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Create New Voucher
        </button>
      </div>

      {/* Subscription Plan Filter Bar */}
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'var(--surface)',
        padding: '8px 12px',
        borderRadius: 14,
        border: '1px solid var(--border)',
        marginBottom: 24,
        overflowX: 'auto',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'ALL', label: `All Vouchers (${couponList.length})` },
          { id: 'COMMON', label: `🌟 Common in All 3 Plans (${commonCount})` },
          { id: 'CLASSIC', label: `🥉 Classic Plan (${classicCount})` },
          { id: 'SIGNATURE', label: `🥈 Signature Plan (${signatureCount})` },
          { id: 'ELITE', label: `🥇 Elite VIP (${eliteCount})` },
          { id: 'NON_SUBSCRIBED', label: `👥 Non-Subscribed / All Guests (${nonSubCount})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setActivePlanFilter(f.id as any)}
            style={{
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: activePlanFilter === f.id ? 700 : 500,
              background: activePlanFilter === f.id ? 'var(--primary)' : 'transparent',
              color: activePlanFilter === f.id ? '#070A09' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid of Coupons or Zero State */}
      {filteredCoupons.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <Ticket size={40} color="var(--gold)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
            No Vouchers in this Plan Category
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 450, margin: '8px auto 20px' }}>
            There are currently no vouchers configured under the selected category. Click below to add a new voucher to this plan tier.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create Voucher
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredCoupons.map((c) => {
            const category = getVoucherCategory(c);
            const badge = getCategoryBadge(category);

            return (
              <div 
                key={c.id} 
                style={{
                  background: 'var(--surface)',
                  borderRadius: 18,
                  border: badge.border,
                  padding: 20,
                  boxShadow: 'var(--shadow-card)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge ${c.color === 'gold' ? 'badge-gold' : 'badge-orange'}`}>
                          {c.code}
                        </span>

                        {/* Plan Category Badge */}
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: 8,
                          fontSize: 10,
                          fontWeight: 800,
                          background: badge.background,
                          color: badge.color,
                          border: badge.border,
                        }}>
                          {badge.label}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 10, color: 'var(--primary)' }}>{c.name}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.subtitle}</p>
                    </div>

                    <span className={`badge ${c.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                      {(c.status || 'AVAILABLE').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 14, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Outlet: <strong style={{ color: 'var(--text-main)' }}>{c.outlet || 'All Outlets'}</strong>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>
                      {c.leftCount ?? c.totalCount ?? 1} Left
                    </span>

                    <button 
                      onClick={() => handleDeleteCoupon(c.id)}
                      title="Delete and deactivate voucher"
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
      )}

      {/* Modal: Create Voucher */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: 540,
            maxWidth: '100%',
            borderRadius: 20,
            padding: 28,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Issue Privilege Dining Voucher</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Instantly synched to VIP subscriber wallets</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              {/* Plan Tier Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--gold)' }}>
                  Subscription Plan Tier / Category *
                </label>
                <select 
                  value={newTargetCategory} 
                  onChange={(e) => setNewTargetCategory(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--gold)', background: 'var(--surface-alt)', color: '#FFF' }}
                >
                  <option value="COMMON">🌟 Common in All 3 Plans (Classic, Signature, Elite)</option>
                  <option value="CLASSIC">🥉 Classic Plan Only</option>
                  <option value="SIGNATURE">🥈 Signature Plan Only</option>
                  <option value="ELITE">🥇 Elite VIP Plan Only</option>
                  <option value="NON_SUBSCRIBED">👥 All Guests / Non-Subscribed Only</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Voucher Code
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. VIP-SIZZLE50" 
                    value={newCode} 
                    onChange={(e) => setNewCode(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Usage Limit
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={newTotalCount} 
                    onChange={(e) => setNewTotalCount(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Offer Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Complimentary Sizzler Platter on Dine-In" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Subtitle / Condition
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Valid on food bill above ₹1,200 at all venues" 
                  value={newSubtitle} 
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  required
                />
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Discount Type
                  </label>
                  <select 
                    value={newDiscountType} 
                    onChange={(e) => setNewDiscountType(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FLAT_OFF">Flat Rupees (₹) Off</option>
                    <option value="COMPLIMENTARY">100% Complimentary Dish</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Discount Value ({newDiscountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={newDiscountVal} 
                    onChange={(e) => setNewDiscountVal(Number(e.target.value))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  />
                </div>
              </div>

              {/* Applicable Venue & Expiry Date */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Applicable Outlet
                  </label>
                  <select 
                    value={newOutlet} 
                    onChange={(e) => setNewOutlet(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  >
                    <option value="All Yanki Outlets">All Yanki Outlets</option>
                    <option value="Yanki Sizzlers - Bodakdev">Yanki Sizzlers - Bodakdev</option>
                    <option value="Dough by Yanki - CG Road">Dough by Yanki - CG Road</option>
                    <option value="Yanki Sizzlers - Vastrapur">Yanki Sizzlers - Vastrapur</option>
                    <option value="Yanki Banquet & ODC">Yanki Banquet & ODC</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                    Expiry Date
                  </label>
                  <input 
                    type="date" 
                    value={newExpiry} 
                    onChange={(e) => setNewExpiry(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: '#FFF' }}
                  />
                </div>
              </div>

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
                >
                  {isSubmitting ? 'Publishing...' : 'Publish & Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
