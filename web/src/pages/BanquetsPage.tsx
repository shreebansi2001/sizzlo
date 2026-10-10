import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, IndianRupee, Clock, Sparkles, Plus, 
  Edit3, Trash2, X, CheckCircle2, AlertCircle, Search, 
  MapPin, ShieldAlert, Check, RefreshCw, Layers, Award
} from 'lucide-react';
import { BanquetHall } from '../types';
import { 
  fetchBanquetHalls, createBanquetHall, updateBanquetHall, 
  deleteBanquetHall, fetchOutlets 
} from '../api/client';

const PRESET_AMENITIES = [
  'Grand Stage & Podium',
  '4K Projector & AV System',
  'Centrally Air-Conditioned',
  'DJ Sound & Ambient Lighting',
  'Bridal & VIP Green Room',
  'Dedicated Live Sizzler Buffet Counter',
  'Valet Parking Available',
  'Open-Air Terrace Lawn',
  'Complimentary High-Speed WiFi',
  'Custom Floral & Theme Decor Setup'
];

const PRESET_HALL_PHOTOS = [
  { label: 'Grand Ballroom', url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Terrace Lawn', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80' },
  { label: 'Celebration Hall', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=800&q=80' },
  { label: 'Banquet Lounge', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
];

export const BanquetsPage: React.FC = () => {
  const [halls, setHalls] = useState<BanquetHall[]>([]);
  const [outletsList, setOutletsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirm State
  const [hallToDelete, setHallToDelete] = useState<BanquetHall | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<BanquetHall>>({
    name: '',
    outletName: 'House of Yanki Banquets Bopal',
    minCapacity: 50,
    maxCapacity: 250,
    ratePerPlate: 950,
    slotRentalPrice: 45000,
    supportedSessions: 'Morning,Evening',
    amenities: 'Grand Stage & Podium,Centrally Air-Conditioned,Valet Parking Available',
    status: 'Active',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedHalls, fetchedOutlets] = await Promise.all([
        fetchBanquetHalls(),
        fetchOutlets()
      ]);
      setHalls(fetchedHalls || []);
      
      const outletNames = new Set<string>();
      if (fetchedOutlets && fetchedOutlets.length > 0) {
        fetchedOutlets.forEach(o => {
          if (o.name) outletNames.add(o.name);
        });
      }
      // Ensure key outlets exist
      outletNames.add('House of Yanki Banquets Bopal');
      outletNames.add('Yanki Sizzlerr SG Highway');
      outletNames.add('Yanki Sizzlerr Bodakdev');
      outletNames.add('Dough by Yanki CG Road');
      setOutletsList(Array.from(outletNames));
    } catch (err) {
      console.error('Failed to load banquet halls', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      outletName: outletsList[0] || 'House of Yanki Banquets Bopal',
      minCapacity: 50,
      maxCapacity: 250,
      ratePerPlate: 950,
      slotRentalPrice: 45000,
      supportedSessions: 'Morning,Evening',
      amenities: 'Grand Stage & Podium,Centrally Air-Conditioned,Valet Parking Available',
      status: 'Active',
      imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (hall: BanquetHall) => {
    setEditingId(hall.id);
    setFormData({
      name: hall.name,
      outletName: hall.outletName,
      minCapacity: hall.minCapacity,
      maxCapacity: hall.maxCapacity,
      ratePerPlate: hall.ratePerPlate,
      slotRentalPrice: hall.slotRentalPrice,
      supportedSessions: hall.supportedSessions || 'Morning,Evening',
      amenities: hall.amenities || '',
      status: hall.status || 'Active',
      imageUrl: hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'
    });
    setShowModal(true);
  };

  const handleToggleAmenity = (amenity: string) => {
    const currentList = formData.amenities 
      ? formData.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    let updated: string[];
    if (currentList.includes(amenity)) {
      updated = currentList.filter(a => a !== amenity);
    } else {
      updated = [...currentList, amenity];
    }
    setFormData(prev => ({ ...prev, amenities: updated.join(',') }));
  };

  const handleToggleSession = (session: string) => {
    const currentSessions = formData.supportedSessions
      ? formData.supportedSessions.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    let updated: string[];
    if (currentSessions.includes(session)) {
      if (currentSessions.length === 1) return; // Keep at least one
      updated = currentSessions.filter(s => s !== session);
    } else {
      updated = [...currentSessions, session];
    }
    setFormData(prev => ({ ...prev, supportedSessions: updated.join(',') }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Please specify the hall name');
      return;
    }
    if (!formData.outletName?.trim()) {
      showToast('Please select an associated outlet');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateBanquetHall(editingId, formData);
        setHalls(prev => prev.map(h => (String(h.id) === String(editingId) ? updated : h)));
        showToast(`Banquet hall "${updated.name}" updated successfully!`);
      } else {
        const created = await createBanquetHall(formData);
        setHalls(prev => [created, ...prev]);
        showToast(`New banquet hall "${created.name}" created and synced with App!`);
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      showToast('Failed to save banquet hall. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!hallToDelete) return;
    try {
      await deleteBanquetHall(hallToDelete.id);
      setHalls(prev => prev.filter(h => h.id !== hallToDelete.id));
      showToast(`Banquet hall "${hallToDelete.name}" removed successfully.`);
      setHallToDelete(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete banquet hall.');
    }
  };

  const handleQuickStatusToggle = async (hall: BanquetHall) => {
    const newStatus = hall.status === 'Active' ? 'Maintenance' : 'Active';
    try {
      const updated = await updateBanquetHall(hall.id, { ...hall, status: newStatus as any });
      setHalls(prev => prev.map(h => h.id === hall.id ? updated : h));
      showToast(`Status of "${hall.name}" changed to ${newStatus}`);
    } catch (_) {
      showToast('Failed to update status');
    }
  };

  // Filtered Halls
  const filteredHalls = halls.filter(hall => {
    if (selectedOutlet !== 'ALL' && hall.outletName !== selectedOutlet) return false;
    if (selectedStatus !== 'ALL' && hall.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = hall.name.toLowerCase().includes(q);
      const matchOutlet = hall.outletName.toLowerCase().includes(q);
      const matchAmenities = (hall.amenities || '').toLowerCase().includes(q);
      return matchName || matchOutlet || matchAmenities;
    }
    return true;
  });

  // KPI Calculations
  const totalHalls = halls.length;
  const activeHalls = halls.filter(h => h.status === 'Active').length;
  const maxPaxCapacity = halls.reduce((sum, h) => sum + (h.maxCapacity || 0), 0);
  const avgPlateRate = halls.length > 0 
    ? Math.round(halls.reduce((sum, h) => sum + (h.ratePerPlate || 0), 0) / halls.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 99999,
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: 12,
          fontWeight: 600,
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(201,162,77,0.12) 0%, rgba(13,20,16,0.85) 100%)', border: '1px solid rgba(201,162,77,0.3)' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Banquet Halls</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(201,162,77,0.15)', color: 'var(--gold)' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            {totalHalls}
          </div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>● {activeHalls} Active for Inquiries</span>
          </div>
        </div>

        <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(16,185,129,0.1) 0%, rgba(13,20,16,0.85) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Max Combined Capacity</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            {maxPaxCapacity.toLocaleString()} Pax
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Across all operational halls
          </div>
        </div>

        <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(59,130,246,0.1) 0%, rgba(13,20,16,0.85) 100%)', border: '1px solid rgba(59,130,246,0.25)' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Avg Starting Plate Rate</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
            ₹{avgPlateRate}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Standard multi-course catering
          </div>
        </div>

        <div className="card p-5" style={{ background: 'linear-gradient(145deg, rgba(239,68,68,0.1) 0%, rgba(13,20,16,0.85) 100%)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, color: '#FCA5A5', fontWeight: 600 }}>Compliance Rule 10.3</span>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#FECACA' }}>
            0 Points on Banquets
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            Event billing is exempt from loyalty points accrual across all apps.
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Add Button */}
      <div className="card p-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search hall name, outlet, or amenities..."
              className="input"
              style={{ paddingLeft: 36, width: '100%', fontSize: 13 }}
            />
          </div>

          {/* Outlet Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={15} color="var(--gold)" />
            <select 
              value={selectedOutlet}
              onChange={e => setSelectedOutlet(e.target.value)}
              className="input"
              style={{ fontSize: 13, minWidth: 200 }}
            >
              <option value="ALL">All Outlets & Branches</option>
              {outletsList.map(out => (
                <option key={out} value={out}>{out}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="input"
            style={{ fontSize: 13, minWidth: 140 }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button 
            onClick={loadData}
            title="Refresh Data"
            className="btn btn-outline"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Add New Banquet Hall Button */}
        <button 
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 18px',
            fontWeight: 700,
            fontSize: 13,
            boxShadow: '0 4px 14px rgba(201, 162, 77, 0.35)'
          }}
        >
          <Plus size={16} />
          <span>+ Add Banquet Hall</span>
        </button>
      </div>

      {/* Banquet Halls Grid */}
      {filteredHalls.length === 0 ? (
        <div className="card p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <Building2 size={48} color="var(--gold)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
            No Banquet Halls Found
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto 20px' }}>
            {searchQuery || selectedOutlet !== 'ALL' || selectedStatus !== 'ALL' 
              ? 'No banquet halls matched your current filters. Try resetting your search query or outlet filter.'
              : 'No banquet halls configured yet. Click the button below to add your first banquet hall and make it visible in the mobile app!'}
          </p>
          <button 
            onClick={handleOpenAdd}
            className="btn btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={15} />
            <span>Add First Banquet Hall</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHalls.map(hall => {
            const amenitiesList = hall.amenities ? hall.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
            const sessionsList = hall.supportedSessions ? hall.supportedSessions.split(',').map(s => s.trim()).filter(Boolean) : [];
            const isMaintenance = hall.status === 'Maintenance';
            const isActive = hall.status === 'Active';

            return (
              <div 
                key={hall.id}
                className="card overflow-hidden transition-all duration-300"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: isActive ? '1px solid rgba(201, 162, 77, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'linear-gradient(180deg, rgba(20,28,24,0.95) 0%, rgba(13,18,15,0.98) 100%)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  position: 'relative'
                }}
              >
                {/* Cover Image & Overlay Badges */}
                <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
                  <img 
                    src={hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'} 
                    alt={hall.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)'
                  }} />

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: isActive ? 'rgba(16, 185, 129, 0.9)' : isMaintenance ? 'rgba(245, 158, 11, 0.9)' : 'rgba(107, 114, 128, 0.9)',
                    color: '#FFFFFF',
                    backdropFilter: 'blur(6px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FFFFFF' }} />
                    {hall.status || 'Active'}
                  </div>

                  {/* Dynamic Mobile App Indicator */}
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    background: 'rgba(5, 8, 7, 0.75)',
                    border: '1px solid var(--border)',
                    color: 'var(--gold)',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Sparkles size={11} />
                    <span>Live in Mobile App</span>
                  </div>

                  {/* Name & Outlet on Image Bottom */}
                  <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.2,
                      marginBottom: 4,
                      textShadow: '0 2px 8px rgba(0,0,0,0.8)'
                    }}>
                      {hall.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--gold)', fontSize: 12, fontWeight: 600 }}>
                      <MapPin size={12} />
                      <span className="truncate">{hall.outletName}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between" style={{ gap: 16 }}>
                  {/* Capacity & Price Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <Users size={12} color="var(--gold)" />
                        <span>Pax Capacity</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                        {hall.minCapacity} – {hall.maxCapacity} Guests
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                        <IndianRupee size={12} color="#10B981" />
                        <span>Plate Rate</span>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#10B981' }}>
                        ₹{hall.ratePerPlate?.toLocaleString()} <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>/ pax</span>
                      </div>
                    </div>
                  </div>

                  {/* Slot Rental & Sessions */}
                  <div style={{
                    background: 'rgba(201, 162, 77, 0.05)',
                    border: '1px solid rgba(201, 162, 77, 0.15)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Slot Rental: </span>
                      <strong style={{ color: 'var(--gold)' }}>₹{(hall.slotRentalPrice || 0).toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {sessionsList.map(s => (
                        <span 
                          key={s} 
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.08)',
                            color: 'var(--text-main)',
                            fontWeight: 600
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Layers size={11} color="var(--gold)" />
                      <span>Features & Amenities:</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {amenitiesList.slice(0, 4).map((amenity, idx) => (
                        <span 
                          key={idx}
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-muted)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          <Check size={10} color="#10B981" />
                          <span>{amenity}</span>
                        </span>
                      ))}
                      {amenitiesList.length > 4 && (
                        <span style={{ fontSize: 10, color: 'var(--gold)', alignSelf: 'center', fontWeight: 600 }}>
                          +{amenitiesList.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                    <button 
                      onClick={() => handleOpenEdit(hall)}
                      className="btn btn-outline"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit Details</span>
                    </button>

                    <button 
                      onClick={() => handleQuickStatusToggle(hall)}
                      title={isActive ? 'Mark for Maintenance' : 'Set as Active'}
                      className="btn btn-outline"
                      style={{
                        padding: '8px 10px',
                        fontSize: 11,
                        color: isActive ? '#F59E0B' : '#10B981',
                        borderColor: isActive ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'
                      }}
                    >
                      {isActive ? 'Pause' : 'Activate'}
                    </button>

                    <button 
                      onClick={() => setHallToDelete(hall)}
                      title="Delete Hall"
                      className="btn btn-outline"
                      style={{
                        padding: '8px 10px',
                        color: '#EF4444',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Banquet Hall Modal */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => !isSubmitting && setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 7, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(155deg, #18231E 0%, #0F1613 100%)',
              border: '1px solid rgba(201, 162, 77, 0.4)',
              borderRadius: 20,
              maxWidth: 680,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px 24px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.85)',
              position: 'relative'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--text-main)' }}>
                  {editingId ? 'Edit Banquet Hall' : 'Add New Banquet Hall'}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Configure hall details, Pax capacities, pricing tariffs, and live mobile app exposure.
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                disabled={isSubmitting}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hall Name & Associated Outlet */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Hall Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Imperial Grand Ballroom"
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontSize: 12 }}>Associated Branch / Outlet *</label>
                  <select
                    required
                    value={formData.outletName || ''}
                    onChange={e => setFormData({ ...formData, outletName: e.target.value })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  >
                    {outletsList.map(out => (
                      <option key={out} value={out}>{out}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min Pax & Max Pax */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Minimum Capacity (Pax) *</label>
                  <input 
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={formData.minCapacity || 50}
                    onChange={e => setFormData({ ...formData, minCapacity: Number(e.target.value) })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontSize: 12 }}>Maximum Capacity (Pax) *</label>
                  <input 
                    type="number"
                    min="20"
                    max="10000"
                    required
                    value={formData.maxCapacity || 250}
                    onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Plate Rate & Slot Rental */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Starting Rate Per Plate (₹) *</label>
                  <input 
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={formData.ratePerPlate || 950}
                    onChange={e => setFormData({ ...formData, ratePerPlate: Number(e.target.value) })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>

                <div>
                  <label className="label" style={{ fontSize: 12 }}>Slot Rental Charge (₹) *</label>
                  <input 
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.slotRentalPrice || 35000}
                    onChange={e => setFormData({ ...formData, slotRentalPrice: Number(e.target.value) })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Supported Sessions */}
              <div>
                <label className="label" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                  Supported Shift Sessions *
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Morning', 'Evening', 'Full Day'].map(sess => {
                    const isSelected = (formData.supportedSessions || '').includes(sess);
                    return (
                      <button
                        type="button"
                        key={sess}
                        onClick={() => handleToggleSession(sess)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: isSelected ? '1px solid var(--gold)' : '1px solid var(--border)',
                          background: isSelected ? 'rgba(201, 162, 77, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: isSelected ? 'var(--gold)' : 'var(--text-muted)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSelected ? '✓ ' : ''}{sess}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities Selection */}
              <div>
                <label className="label" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
                  Hall Amenities & Features
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {PRESET_AMENITIES.map(amenity => {
                    const active = (formData.amenities || '').includes(amenity);
                    return (
                      <button
                        type="button"
                        key={amenity}
                        onClick={() => handleToggleAmenity(amenity)}
                        style={{
                          fontSize: 11,
                          padding: '5px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          border: active ? '1px solid #10B981' : '1px solid var(--border)',
                          background: active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                          color: active ? '#10B981' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        {active && <Check size={10} />}
                        <span>{amenity}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status & Photo URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label" style={{ fontSize: 12 }}>Status *</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  >
                    <option value="Active">Active (Accepting Bookings)</option>
                    <option value="Maintenance">Maintenance / Renovation</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="label" style={{ fontSize: 12 }}>Cover Image URL</label>
                  <input 
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="input w-full"
                    style={{ fontSize: 13 }}
                  />
                </div>
              </div>

              {/* Preset Image Chooser */}
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Quick preset photos:</span>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {PRESET_HALL_PHOTOS.map(p => (
                    <button
                      type="button"
                      key={p.label}
                      onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                      style={{
                        fontSize: 10,
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: formData.imageUrl === p.url ? 'rgba(201, 162, 77, 0.3)' : 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border)',
                        color: formData.imageUrl === p.url ? 'var(--gold)' : 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compliance Notice */}
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 11,
                color: '#FECACA'
              }}>
                <ShieldAlert size={16} color="#EF4444" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Banquet Master Rule:</strong> Banquet reservations in this hall will be presented dynamically to mobile app users. Per loyalty governance, banquet orders do not accrue points.
                </span>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '11px', fontSize: 13, fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '11px', fontSize: 13, fontWeight: 700 }}
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update Banquet Hall' : 'Create Banquet Hall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {hallToDelete && (
        <div 
          className="modal-overlay" 
          onClick={() => setHallToDelete(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 8, 7, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(155deg, #18231E 0%, #0F1613 100%)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 20,
              maxWidth: 440,
              width: '100%',
              padding: '28px 24px',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1.5px solid rgba(239, 68, 68, 0.5)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              color: '#EF4444'
            }}>
              <Trash2 size={24} />
            </div>

            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
              Delete Banquet Hall?
            </h3>

            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>"{hallToDelete.name}"</strong>? It will no longer be available for customer event inquiries in the mobile app.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setHallToDelete(null)}
                className="btn btn-outline"
                style={{ flex: 1, padding: '10px', fontSize: 13, fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                  border: '1px solid #EF4444',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Yes, Delete Hall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
