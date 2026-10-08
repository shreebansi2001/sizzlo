import React, { useState, useEffect } from 'react';
import { 
  Store, MapPin, Phone, Star, Clock, Bell, Sparkles, Plus, 
  Edit3, Trash2, X, ArrowRight, CheckCircle2, AlertCircle, Image as ImageIcon 
} from 'lucide-react';
import { Outlet } from '../types';
import { 
  fetchOutlets, fetchUpcomingOutlets, createOutlet, updateOutlet, deleteOutlet, fallbackOutlets 
} from '../api/client';

interface OutletsPageProps {
  outlets?: Outlet[];
}

export const OutletsPage: React.FC<OutletsPageProps> = ({ outlets: initialOutlets }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming'>('active');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [outletList, setOutletList] = useState<Outlet[]>(initialOutlets || fallbackOutlets);
  const [upcomingList, setUpcomingList] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Modal State for Create / Edit
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState<Partial<Outlet>>({
    name: '',
    brand: 'Yanki Sizzlerr',
    address: '',
    city: 'Ahmedabad',
    contactNumber: '+91 79 4000 8899',
    openingHours: '11:30 AM - 11:00 PM',
    rating: 4.8,
    revenueLakhs: 24.5,
    activeMembers: 180,
    averageBillValue: 1250,
    couponsRedeemed: 45,
    conceptTag: 'Signature Sizzlers & Teppanyaki',
    targetLaunchDate: 'December 2026',
    isUpcoming: false,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actives, upcomings] = await Promise.all([
        fetchOutlets(),
        fetchUpcomingOutlets()
      ]);
      if (actives && actives.length) setOutletList(actives);
      if (upcomings) setUpcomingList(upcomings);
    } catch (_) {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = (isUpcoming = false) => {
    setEditingId(null);
    setFormData({
      name: '',
      brand: 'Yanki Sizzlerr',
      address: '',
      city: 'Ahmedabad',
      contactNumber: '+91 79 4000 8899',
      openingHours: '11:30 AM - 11:00 PM',
      rating: 4.8,
      revenueLakhs: 24.5,
      activeMembers: 180,
      averageBillValue: 1250,
      couponsRedeemed: 45,
      conceptTag: isUpcoming ? 'Rooftop Dining & Smoke Lounge' : 'Signature Sizzlers & Teppanyaki',
      targetLaunchDate: 'December 2026',
      isUpcoming: isUpcoming,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (outlet: Outlet) => {
    setEditingId(outlet.id);
    setFormData({
      name: outlet.name,
      brand: outlet.brand || 'Yanki Sizzlerr',
      address: outlet.address,
      city: outlet.city,
      contactNumber: outlet.contactNumber,
      openingHours: outlet.openingHours || '11:30 AM - 11:00 PM',
      rating: outlet.rating || 4.8,
      revenueLakhs: outlet.revenueLakhs || 0,
      activeMembers: outlet.activeMembers || 0,
      averageBillValue: outlet.averageBillValue || 1250,
      couponsRedeemed: outlet.couponsRedeemed || 0,
      conceptTag: outlet.conceptTag || 'Signature Sizzlers & Teppanyaki',
      targetLaunchDate: outlet.targetLaunchDate || 'December 2026',
      isUpcoming: Boolean(outlet.isUpcoming),
      imageUrl: outlet.imageUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.address?.trim()) {
      alert('Please fill in Outlet Name and Address');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const res = await updateOutlet(editingId, formData);
        if (res.success) {
          setToastNotice(`Outlet "${formData.name}" updated successfully!`);
          setShowModal(false);
          await loadData();
        } else {
          alert(`Failed to update outlet: ${res.message}`);
        }
      } else {
        const res = await createOutlet(formData);
        if (res.success) {
          setToastNotice(`New venue "${formData.name}" published & visible in Mobile App!`);
          setShowModal(false);
          await loadData();
        } else {
          alert(`Failed to create outlet: ${res.message}`);
        }
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToastNotice(null), 4000);
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete outlet "${name}"? This will remove it from Mobile App reservation selection.`)) {
      return;
    }

    try {
      const res = await deleteOutlet(id);
      if (res.success) {
        setToastNotice(`Outlet "${name}" deleted.`);
        await loadData();
      } else {
        alert(`Failed to delete outlet: ${res.message}`);
      }
    } catch (err: any) {
      alert(`Error deleting outlet: ${err.message}`);
    } finally {
      setTimeout(() => setToastNotice(null), 4000);
    }
  };

  const brands = ['All', 'Yanki Sizzlerr', 'Dough by Yanki', 'House of Yanki'];

  const filteredActive = outletList.filter(o => {
    if (selectedBrand === 'All') return true;
    return o.brand?.toLowerCase() === selectedBrand.toLowerCase() || o.name?.toLowerCase().includes(selectedBrand.toLowerCase());
  });

  const filteredUpcoming = upcomingList.filter(o => {
    if (selectedBrand === 'All') return true;
    return o.brand?.toLowerCase() === selectedBrand.toLowerCase() || o.name?.toLowerCase().includes(selectedBrand.toLowerCase());
  });

  return (
    <div>
      {/* Toast Alert */}
      {toastNotice && (
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
          fontWeight: 700,
        }}>
          <CheckCircle2 size={16} />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>Venues &amp; Store Outlets Management</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Create and edit operational venues, contact numbers, hours, and upcoming expansion locations synced with Mobile App
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => handleOpenCreate(activeTab === 'upcoming')}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: 'var(--primary)',
              border: 'none',
              color: '#070A09',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(255, 138, 0, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Plus size={16} />
            <span>Add New Outlet</span>
          </button>
        </div>
      </div>

      {/* Tabs & Brand Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        {/* Active vs Upcoming Toggle */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'var(--surface-alt)',
          padding: 4,
          borderRadius: 12,
          border: '1px solid var(--border)',
          width: 'fit-content'
        }}>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'active' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'active' ? '#070A09' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Operational Outlets ({outletList.length})
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '8px 18px',
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'upcoming' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'upcoming' ? '#070A09' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}
          >
            Upcoming Outlets ({upcomingList.length})
          </button>
        </div>

        {/* Brand Filter Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                border: selectedBrand === b ? '1px solid var(--primary)' : '1px solid var(--border)',
                background: selectedBrand === b ? 'rgba(255, 138, 0, 0.15)' : 'var(--surface)',
                color: selectedBrand === b ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OPERATIONAL OUTLETS */}
      {activeTab === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {filteredActive.map((outlet) => (
            <div 
              key={outlet.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                      display: 'block',
                      marginBottom: 2
                    }}>
                      {outlet.brand || 'Yanki Sizzlerr'}
                    </span>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>{outlet.name}</h3>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      <MapPin size={12} />
                      {outlet.address}, {outlet.city}
                    </p>
                  </div>
                  <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill="#BF8E22" />
                    {outlet.rating || 4.8}
                  </span>
                </div>

                {/* Performance KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--surface-alt)', padding: 14, borderRadius: 14, marginBottom: 14 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Monthly Revenue</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>₹{outlet.revenueLakhs} Lakh</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Active Subscribers</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)' }}>{outlet.activeMembers}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Avg Bill Value</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>₹{outlet.averageBillValue}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Coupons Burned</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>{outlet.couponsRedeemed}</p>
                  </div>
                </div>

                {/* Timings and Phone */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 16 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {outlet.openingHours || '11:30 AM - 11:00 PM'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-main)', fontWeight: 600 }}>
                    <Phone size={12} color="var(--primary)" /> {outlet.contactNumber}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Edit / Delete */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <button
                  onClick={() => handleOpenEdit(outlet)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(232, 184, 74, 0.1)',
                    border: '1px solid rgba(232, 184, 74, 0.35)',
                    color: 'var(--gold)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Edit3 size={13} /> Edit Outlet
                </button>
                <button
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: UPCOMING OUTLETS */}
      {activeTab === 'upcoming' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
          {filteredUpcoming.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    fontSize: 10,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    background: 'var(--primary)',
                    color: '#070A09',
                    padding: '3px 9px',
                    borderRadius: 6
                  }}>
                    COMING SOON
                  </span>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>
                      Target: {item.targetLaunchDate || 'Late 2026'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: 12, color: '#10B981', fontWeight: 600, marginTop: 2 }}>
                    {item.conceptTag || 'New Concept Outlet'}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    <MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {item.address}, {item.city}
                  </p>

                  <div style={{
                    marginTop: 16,
                    padding: 10,
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

              {/* Action Buttons for upcoming */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => handleOpenEdit(item)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(232, 184, 74, 0.1)',
                    border: '1px solid rgba(232, 184, 74, 0.35)',
                    color: 'var(--gold)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: CREATE / EDIT OUTLET */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: '28px',
            maxWidth: 640,
            width: '100%',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
            position: 'relative',
            maxHeight: '92vh',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Store size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)' }}>
                  {editingId ? `Edit Venue: ${formData.name}` : 'Register New Outlet Venue'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              All venue details, contact numbers, hours, and addresses automatically synchronize with the customer VIP Mobile App.
            </p>

            <form onSubmit={handleSave}>
              {/* Type Toggle: Operational vs Upcoming */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Outlet Status Category
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isUpcoming: false }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      border: !formData.isUpcoming ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: !formData.isUpcoming ? 'rgba(255, 138, 0, 0.15)' : 'var(--surface-alt)',
                      color: !formData.isUpcoming ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Operational Venue
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isUpcoming: true }))}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 10,
                      border: formData.isUpcoming ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: formData.isUpcoming ? 'rgba(255, 138, 0, 0.15)' : 'var(--surface-alt)',
                      color: formData.isUpcoming ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer'
                    }}
                  >
                    Upcoming ("Coming Soon" Pipeline)
                  </button>
                </div>
              </div>

              {/* Outlet Name & Brand */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Outlet Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Yanki Sizzlers - SG Highway"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Brand
                  </label>
                  <select
                    value={formData.brand || 'Yanki Sizzlerr'}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  >
                    <option value="Yanki Sizzlerr">Yanki Sizzlerr</option>
                    <option value="Dough by Yanki">Dough by Yanki</option>
                    <option value="House of Yanki">House of Yanki</option>
                  </select>
                </div>
              </div>

              {/* Address & City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Full Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ground Floor, Titanium One, SG Highway"
                    value={formData.address || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city || 'Ahmedabad'}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Contact Number & Opening Hours */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Contact Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 79 4000 8899"
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    placeholder="11:30 AM - 11:00 PM"
                    value={formData.openingHours || '11:30 AM - 11:00 PM'}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingHours: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Concept Tag & Target Launch Date (if upcoming) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    Concept Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rooftop Sizzler Lounge"
                    value={formData.conceptTag || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, conceptTag: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {formData.isUpcoming ? 'Target Launch Date' : 'Rating (out of 5)'}
                  </label>
                  {formData.isUpcoming ? (
                    <input
                      type="text"
                      placeholder="e.g. December 2026"
                      value={formData.targetLaunchDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetLaunchDate: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  ) : (
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="5"
                      value={formData.rating || 4.8}
                      onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        outline: 'none',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Image URL banner */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                  Venue Photo URL
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.imageUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span>{isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Register Outlet'}</span>
                  {!isSubmitting && <ArrowRight size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
