import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { Outlet } from '../types';
import { fallbackOutlets } from '../api/client';

interface OutletsPageProps {
  outlets?: Outlet[];
}

export const OutletsPage: React.FC<OutletsPageProps> = ({ outlets: initialOutlets }) => {
  const [outletList, setOutletList] = useState<Outlet[]>(initialOutlets || fallbackOutlets);

  useEffect(() => {
    axios.get('/api/admin/outlets')
      .then(res => {
        if (res.data?.success && res.data.data?.length) {
          setOutletList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Venues & Dining Locations</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Locations overview, revenue per outlet, and member satisfaction metrics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {outletList.map((outlet) => (
          <div 
            key={outlet.id}
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 24,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{outlet.name}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  <MapPin size={12} />
                  {outlet.address}, {outlet.city}
                </p>
              </div>
              <span className="badge badge-gold">
                <Star size={12} fill="#BF8E22" />
                {outlet.rating}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--surface-alt)', padding: 14, borderRadius: 14, marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Monthly Revenue</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>₹{outlet.revenueLakhs} Lakh</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Average Bill (ABV)</p>
                <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--gold-dark)' }}>₹{outlet.averageBillValue}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active Patrons</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{outlet.activeMembers}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coupons Redeemed</p>
                <p style={{ fontSize: 14, fontWeight: 700 }}>{outlet.couponsRedeemed}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
              <Phone size={13} />
              <span>Contact: {outlet.contactNumber}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
