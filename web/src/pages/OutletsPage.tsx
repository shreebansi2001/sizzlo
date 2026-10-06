import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Star, Clock, Bell, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Outlet } from '../types';
import { fallbackOutlets } from '../api/client';

interface OutletsPageProps {
  outlets?: Outlet[];
}

export const OutletsPage: React.FC<OutletsPageProps> = ({ outlets: initialOutlets }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');
  const [outletList, setOutletList] = useState<Outlet[]>(initialOutlets || fallbackOutlets);
  const [upcomingList, setUpcomingList] = useState<any[]>([]);

  useEffect(() => {
    axios.get('/api/admin/outlets')
      .then(res => {
        if (res.data?.success && res.data.data?.length) {
          setOutletList(res.data.data);
        }
      })
      .catch(() => {});

    axios.get('/api/outlets/upcoming')
      .then(res => {
        if (res.data?.success && res.data.data?.length) {
          setUpcomingList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>Venues &amp; Store Expansion Pipeline</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            SRS Chapter 05: Operational Outlets &amp; Western India Expansion Directory
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: 6,
          background: 'var(--surface)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'active' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'active' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            Operational Outlets ({outletList.length})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'upcoming' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'upcoming' ? '#070A09' : 'var(--text-muted)'
            }}
          >
            Upcoming Outlets ({upcomingList.length})
          </button>
        </div>
      </div>

      {activeTab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
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
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active Subscribers</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>{outlet.activeMembers}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg Bill Value</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>₹{outlet.averageBillValue}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coupons Burned</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#10B981' }}>{outlet.couponsRedeemed}</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                  <Clock size={12} /> 11:30 AM - 11:00 PM
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                  <Phone size={12} /> {outlet.contactNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {upcomingList.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)'
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    background: 'var(--primary)',
                    color: '#070A09',
                    padding: '2px 8px',
                    borderRadius: 6
                  }}>
                    COMING SOON
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {item.targetLaunchDate}
                  </span>
                </div>

                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600, marginTop: 2 }}>
                  {item.conceptTag}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                  {item.address}, {item.city}
                </p>

                <div style={{
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 12,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Bell size={14} color="var(--primary)" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Launch Subscribers</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                    {item.subscribersCount || 142}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
