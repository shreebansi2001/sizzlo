import React, { useState } from 'react';
import { Plus, Ticket, CheckCircle2, AlertCircle } from 'lucide-react';
import { Coupon } from '../types';

interface CouponsPageProps {
  coupons: Coupon[];
}

export const CouponsPage: React.FC<CouponsPageProps> = ({ coupons }) => {
  const [couponList, setCouponList] = useState<Coupon[]>(coupons);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newOutlet, setNewOutlet] = useState('All Yanki Outlets');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const created: Coupon = {
      id: Date.now(),
      code: newCode.toUpperCase(),
      name: newName,
      subtitle: 'Exclusive VIP privilege',
      description: 'Special coupon issued from admin portal',
      leftCount: 3,
      totalCount: 3,
      expiryDate: '31 Dec 2027',
      status: 'available',
      outlet: newOutlet,
      color: 'gold',
    };

    setCouponList([created, ...couponList]);
    setShowAddModal(false);
    setNewCode('');
    setNewName('');
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
              background: 'white',
              borderRadius: 18,
              border: c.color === 'gold' ? '1px solid rgba(232, 184, 74, 0.4)' : '1px solid var(--border)',
              padding: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
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
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.leftCount} / {c.totalCount} Remaining</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
        }}>
          <div style={{
            background: 'white',
            width: 440,
            borderRadius: 20,
            padding: 28,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Create New Voucher</h3>
            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Voucher Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. C-09" 
                  value={newCode} 
                  onChange={(e) => setNewCode(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Title & Discount</label>
                <input 
                  type="text" 
                  placeholder="e.g. 40% Chef Tasting Menu" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}
                  required
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Applicable Venue</label>
                <select 
                  value={newOutlet} 
                  onChange={(e) => setNewOutlet(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'white' }}
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
