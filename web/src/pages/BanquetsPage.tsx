import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, IndianRupee, Clock, Sparkles, Plus, 
  Edit3, Trash2, X, CheckCircle2, AlertCircle, Search, 
  MapPin, ShieldAlert, Check, RefreshCw, Layers, Award,
  MessageCircle, Calendar, Phone, ArrowUpRight, ClipboardList
} from 'lucide-react';
import { BanquetHall } from '../types';
import { 
  fetchBanquetHalls, createBanquetHall, updateBanquetHall, 
  deleteBanquetHall, fetchOutlets, fetchBanquetLeads,
  updateBanquetLeadStatus, assignBanquetLead, createBanquetInquiry, BanquetLeadDTO
} from '../api/client';

export const BANQUET_OCCASION_TYPES = [
  { id: 'Birthday Bash', label: 'Birthday Bash', icon: '🎂', color: '#E8B84A', bg: 'rgba(232, 184, 74, 0.12)', border: 'rgba(232, 184, 74, 0.3)' },
  { id: 'Wedding Reception', label: 'Wedding Reception', icon: '💍', color: '#F472B6', bg: 'rgba(244, 114, 182, 0.12)', border: 'rgba(244, 114, 182, 0.3)' },
  { id: 'Sangeet / Engagement', label: 'Sangeet / Engagement', icon: '💃', color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.3)' },
  { id: 'Corporate Seminar', label: 'Corporate Seminar', icon: '💼', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.3)' },
  { id: 'Anniversary Gala', label: 'Anniversary Gala', icon: '🥂', color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)', border: 'rgba(52, 211, 153, 0.3)' },
  { id: 'Social Gathering', label: 'Social Gathering', icon: '🎉', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  { id: 'Other', label: 'Other', icon: '✨', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.3)' },
];

export function parseOccasion(category: string = '') {
  const lower = category.toLowerCase();
  if (lower.includes('birthday')) return BANQUET_OCCASION_TYPES[0];
  if (lower.includes('wedding')) return BANQUET_OCCASION_TYPES[1];
  if (lower.includes('sangeet') || lower.includes('engagement')) return BANQUET_OCCASION_TYPES[2];
  if (lower.includes('corporate') || lower.includes('seminar')) return BANQUET_OCCASION_TYPES[3];
  if (lower.includes('anniversary')) return BANQUET_OCCASION_TYPES[4];
  if (lower.includes('social') || lower.includes('gathering')) return BANQUET_OCCASION_TYPES[5];
  if (lower.includes('odc') || lower.includes('catering') || lower.includes('outdoor')) {
    return { id: 'Outdoor Catering', label: 'Outdoor Catering (ODC)', icon: '🍽️', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' };
  }
  return BANQUET_OCCASION_TYPES[6];
}

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
  const [activeTab, setActiveTab] = useState<'halls' | 'leads'>('halls');
  const [halls, setHalls] = useState<BanquetHall[]>([]);
  const [leads, setLeads] = useState<BanquetLeadDTO[]>([]);
  const [outletsList, setOutletsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal State (Halls)
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal State (Walk-in Inquiry)
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquiryFormData, setInquiryFormData] = useState({
    customerName: '',
    customerMobile: '',
    email: '',
    selectedOccasion: 'Birthday Bash',
    customOccasion: '',
    eventDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    eventShift: 'Dinner',
    estimatedPax: 75,
    customRequirements: ''
  });

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

  const handleCreateInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryFormData.customerName.trim() || !inquiryFormData.customerMobile.trim()) {
      showToast('Please provide guest name and mobile number');
      return;
    }
    setIsSubmittingInquiry(true);
    try {
      const occasionName = (inquiryFormData.selectedOccasion === 'Other' && inquiryFormData.customOccasion.trim())
        ? inquiryFormData.customOccasion.trim()
        : inquiryFormData.selectedOccasion;
      
      const payload = {
        customerName: inquiryFormData.customerName.trim(),
        customerMobile: inquiryFormData.customerMobile.trim().startsWith('+91')
          ? inquiryFormData.customerMobile.trim()
          : `+91 ${inquiryFormData.customerMobile.trim().replace(/^91/, '')}`,
        email: inquiryFormData.email.trim() || undefined,
        eventCategory: `Banquet: ${occasionName}`,
        eventDate: inquiryFormData.eventDate,
        eventShift: inquiryFormData.eventShift,
        estimatedPax: Number(inquiryFormData.estimatedPax) || 50,
        customRequirements: inquiryFormData.customRequirements.trim() || undefined
      };

      await createBanquetInquiry(payload);
      showToast(`Inquiry for "${occasionName}" recorded! Live WhatsApp update dispatched.`);
      setShowInquiryModal(false);
      setInquiryFormData({
        customerName: '',
        customerMobile: '',
        email: '',
        selectedOccasion: 'Birthday Bash',
        customOccasion: '',
        eventDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        eventShift: 'Dinner',
        estimatedPax: 75,
        customRequirements: ''
      });
      await loadData();
    } catch (err: any) {
      showToast(`Failed to log inquiry: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedHalls, fetchedOutlets, fetchedLeads] = await Promise.all([
        fetchBanquetHalls(),
        fetchOutlets(),
        fetchBanquetLeads().catch(() => [])
      ]);
      setHalls(fetchedHalls || []);
      setLeads(fetchedLeads || []);
      
      const outletNames = new Set<string>();
      if (fetchedOutlets && fetchedOutlets.length > 0) {
        fetchedOutlets.forEach(o => {
          if (o.name) outletNames.add(o.name);
        });
      }
      outletNames.add('House of Yanki Banquets Bopal');
      outletNames.add('Yanki Sizzlerr SG Highway');
      outletNames.add('Yanki Sizzlerr Bodakdev');
      outletNames.add('Dough by Yanki CG Road');
      setOutletsList(Array.from(outletNames));
    } catch (err) {
      console.error('Failed to load banquet data', err);
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
      if (currentSessions.length === 1) return;
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

  const handleLeadStatusChange = async (leadId: number, newStatus: string) => {
    try {
      await updateBanquetLeadStatus(leadId, newStatus);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      showToast(`Lead #${leadId} status updated to ${newStatus}!`);
    } catch (_) {
      showToast('Failed to update lead status');
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

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (leadStatusFilter !== 'ALL' && l.status !== leadStatusFilter) return false;
    if (selectedOccasionFilter !== 'ALL') {
      const parsed = parseOccasion(l.eventCategory);
      if (parsed.id !== selectedOccasionFilter && !l.eventCategory.toLowerCase().includes(selectedOccasionFilter.toLowerCase())) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.customerName.toLowerCase().includes(q) ||
        l.customerMobile.includes(q) ||
        l.eventCategory.toLowerCase().includes(q)
      );
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
  const newLeadsCount = leads.filter(l => l.status === 'NEW').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

      {/* Hero Stats Header - 4 Column Responsive Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 16
      }}>
        {/* KPI 1 */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(20, 28, 24, 0.95) 0%, rgba(13, 18, 15, 0.98) 100%)',
          border: '1px solid rgba(201, 162, 77, 0.25)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 120
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Total Banquet Halls</span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(201, 162, 77, 0.15)',
              border: '1px solid rgba(201, 162, 77, 0.3)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--gold)',
              flexShrink: 0
            }}>
              <Building2 size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
              {totalHalls}
            </div>
            <div style={{ fontSize: 11, color: '#10B981', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
              <span>● {activeHalls} Active for Inquiries</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(20, 28, 24, 0.95) 0%, rgba(13, 18, 15, 0.98) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 120
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Combined Max Capacity</span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'grid',
              placeItems: 'center',
              color: '#10B981',
              flexShrink: 0
            }}>
              <Users size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
              {maxPaxCapacity.toLocaleString()} Pax
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Across all group operational halls
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(20, 28, 24, 0.95) 0%, rgba(13, 18, 15, 0.98) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 120
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Avg Plate Rate</span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'grid',
              placeItems: 'center',
              color: '#3B82F6',
              flexShrink: 0
            }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
              ₹{avgPlateRate.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Standard multi-course catering
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(20, 28, 24, 0.95) 0%, rgba(13, 18, 15, 0.98) 100%)',
          border: '1px solid rgba(255, 138, 0, 0.3)',
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: 120
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>Live Event Inquiries</span>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(255, 138, 0, 0.15)',
              border: '1px solid rgba(255, 138, 0, 0.35)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}>
              <ClipboardList size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-serif)' }}>
              {leads.length} Leads
            </div>
            <div style={{ fontSize: 11, color: newLeadsCount > 0 ? '#10B981' : 'var(--text-muted)', marginTop: 4, fontWeight: 600 }}>
              {newLeadsCount > 0 ? `● ${newLeadsCount} New inquiries awaiting contact` : 'All inquiries up to date'}
            </div>
          </div>
        </div>
      </div>

      {/* Luxury Segmented Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 6
      }}>
        <button
          onClick={() => setActiveTab('halls')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: activeTab === 'halls' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'halls' ? '#070A09' : 'var(--text-muted)',
            fontWeight: activeTab === 'halls' ? 800 : 600,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Building2 size={16} />
          <span>Banquet Halls & Venues ({halls.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            borderRadius: 10,
            background: activeTab === 'leads' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'leads' ? '#070A09' : 'var(--text-muted)',
            fontWeight: activeTab === 'leads' ? 800 : 600,
            fontSize: 13,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative'
          }}
        >
          <ClipboardList size={16} />
          <span>Live Inquiries & Event Leads ({leads.length})</span>
          {newLeadsCount > 0 && (
            <span style={{
              background: activeTab === 'leads' ? '#070A09' : '#EF4444',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: 10
            }}>
              {newLeadsCount} NEW
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BANQUET HALLS MANAGEMENT                          */}
      {/* ======================================================== */}
      {activeTab === 'halls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Controls Bar: Search, Filters, Add Button */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1 }}>
              {/* Search */}
              <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search hall name, outlet, or amenities..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Outlet Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MapPin size={15} color="var(--gold)" />
                <select 
                  value={selectedOutlet}
                  onChange={e => setSelectedOutlet(e.target.value)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    minWidth: 200,
                    outline: 'none'
                  }}
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
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  minWidth: 140,
                  outline: 'none'
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button 
                onClick={loadData}
                title="Refresh Data"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              </button>
            </div>

            {/* Add New Banquet Hall Button */}
            <button 
              onClick={handleOpenAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 10,
                background: 'var(--primary)',
                border: 'none',
                color: '#070A09',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 138, 0, 0.3)'
              }}
            >
              <Plus size={16} />
              <span>+ Add Banquet Hall</span>
            </button>
          </div>

          {/* Banquet Halls Grid */}
          {filteredHalls.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 48,
              textAlign: 'center'
            }}>
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
                style={{
                  margin: '0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#070A09',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} />
                <span>Add First Banquet Hall</span>
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 20
            }}>
              {filteredHalls.map(hall => {
                const amenitiesList = hall.amenities ? hall.amenities.split(',').map(a => a.trim()).filter(Boolean) : [];
                const sessionsList = hall.supportedSessions ? hall.supportedSessions.split(',').map(s => s.trim()).filter(Boolean) : [];
                const isMaintenance = hall.status === 'Maintenance';
                const isActive = hall.status === 'Active';

                return (
                  <div 
                    key={hall.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 20,
                      overflow: 'hidden',
                      border: isActive ? '1px solid rgba(201, 162, 77, 0.25)' : '1px solid rgba(239, 68, 68, 0.3)',
                      background: 'linear-gradient(180deg, rgba(20,28,24,0.95) 0%, rgba(13,18,15,0.98) 100%)',
                      boxShadow: 'var(--shadow-card)',
                      position: 'relative'
                    }}
                  >
                    {/* Cover Image & Overlay Badges */}
                    <div style={{ position: 'relative', height: 190, overflow: 'hidden' }}>
                      <img 
                        src={hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80'} 
                        alt={hall.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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

                      {/* Mobile App Sync Indicator */}
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
                        background: 'rgba(5, 8, 7, 0.85)',
                        border: '1px solid var(--border)',
                        color: 'var(--gold)',
                        backdropFilter: 'blur(4px)'
                      }}>
                        <Sparkles size={11} />
                        <span>Live in Mobile App</span>
                      </div>

                      {/* Name & Outlet */}
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
                          <span>{hall.outletName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, justifyContent: 'space-between' }}>
                      {/* Capacity & Price */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          padding: '10px 12px'
                        }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                            <Users size={12} color="var(--gold)" />
                            <span>Capacity</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                            {hall.minCapacity} – {hall.maxCapacity} Pax
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
                            <span>Plate Tariff</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#10B981' }}>
                            ₹{hall.ratePerPlate?.toLocaleString()} <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>/ guest</span>
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
                          <span>Venue Features:</span>
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
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-main)',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer'
                          }}
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>

                        <button 
                          onClick={() => handleQuickStatusToggle(hall)}
                          title={isActive ? 'Mark for Maintenance' : 'Set as Active'}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: 'rgba(255,255,255,0.05)',
                            border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                            color: isActive ? '#F59E0B' : '#10B981',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isActive ? 'Pause' : 'Activate'}
                        </button>

                        <button 
                          onClick={() => setHallToDelete(hall)}
                          title="Delete Hall"
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'grid',
                            placeItems: 'center'
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: LIVE INQUIRIES & EVENT LEADS (SYNCED WITH APP)    */}
      {/* ======================================================== */}
      {activeTab === 'leads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Controls Bar */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: 260, flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by patron name, phone, or event type..."
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              <select 
                value={leadStatusFilter}
                onChange={e => setLeadStatusFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  minWidth: 160,
                  outline: 'none'
                }}
              >
                <option value="ALL">All Statuses ({leads.length})</option>
                <option value="NEW">New Leads Only ({leads.filter(l => l.status === 'NEW').length})</option>
                <option value="CONTACTED">Contacted</option>
                <option value="CONFIRMED">Confirmed / Won</option>
                <option value="LOST">Archived / Lost</option>
              </select>

              <select 
                value={selectedOccasionFilter}
                onChange={e => setSelectedOccasionFilter(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  minWidth: 170,
                  outline: 'none'
                }}
              >
                <option value="ALL">All Occasions ({leads.length})</option>
                {BANQUET_OCCASION_TYPES.map(occ => (
                  <option key={occ.id} value={occ.id}>{occ.icon} {occ.label}</option>
                ))}
                <option value="Outdoor Catering">🍽️ Outdoor Catering (ODC)</option>
              </select>

              <button 
                onClick={loadData}
                title="Refresh Leads"
                style={{
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center'
                }}
              >
                <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                type="button"
                onClick={() => setShowInquiryModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 16px',
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--gold) 0%, #D4A338 100%)',
                  color: '#121A15',
                  fontWeight: 700,
                  fontSize: 13,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(201, 162, 77, 0.25)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Plus size={16} />
                <span>Log Walk-in Lead</span>
              </button>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span>Real-time app sync</span>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          {filteredLeads.length === 0 ? (
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 48,
              textAlign: 'center'
            }}>
              <ClipboardList size={48} color="var(--primary)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                No Inquiries Found
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 440, margin: '0 auto' }}>
                When a user inquires for Banquet Halls or ODC Catering from the mobile app, it appears here immediately!
              </p>
            </div>
          ) : (
            <div style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              overflowX: 'auto',
              boxShadow: 'var(--shadow-card)'
            }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>REF & DATE</th>
                    <th>PATRON / GUEST</th>
                    <th>EVENT & SHIFT</th>
                    <th>GUESTS</th>
                    <th>REQUIREMENTS / VENUE</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => {
                    const cleanPhone = lead.customerMobile.replace(/[^0-9]/g, '');
                    const dateStr = lead.eventDate || lead.targetDate || 'Upcoming';
                    const shiftStr = lead.eventShift || lead.shift || 'Evening';
                    const paxNum = lead.estimatedPax || lead.paxCount || 50;
                    const waText = `Dear ${lead.customerName}, this is House of Yanki Event Desk regarding your inquiry #${lead.id} for ${lead.eventCategory} on ${dateStr} (${paxNum} Guests). We would love to review custom menu options and hall availability with you.`;
                    const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(waText)}`;
                    const isNew = lead.status === 'NEW';

                    return (
                      <tr key={lead.id} style={{ background: isNew ? 'rgba(255, 138, 0, 0.04)' : undefined }}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13 }}>
                            #{lead.id}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent'}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{lead.customerName}</span>
                            {isNew && (
                              <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(255, 138, 0, 0.2)', color: 'var(--primary)', fontWeight: 800 }}>
                                NEW
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--gold)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={11} />
                            <span>{lead.customerMobile}</span>
                          </div>
                        </td>

                        <td>
                          {(() => {
                            const occ = parseOccasion(lead.eventCategory);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div>
                                  <span style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    background: occ.bg,
                                    border: `1px solid ${occ.border}`,
                                    color: occ.color,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5
                                  }}>
                                    <span>{occ.icon}</span>
                                    <span>{occ.label}</span>
                                  </span>
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Calendar size={11} />
                                  <span>{dateStr} • {shiftStr}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>

                        <td>
                          <span style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 8,
                            background: paxNum >= 200 ? 'rgba(201, 162, 77, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            color: paxNum >= 200 ? 'var(--gold)' : 'var(--text-main)',
                            border: paxNum >= 200 ? '1px solid rgba(201, 162, 77, 0.3)' : '1px solid var(--border)'
                          }}>
                            {paxNum} Pax
                          </span>
                        </td>

                        <td style={{ maxWidth: 260 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {lead.customRequirements || 'Standard inquiry'}
                          </div>
                        </td>

                        <td>
                          <select
                            value={lead.status}
                            onChange={e => handleLeadStatusChange(lead.id, e.target.value)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: 8,
                              fontSize: 11,
                              fontWeight: 700,
                              background: lead.status === 'NEW' 
                                ? 'rgba(255, 138, 0, 0.15)' 
                                : lead.status === 'CONTACTED' 
                                ? 'rgba(59, 130, 246, 0.15)' 
                                : lead.status === 'CONFIRMED' 
                                ? 'rgba(16, 185, 129, 0.15)' 
                                : 'rgba(255, 255, 255, 0.05)',
                              color: lead.status === 'NEW' 
                                ? 'var(--primary)' 
                                : lead.status === 'CONTACTED' 
                                ? '#3B82F6' 
                                : lead.status === 'CONFIRMED' 
                                ? '#10B981' 
                                : 'var(--text-muted)',
                              border: '1px solid var(--border)',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="NEW">NEW LEAD</option>
                            <option value="CONTACTED">CONTACTED</option>
                            <option value="CONFIRMED">CONFIRMED (WON)</option>
                            <option value="LOST">ARCHIVED</option>
                          </select>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              background: 'rgba(37, 211, 102, 0.15)',
                              border: '1px solid rgba(37, 211, 102, 0.4)',
                              color: '#25D366',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              textDecoration: 'none',
                              transition: 'all 0.15s ease'
                            }}
                            title="Chat with Guest on WhatsApp"
                          >
                            <MessageCircle size={13} />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Banquet Hall Modal */}
      {showModal && (
        <div 
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Hall Name & Associated Outlet */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Hall Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. The Imperial Grand Ballroom"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Associated Branch / Outlet *</label>
                  <select
                    required
                    value={formData.outletName || ''}
                    onChange={e => setFormData({ ...formData, outletName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    {outletsList.map(out => (
                      <option key={out} value={out}>{out}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Min Pax & Max Pax */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Minimum Capacity (Pax) *</label>
                  <input 
                    type="number"
                    min="10"
                    max="5000"
                    required
                    value={formData.minCapacity || 50}
                    onChange={e => setFormData({ ...formData, minCapacity: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Maximum Capacity (Pax) *</label>
                  <input 
                    type="number"
                    min="20"
                    max="10000"
                    required
                    value={formData.maxCapacity || 250}
                    onChange={e => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Plate Rate & Slot Rental */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Starting Rate Per Plate (₹) *</label>
                  <input 
                    type="number"
                    min="100"
                    step="50"
                    required
                    value={formData.ratePerPlate || 950}
                    onChange={e => setFormData({ ...formData, ratePerPlate: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Slot Rental Charge (₹) *</label>
                  <input 
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={formData.slotRentalPrice || 35000}
                    onChange={e => setFormData({ ...formData, slotRentalPrice: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Supported Sessions */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
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

              {/* Ideal For Occasion Types */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
                  Ideal For Occasion Types
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BANQUET_OCCASION_TYPES.filter(o => o.id !== 'Other').map(occ => {
                    const isSelected = (formData.amenities || '').includes(occ.id);
                    return (
                      <button
                        type="button"
                        key={occ.id}
                        onClick={() => {
                          const current = (formData.amenities || '');
                          if (current.includes(occ.id)) {
                            const updated = current.split(',').filter(a => a.trim() !== occ.id).join(',');
                            setFormData({ ...formData, amenities: updated });
                          } else {
                            const updated = current ? `${current},${occ.id}` : occ.id;
                            setFormData({ ...formData, amenities: updated });
                          }
                        }}
                        style={{
                          fontSize: 11,
                          padding: '6px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: isSelected ? `1px solid ${occ.border}` : '1px solid var(--border)',
                          background: isSelected ? occ.bg : 'rgba(255,255,255,0.03)',
                          color: isSelected ? occ.color : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: isSelected ? 700 : 500,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span>{occ.icon}</span>
                        <span>{occ.label}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amenities Selection */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Status *</label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    <option value="Active">Active (Accepting Bookings)</option>
                    <option value="Maintenance">Maintenance / Renovation</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Cover Image URL</label>
                  <input 
                    type="url"
                    value={formData.imageUrl || ''}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
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
                  style={{
                    flex: 1,
                    padding: '11px',
                    fontSize: 13,
                    fontWeight: 600,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: '11px',
                    fontSize: 13,
                    fontWeight: 800,
                    borderRadius: 10,
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#070A09',
                    cursor: 'pointer'
                  }}
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
                style={{
                  flex: 1,
                  padding: '10px',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  cursor: 'pointer'
                }}
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
      {/* Log Walk-in Banquet Inquiry Modal */}
      {showInquiryModal && (
        <div 
          onClick={() => !isSubmittingInquiry && setShowInquiryModal(false)}
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
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(155deg, #18231E 0%, #0F1613 100%)',
              border: '1px solid rgba(201, 162, 77, 0.4)',
              borderRadius: 20,
              maxWidth: 620,
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
                  Log Walk-in Banquet Lead
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Directly record guest occasion requirements, guest count, and trigger instant WhatsApp desk notifications.
                </p>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)}
                disabled={isSubmittingInquiry}
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

            <form onSubmit={handleCreateInquiry} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* OCCASION TYPE SELECTION (Matches Mobile App UI) */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', letterSpacing: 0.5, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                  Occasion Type *
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {BANQUET_OCCASION_TYPES.map(occ => {
                    const isSelected = inquiryFormData.selectedOccasion === occ.id;
                    return (
                      <button
                        type="button"
                        key={occ.id}
                        onClick={() => setInquiryFormData({ ...inquiryFormData, selectedOccasion: occ.id })}
                        style={{
                          fontSize: 12,
                          padding: '7px 14px',
                          borderRadius: 20,
                          cursor: 'pointer',
                          border: isSelected ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                          background: isSelected ? 'rgba(201, 162, 77, 0.18)' : 'rgba(255,255,255,0.04)',
                          color: isSelected ? 'var(--gold)' : 'var(--text-main)',
                          fontWeight: isSelected ? 700 : 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 0 12px rgba(201, 162, 77, 0.2)' : 'none'
                        }}
                      >
                        <span>{occ.icon}</span>
                        <span>{occ.label}</span>
                      </button>
                    );
                  })}
                </div>

                {inquiryFormData.selectedOccasion === 'Other' && (
                  <div style={{ marginTop: 10 }}>
                    <input 
                      type="text"
                      placeholder="Specify custom occasion (e.g. Baby Shower, Farewell Gala)..."
                      value={inquiryFormData.customOccasion}
                      onChange={e => setInquiryFormData({ ...inquiryFormData, customOccasion: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--gold)',
                        color: 'var(--text-main)',
                        fontSize: 13,
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Guest Name & Mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Guest / Patron Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={inquiryFormData.customerName}
                    onChange={e => setInquiryFormData({ ...inquiryFormData, customerName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>WhatsApp Mobile *</label>
                  <input 
                    type="tel"
                    required
                    placeholder="e.g. 9825012345"
                    value={inquiryFormData.customerMobile}
                    onChange={e => setInquiryFormData({ ...inquiryFormData, customerMobile: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Event Date & Shift Session */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Target Event Date *</label>
                  <input 
                    type="date"
                    required
                    value={inquiryFormData.eventDate}
                    onChange={e => setInquiryFormData({ ...inquiryFormData, eventDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Session Shift *</label>
                  <select
                    value={inquiryFormData.eventShift}
                    onChange={e => setInquiryFormData({ ...inquiryFormData, eventShift: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: 10,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13,
                      outline: 'none'
                    }}
                  >
                    <option value="Dinner">Dinner (Evening - 07:00 PM onwards)</option>
                    <option value="Lunch">Lunch (Afternoon - 12:00 PM to 04:00 PM)</option>
                    <option value="Full Day">Full Day (Morning to Night)</option>
                  </select>
                </div>
              </div>

              {/* Expected Pax */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Estimated Pax Count *</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {[25, 50, 75, 100, 150, 200, 300, 500].map(pax => (
                    <button
                      type="button"
                      key={pax}
                      onClick={() => setInquiryFormData({ ...inquiryFormData, estimatedPax: pax })}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        cursor: 'pointer',
                        border: inquiryFormData.estimatedPax === pax ? '1px solid var(--gold)' : '1px solid var(--border)',
                        background: inquiryFormData.estimatedPax === pax ? 'rgba(201, 162, 77, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: inquiryFormData.estimatedPax === pax ? 'var(--gold)' : 'var(--text-muted)',
                        fontWeight: inquiryFormData.estimatedPax === pax ? 700 : 500
                      }}
                    >
                      {pax} Pax
                    </button>
                  ))}
                </div>
                <input 
                  type="number"
                  min="10"
                  max="5000"
                  required
                  value={inquiryFormData.estimatedPax}
                  onChange={e => setInquiryFormData({ ...inquiryFormData, estimatedPax: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none'
                  }}
                />
              </div>

              {/* Custom Requirements / Notes */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Custom Menu & Venue Notes</label>
                <textarea 
                  rows={2}
                  placeholder="e.g. Vegetarian sizzler counter, DJ permission required, stage floral decor..."
                  value={inquiryFormData.customRequirements}
                  onChange={e => setInquiryFormData({ ...inquiryFormData, customRequirements: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(false)}
                  disabled={isSubmittingInquiry}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--gold) 0%, #D4A338 100%)',
                    border: 'none',
                    color: '#121A15',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(201, 162, 77, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  {isSubmittingInquiry ? 'Recording Lead...' : 'Save Lead & Dispatch Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
