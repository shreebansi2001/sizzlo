import React, { useState, useEffect } from 'react';
import { Plus, Ticket, CheckCircle2, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import { apiClient, fetchCoupons } from '../api/client';
import { Coupon } from '../types';

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
  const [newTotalCount, setNewTotalCount] = useState(3);
  const [newDiscountType, setNewDiscountType] = useState('PERCENTAGE');
  const [newDiscountVal, setNewDiscountVal] = useState(20);
  const [newExpiry, setNewExpiry] = useState('2027-12-31');
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
    const payload = {
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      subtitle: newSubtitle.trim(),
      description: `Exclusive privilege voucher issued from management desk for ${newOutlet}.`,
      leftCount: Number(newTotalCount) || 1,
      totalCount: Number(newTotalCount) || 1,
      expiryDate: newExpiry || '2027-12-31',
      status: 'available',
      outlet: newOutlet,
      color: 'gold',
      discountType: newDiscountType,
      discountValue: Number(newDiscountVal) || 0,
      termsAndConditions: '1. Non-transferable. 2. One coupon per bill. 3. Zero points on banquet spend.'
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
      setNotificationNotice(`✅ Privilege Voucher "${payload.name}" published! Live synced with Sizzlo mobile app & notification broadcasted.`);
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Privilege Vouchers & Promotions</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure dining benefits, complimentary treats, and banquet incentives</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          Create New Voucher
        </button>
      </div>

      {/* Grid of Coupons or Zero State */}
      {couponList.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          borderRadius: 20,
          border: '1px solid var(--border)',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <Ticket size={40} color="var(--gold)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
            No Privilege Vouchers Active
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 450, margin: '8px auto 20px' }}>
            There are currently no dining privilege vouchers in the catalog. Create a voucher here and it will instantly sync to the Sizzlo mobile app!
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Create First Voucher
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {couponList.map((c) => (
            <div 
              key={c.id} 
              style={{
                background: 'var(--surface)',
                borderRadius: 18,
                border: c.color === 'gold' ? '1px solid rgba(201, 162, 77, 0.4)' : '1px solid var(--border)',
                padding: 20,
                boxShadow: 'var(--shadow-card)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span className={`badge ${c.color === 'gold' ? 'badge-gold' : 'badge-orange'}`}>
                    {c.code}
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 8, color: 'var(--primary)' }}>{c.name}</h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.subtitle}</p>
                </div>
                <span className={`badge ${c.status === 'available' ? 'badge-success' : 'badge-danger'}`}>
                  {(c.status || 'AVAILABLE').toUpperCase()}
                </span>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 14, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>Outlet: <strong style={{ color: 'var(--text-main)' }}>{c.outlet || 'All Outlets'}</strong></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{c.leftCount ?? c.totalCount ?? 1} Left</span>
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
          ))}
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            width: '100%',
            maxWidth: 500,
            borderRadius: 24,
            padding: 30,
            border: '1px solid rgba(201, 162, 77, 0.4)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, color: 'var(--primary)' }}>
              Create VIP Privilege Voucher
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Published vouchers immediately sync to the Sizzlo mobile app wallet and dispatch push alerts.
            </p>

            <form onSubmit={handleCreateCoupon}>
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
                    Usage Count
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
