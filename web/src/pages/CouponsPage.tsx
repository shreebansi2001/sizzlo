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
  const [newTotalCount, setNewTotalCount] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const payload = {
      code: newCode.toUpperCase().trim(),
      name: newName.trim(),
      subtitle: newSubtitle.trim(),
      description: `Exclusive privilege voucher issued from management desk for ${newOutlet}.`,
      leftCount: newTotalCount,
      totalCount: newTotalCount,
      expiryDate: '2027-12-31',
      status: 'available',
      outlet: newOutlet,
      color: 'gold',
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

      {/* Grid of Coupons */}
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
                <span className={`badge ${c.color === 'gold' ? 'badge-gold' : 'badge-royal'}`}>
                  {c.code}
                </span>
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
        ))}
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
            width: 440,
            borderRadius: 20,
            padding: 28,
            border: '1px solid var(--border)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
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
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Title & Discount</label>
                <input 
                  type="text" 
                  placeholder="e.g. 40% Chef Tasting Menu" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Applicable Venue</label>
                <select 
                  value={newOutlet} 
                  onChange={(e) => setNewOutlet(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-alt)', color: 'var(--text-main)' }}
                >
                  <option value="All Yanki Outlets">All Yanki Outlets</option>
                  <option value="Yanki Signature">Yanki Signature</option>
                  <option value="Dough by Yanki">Dough by Yanki</option>
                  <option value="Yanki Banquet">Yanki Banquet</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Publish Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
