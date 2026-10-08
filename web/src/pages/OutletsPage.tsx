import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, MapPin, Phone, Star, Clock, Bell, Sparkles, Plus, 
  Edit3, Trash2, X, ArrowRight, CheckCircle2, AlertCircle, 
  Upload, ExternalLink, Navigation, Compass, LocateFixed, Eye 
} from 'lucide-react';
import { Outlet } from '../types';
import { 
  fetchOutlets, fetchUpcomingOutlets, createOutlet, updateOutlet, 
  deleteOutlet, uploadImageFile, fallbackOutlets 
} from '../api/client';

interface OutletsPageProps {
  outlets?: Outlet[];
}

const PRESET_COORDINATES = [
  { name: 'Bodakdev, SG Highway', lat: 23.0373, lng: 72.5115, city: 'Ahmedabad' },
  { name: 'CG Road, Navrangpura', lat: 23.0350, lng: 72.5604, city: 'Ahmedabad' },
  { name: 'Vastrapur Lake, Alpha One', lat: 23.0358, lng: 72.5293, city: 'Ahmedabad' },
  { name: 'Sindhu Bhavan Road', lat: 23.0448, lng: 72.5020, city: 'Ahmedabad' },
  { name: 'Prahlad Nagar, Anand Nagar', lat: 23.0125, lng: 72.5108, city: 'Ahmedabad' },
  { name: 'Kudasan, Gandhinagar', lat: 23.1895, lng: 72.6288, city: 'Gandhinagar' },
  { name: 'Dumas Road, Surat', lat: 21.1458, lng: 72.7667, city: 'Surat' },
  { name: 'Alkapuri, Vadodara', lat: 22.3107, lng: 73.1706, city: 'Vadodara' },
];

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
    latitude: 23.0373,
    longitude: 72.5115,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Photo Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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
    setPhotoPreview(null);
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
      latitude: 23.0373,
      longitude: 72.5115,
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (outlet: Outlet) => {
    setEditingId(outlet.id);
    setPhotoPreview(outlet.imageUrl || null);
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
      latitude: outlet.latitude || 23.0373,
      longitude: outlet.longitude || 72.5115,
      imageUrl: outlet.imageUrl || '',
    });
    setShowModal(true);
  };

  // Photo Upload Handler (Local instant preview + Server API upload)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant client-side preview via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotoPreview(dataUrl);
      setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);

    // 2. Upload file to backend /api/upload
    setIsUploadingPhoto(true);
    try {
      const res = await uploadImageFile(file, 'outlet');
      if (res.success && res.url) {
        setFormData(prev => ({ ...prev, imageUrl: res.url }));
      }
    } catch (_) {}
    finally {
      setIsUploadingPhoto(false);
    }
  };

  // Detect Current Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
        setToastNotice(`Location detected: [${lat}, ${lng}]`);
        setTimeout(() => setToastNotice(null), 3500);
      },
      () => {
        alert('Could not retrieve your location. Please check browser permissions or select a preset location.');
      }
    );
  };

  const handleApplyPresetCoords = (preset: typeof PRESET_COORDINATES[0]) => {
    setFormData(prev => ({
      ...prev,
      latitude: preset.lat,
      longitude: preset.lng,
      city: preset.city,
    }));
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
          setToastNotice(`Outlet "${formData.name}" updated successfully! Coordinates: [${formData.latitude}, ${formData.longitude}]`);
          setShowModal(false);
          await loadData();
        } else {
          alert(`Failed to update outlet: ${res.message}`);
        }
      } else {
        const res = await createOutlet(formData);
        if (res.success) {
          setToastNotice(`New venue "${formData.name}" published & synced to Mobile App!`);
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
    if (!window.confirm(`Are you sure you want to delete outlet "${name}"? This will remove it from Mobile App map and reservation selection.`)) {
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

  const getMapsUrl = (outlet: Partial<Outlet>) => {
    if (outlet.latitude && outlet.longitude) {
      return `https://www.google.com/maps/search/?api=1&query=${outlet.latitude},${outlet.longitude}`;
    }
    const query = `${outlet.name || ''}, ${outlet.address || ''}, ${outlet.city || ''}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
            Manage physical dining destinations, photo banners, exact Google Maps latitude/longitude coordinates &amp; phone contacts
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
          {filteredActive.map((outlet) => (
            <div 
              key={outlet.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              {/* Photo Banner */}
              {outlet.imageUrl && (
                <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={outlet.imageUrl}
                    alt={outlet.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(7, 10, 9, 0.75)',
                    backdropFilter: 'blur(4px)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    color: 'var(--gold)',
                    fontSize: 12,
                    fontWeight: 800,
                    border: '1px solid rgba(232, 184, 74, 0.4)'
                  }}>
                    <Star size={12} fill="#BF8E22" />
                    {outlet.rating || 4.8}
                  </div>
                </div>
              )}

              <div style={{ padding: 22 }}>
                {/* Header Row */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'var(--gold)',
                    }}>
                      {outlet.brand || 'Yanki Sizzlerr'}
                    </span>
                    {outlet.latitude && outlet.longitude && (
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        📍 {outlet.latitude.toFixed(4)}, {outlet.longitude.toFixed(4)}
                      </span>
                    )}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)' }}>{outlet.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    <MapPin size={12} color="var(--primary)" />
                    {outlet.address}, {outlet.city}
                  </p>
                </div>

                {/* Google Maps Redirect Button */}
                <div style={{ marginBottom: 14 }}>
                  <a
                    href={getMapsUrl(outlet)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 10,
                      background: 'rgba(66, 133, 244, 0.1)',
                      border: '1px solid rgba(66, 133, 244, 0.35)',
                      color: '#60A5FA',
                      fontSize: 11,
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Navigation size={12} />
                    <span>Open in Google Maps</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                {/* Performance KPI Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'var(--surface-alt)', padding: 12, borderRadius: 14, marginBottom: 14 }}>
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

              {/* Action Buttons: Edit / Slot Timings / Delete */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 22px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <button
                  onClick={() => { window.location.hash = 'reservations'; }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: '#60A5FA',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  title="Configure dynamic table booking slot timings for mobile app"
                >
                  <Clock size={13} /> Slot Timings
                </button>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
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
                    {item.latitude && item.longitude && (
                      <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                      </span>
                    )}
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

                  {/* Google Maps link */}
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={getMapsUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'rgba(66, 133, 244, 0.1)',
                        border: '1px solid rgba(66, 133, 244, 0.35)',
                        color: '#60A5FA',
                        fontSize: 11,
                        fontWeight: 700,
                        textDecoration: 'none',
                      }}
                    >
                      <Navigation size={11} />
                      <span>Preview on Google Maps</span>
                      <ExternalLink size={9} />
                    </a>
                  </div>

                  <div style={{
                    marginTop: 14,
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
          background: 'rgba(0, 0, 0, 0.82)',
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
            maxWidth: 680,
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
              Venue details, uploaded banner photos, and exact Google Maps latitude/longitude coordinates automatically sync with the customer VIP Mobile App.
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
                    Full Physical Address (Used by Google Maps)
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

              {/* GOOGLE MAPS LATITUDE & LONGITUDE SECTION */}
              <div style={{
                background: 'rgba(66, 133, 244, 0.05)',
                border: '1px solid rgba(66, 133, 244, 0.25)',
                borderRadius: 16,
                padding: '16px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Compass size={16} color="#60A5FA" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Google Maps Geo-Coordinates (Redirect Pin)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background: 'rgba(66, 133, 244, 0.15)',
                        border: '1px solid rgba(66, 133, 244, 0.4)',
                        color: '#93C5FD',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <LocateFixed size={12} />
                      <span>Detect My Location</span>
                    </button>
                    {formData.latitude && formData.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '4px 10px',
                          borderRadius: 8,
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#34D399',
                          fontSize: 11,
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Eye size={12} />
                        <span>Test on Maps</span>
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Latitude (e.g. 23.0373)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="23.0373"
                      value={formData.latitude !== undefined ? formData.latitude : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
                      Longitude (e.g. 72.5115)
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      placeholder="72.5115"
                      value={formData.longitude !== undefined ? formData.longitude : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        outline: 'none',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Area Presets */}
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                    Quick Ahmedabad Location Presets:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRESET_COORDINATES.map(p => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleApplyPresetCoords(p)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-muted)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 10,
                          cursor: 'pointer'
                        }}
                      >
                        + {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* PHOTO UPLOAD BOX (File Upload Input with Live Preview) */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: '16px',
                marginBottom: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)' }}>
                    Venue Photo Upload
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {isUploadingPhoto ? 'Uploading to server...' : 'JPG, PNG, WebP (Max 10MB)'}
                  </span>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />

                {/* Photo Preview or Upload Dropzone */}
                {formData.imageUrl ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    background: 'var(--surface-alt)',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)'
                  }}>
                    <img
                      src={formData.imageUrl}
                      alt="Venue Preview"
                      style={{
                        width: 90,
                        height: 70,
                        objectFit: 'cover',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                        Photo Ready
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {formData.imageUrl.startsWith('data:') ? 'Local file uploaded' : formData.imageUrl}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'rgba(255, 138, 0, 0.15)',
                          border: '1px solid var(--primary)',
                          color: 'var(--primary)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Change Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setFormData(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed rgba(255, 138, 0, 0.4)',
                      borderRadius: 14,
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'rgba(255, 138, 0, 0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(255, 138, 0, 0.15)',
                      display: 'grid',
                      placeItems: 'center',
                      margin: '0 auto 10px'
                    }}>
                      <Upload size={20} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                      Click to Browse or Drag &amp; Drop Venue Photo
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      Supports high-resolution camera photos from your device
                    </p>
                  </div>
                )}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Operating Hours
                    </label>
                    <button
                      type="button"
                      onClick={() => { window.location.hash = 'reservations'; }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--gold)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Manage individual booking slot buttons (e.g. 12:30 PM, 8:00 PM)"
                    >
                      Manage Booking Slots ↗
                    </button>
                  </div>
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
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                    Shown on venue card in app. For table booking time buttons (e.g. 12:30 PM), configure via Host Station Bookings &gt; Manage Time Slots.
                  </p>
                </div>
              </div>

              {/* Concept Tag & Target Launch Date (if upcoming) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
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
                  disabled={isSubmitting || isUploadingPhoto}
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
