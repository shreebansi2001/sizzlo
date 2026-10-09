import React, { useState, useEffect } from 'react';
import { 
  PartyPopper, TrendingUp, Calendar, Truck, UserCheck, ShieldAlert, 
  Sparkles, Phone, Mail, Plus, Users, Clock, MapPin, CheckCircle, 
  Trash2, Edit3, X, QrCode, MessageSquare
} from 'lucide-react';
import { 
  fetchBanquetLeads, assignBanquetLead, updateBanquetLeadStatus, BanquetLeadDTO,
  fetchDiningEvents, createDiningEvent, updateDiningEvent, deleteDiningEvent,
  fetchDiningEventAttendees, DiningEventAdminDTO, DiningAttendeeDTO
} from '../api/client';
import { EventItem } from '../types';

interface EventsPageProps {
  events?: EventItem[];
}

export const EventsPage: React.FC<EventsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'dining' | 'banquet'>('dining');
  
  // Banquet state
  const [leads, setLeads] = useState<BanquetLeadDTO[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Dining Events state
  const [diningEvents, setDiningEvents] = useState<DiningEventAdminDTO[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  
  // Create / Edit Event modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState<Partial<DiningEventAdminDTO>>({
    title: '',
    outletName: 'Yanki Sizzlers - CG Road',
    eventDay: 'Every Sunday',
    timings: '12:00 PM – 04:00 PM',
    totalSeats: 50,
    pricePerGuest: 99,
    description: '',
    inclusions: 'Live sizzler grill buffet, desserts, live jazz music, welcome drink',
    status: 'ACTIVE'
  });

  // Attendee list modal state
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<DiningEventAdminDTO | null>(null);
  const [attendees, setAttendees] = useState<DiningAttendeeDTO[]>([]);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);

  const loadLeads = async () => {
    try {
      const data = await fetchBanquetLeads();
      setLeads(data);
    } catch (_) {}
  };

  const loadDiningEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const data = await fetchDiningEvents();
      setDiningEvents(data);
    } catch (_) {}
    finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadLeads();
    loadDiningEvents();
  }, []);

  const handleAssign = async (id: number) => {
    const rep = window.prompt('Assign lead to sales representative:', 'BDE Amit Trivedi');
    if (!rep) return;
    try {
      const res = await assignBanquetLead(id, rep);
      if (res.success) {
        setNotice(`Lead #${id} assigned to ${rep}!`);
        await loadLeads();
      }
    } catch (e: any) {
      setNotice(`Assignment error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await updateBanquetLeadStatus(id, newStatus);
      if (res && res.success) {
        setNotice(`Lead #${id} status updated to ${newStatus}! WhatsApp update dispatched.`);
        await loadLeads();
      }
    } catch (e: any) {
      setNotice(`Status update error: ${e.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      outletName: 'Yanki Sizzlers - CG Road',
      eventDay: 'Every Sunday',
      timings: '12:00 PM – 04:00 PM',
      totalSeats: 50,
      pricePerGuest: 99,
      description: '',
      inclusions: 'Live sizzler grill buffet, desserts, live jazz music, welcome drink',
      status: 'ACTIVE'
    });
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (ev: DiningEventAdminDTO) => {
    setEditingEventId(ev.id || null);
    setEventForm({
      title: ev.title,
      outletName: ev.outletName,
      eventDay: ev.eventDay,
      timings: ev.timings,
      totalSeats: ev.totalSeats,
      pricePerGuest: ev.pricePerGuest,
      description: ev.description,
      inclusions: ev.inclusions,
      status: ev.status
    });
    setShowEventModal(true);
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEventId) {
        await updateDiningEvent(editingEventId, eventForm);
        setNotice('Event updated successfully!');
      } else {
        await createDiningEvent(eventForm);
        setNotice('New dining event published successfully!');
      }
      setShowEventModal(false);
      await loadDiningEvents();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleDeleteEvent = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete event "${title}"?`)) return;
    try {
      await deleteDiningEvent(id);
      setNotice(`Event "${title}" deleted.`);
      await loadDiningEvents();
    } catch (err: any) {
      setNotice(`Error: ${err.message}`);
    }
    setTimeout(() => setNotice(null), 3500);
  };

  const handleViewAttendees = async (ev: DiningEventAdminDTO) => {
    if (!ev.id) return;
    setSelectedEventForAttendees(ev);
    setIsLoadingAttendees(true);
    try {
      const list = await fetchDiningEventAttendees(ev.id);
      setAttendees(list);
    } catch (_) {}
    finally {
      setIsLoadingAttendees(false);
    }
  };

  const totalGuests = leads.reduce((acc, l) => acc + (l.paxCount || 0), 0);
  const totalBookedEventSeats = diningEvents.reduce((acc, e) => acc + (e.bookedSeats || 0), 0);
  const totalEventCapacity = diningEvents.reduce((acc, e) => acc + (e.totalSeats || 0), 0);

  return (
    <div>
      {/* Toast Alert */}
      {notice && (
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
          fontWeight: 600
        }}>
          {notice}
        </div>
      )}

      {/* Header and Top Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
            Events &amp; Banquets Management
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Club Dining Experiences, Brunches &amp; House of Yanki Banquet Desk
          </p>
        </div>

        {activeTab === 'dining' && (
          <button
            onClick={handleOpenCreateEvent}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              background: 'var(--primary)',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(255,138,0,0.3)'
            }}
          >
            <Plus size={16} /> Publish New Event
          </button>
        )}
      </div>

      {/* Segmented Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: 8,
        background: 'var(--surface-alt)',
        padding: 4,
        borderRadius: 14,
        marginBottom: 24,
        width: 'fit-content'
      }}>
        <button
          onClick={() => setActiveTab('dining')}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'dining' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'dining' ? '#000' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <Sparkles size={15} /> Club Events &amp; Brunches ({diningEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('banquet')}
          style={{
            padding: '8px 20px',
            borderRadius: 10,
            border: 'none',
            background: activeTab === 'banquet' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'banquet' ? '#000' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'all 0.2s'
          }}
        >
          <PartyPopper size={15} /> Banquet &amp; ODC Leads ({leads.length})
        </button>
      </div>

      {/* TAB 1: DINING EVENTS & EXPERIENCES */}
      {activeTab === 'dining' && (
        <div>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card">
              <span className="kpi-label">ACTIVE EVENTS</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--primary)' }}>
                {diningEvents.filter(e => e.status === 'ACTIVE').length}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Published on mobile app</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">TOTAL SEAT CAPACITY</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#4EE3B8' }}>
                {totalEventCapacity}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Combined sessions limit</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">CONFIRMED ATTENDEES</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--gold)' }}>
                {totalBookedEventSeats}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Registered users</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">AVG OCCUPANCY</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#A78BFA' }}>
                {totalEventCapacity > 0 ? `${Math.round((totalBookedEventSeats / totalEventCapacity) * 100)}%` : '0%'}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Seat fill rate</span>
            </div>
          </div>

          {/* Events Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
            {diningEvents.map((ev) => {
              const booked = ev.bookedSeats || 0;
              const total = ev.totalSeats || 50;
              const remaining = Math.max(0, total - booked);
              const pct = Math.min(100, Math.round((booked / total) * 100));

              return (
                <div
                  key={ev.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }}
                >
                  <div>
                    {/* Top Status Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 10,
                        fontWeight: 800,
                        background: 'rgba(232, 184, 74, 0.12)',
                        border: '1px solid var(--gold)',
                        color: 'var(--gold)',
                        letterSpacing: 0.5
                      }}>
                        {ev.eventDay.toUpperCase()}
                      </span>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        background: ev.status === 'HOUSEFULL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(78, 227, 184, 0.15)',
                        color: ev.status === 'HOUSEFULL' ? '#EF4444' : '#4EE3B8'
                      }}>
                        {ev.status} • {remaining} spots left
                      </span>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                      {ev.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={13} color="var(--primary)" /> {ev.outletName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Clock size={13} color="var(--primary)" /> {ev.timings}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                        <span>Capacity Booked</span>
                        <strong style={{ color: 'var(--text-main)' }}>{booked} / {total} ({pct}%)</strong>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                      </div>
                    </div>

                    <div style={{
                      padding: '10px 12px',
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                      marginBottom: 16
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Nominal Deposit:</span>
                        <strong style={{ color: 'var(--gold)' }}>₹{ev.pricePerGuest} / Guest</strong>
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>
                        {ev.inclusions}
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <button
                      onClick={() => handleViewAttendees(ev)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(78, 227, 184, 0.12)',
                        border: '1px solid #4EE3B8',
                        color: '#4EE3B8',
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6
                      }}
                    >
                      <Users size={14} /> Attendees ({booked})
                    </button>

                    <button
                      onClick={() => handleOpenEditEvent(ev)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12
                      }}
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      onClick={() => ev.id && handleDeleteEvent(ev.id, ev.title)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 10,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: BANQUET & ODC DESK */}
      {activeTab === 'banquet' && (
        <div>
          {/* Strict Zero-Points Compliance Banner */}
          <div style={{
            background: 'rgba(255, 138, 0, 0.08)',
            border: '1px solid var(--primary)',
            borderRadius: 14,
            padding: '14px 18px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <ShieldAlert size={20} color="var(--primary)" />
            <div style={{ fontSize: 12, color: 'var(--text-main)' }}>
              <strong>Strict Zero-Points Compliance Engine (SRS Chapter 7.2):</strong> Banquet and Outdoor Catering (ODC) bookings are eligible for tier card-rate discounts (20% for Signature &amp; Elite) but are strictly excluded from earning loyalty points to prevent outsized liability.
            </div>
          </div>

          {/* 4 KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <div className="kpi-card">
              <span className="kpi-label">INQUIRY PIPELINE</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--primary)' }}>
                {leads.length}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Active leads from mobile app</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">TOTAL GUESTS ESTIMATED</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--gold)' }}>
                {totalGuests}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Cumulative pax count</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">ODC &amp; LAWN EVENTS</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#4EE3B8' }}>
                {leads.filter(l => l.eventCategory?.includes('ODC') || l.eventCategory?.includes('Outdoor')).length}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Outdoor catering requests</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">UNASSIGNED LEADS</span>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#EF4444' }}>
                {leads.filter(l => !l.assignedTo || l.status === 'NEW').length}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Requires BDE allocation</span>
            </div>
          </div>

          {/* Banquet Leads Table */}
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>GUEST CONTACT</th>
                  <th>EVENT DETAILS</th>
                  <th>PAX &amp; SHIFT</th>
                  <th>VENUE PREFERENCE</th>
                  <th>STATUS</th>
                  <th>ASSIGNED REP</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#{lead.id}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{lead.customerName}</strong>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={10} /> {lead.customerMobile}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          background: 'rgba(232, 184, 74, 0.1)',
                          color: 'var(--gold)'
                        }}>
                          {lead.eventCategory || 'Banquet'}
                        </span>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {lead.targetDate || 'TBD'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{lead.paxCount || 50} Pax</strong>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.shift || 'Dinner'}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12 }}>House of Yanki</span>
                    </td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: lead.status === 'NEW'
                            ? 'rgba(255, 138, 0, 0.15)'
                            : lead.status === 'CONTACTED'
                            ? 'rgba(0, 191, 255, 0.15)'
                            : lead.status === 'IN_DISCUSSION'
                            ? 'rgba(232, 184, 74, 0.15)'
                            : lead.status === 'CONFIRMED'
                            ? 'rgba(78, 227, 184, 0.15)'
                            : 'rgba(255, 255, 255, 0.08)',
                          color: lead.status === 'NEW'
                            ? 'var(--primary)'
                            : lead.status === 'CONTACTED'
                            ? '#00BFFF'
                            : lead.status === 'IN_DISCUSSION'
                            ? '#E8B84A'
                            : lead.status === 'CONFIRMED'
                            ? '#4EE3B8'
                            : '#CCC',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="NEW" style={{ background: '#1c1917', color: '#ff8a00' }}>NEW (Pending)</option>
                        <option value="CONTACTED" style={{ background: '#1c1917', color: '#00BFFF' }}>CONTACTED</option>
                        <option value="IN_DISCUSSION" style={{ background: '#1c1917', color: '#E8B84A' }}>IN DISCUSSION</option>
                        <option value="CONFIRMED" style={{ background: '#1c1917', color: '#4EE3B8' }}>CONFIRMED</option>
                        <option value="CLOSED" style={{ background: '#1c1917', color: '#888' }}>CLOSED</option>
                      </select>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: lead.assignedTo ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {lead.assignedTo || 'Unassigned'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleAssign(lead.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          color: 'var(--primary)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <UserCheck size={12} /> Assign Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT EVENT */}
      {showEventModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 540,
            padding: 24,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                {editingEventId ? 'Edit Dining Event' : 'Create New Dining Event'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={eventForm.title || ''}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="e.g. Yanki Sparkling Sunday Brunch"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Outlet / Venue *
                  </label>
                  <select
                    value={eventForm.outletName || 'Yanki Sizzlers - CG Road'}
                    onChange={e => setEventForm({ ...eventForm, outletName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="Yanki Sizzlers - CG Road">Yanki Sizzlers - CG Road</option>
                    <option value="Yanki Sizzlers - Bodakdev">Yanki Sizzlers - Bodakdev</option>
                    <option value="Dough by Yanki - Sindhu Bhavan">Dough by Yanki - Sindhu Bhavan</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Day / Frequency *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.eventDay || 'Every Sunday'}
                    onChange={e => setEventForm({ ...eventForm, eventDay: e.target.value })}
                    placeholder="e.g. Every Sunday or Friday Special"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Timings *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventForm.timings || '12:00 PM – 04:00 PM'}
                    onChange={e => setEventForm({ ...eventForm, timings: e.target.value })}
                    placeholder="e.g. 12:00 PM – 04:00 PM"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Total Seat Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="500"
                    value={eventForm.totalSeats || 50}
                    onChange={e => setEventForm({ ...eventForm, totalSeats: parseInt(e.target.value) || 50 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Nominal Booking Deposit (₹ / Guest) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={eventForm.pricePerGuest || 99}
                    onChange={e => setEventForm({ ...eventForm, pricePerGuest: parseFloat(e.target.value) || 99 })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                    Status *
                  </label>
                  <select
                    value={eventForm.status || 'ACTIVE'}
                    onChange={e => setEventForm({ ...eventForm, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: 'var(--surface-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-main)',
                      fontSize: 13
                    }}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="HOUSEFULL">HOUSEFULL</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Inclusions &amp; Privileges
                </label>
                <input
                  type="text"
                  value={eventForm.inclusions || ''}
                  onChange={e => setEventForm({ ...eventForm, inclusions: e.target.value })}
                  placeholder="e.g. Live grill buffet, desserts, live jazz, welcome drink"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Event Description
                </label>
                <textarea
                  rows={3}
                  value={eventForm.description || ''}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  placeholder="Full description of the experience..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 10,
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#000',
                    cursor: 'pointer',
                    fontWeight: 800
                  }}
                >
                  {editingEventId ? 'Save Changes' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ATTENDEE LIST */}
      {selectedEventForAttendees && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            width: '90%',
            maxWidth: 780,
            padding: 24,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                  Registered Attendees: {selectedEventForAttendees.title}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedEventForAttendees.outletName} • {selectedEventForAttendees.eventDay} ({selectedEventForAttendees.timings})
                </p>
              </div>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {isLoadingAttendees ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading attendees...
                </div>
              ) : attendees.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No attendees have booked this event yet.
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>BOOKING ID</th>
                      <th>USER NAME</th>
                      <th>MOBILE</th>
                      <th>PAX</th>
                      <th>DEPOSIT PAID</th>
                      <th>WHATSAPP PASS</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map(a => (
                      <tr key={a.id}>
                        <td>
                          <strong style={{ color: 'var(--gold)', fontFamily: 'monospace' }}>#{a.bookingReference}</strong>
                        </td>
                        <td>
                          <strong>{a.customerName}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                            <Phone size={11} color="var(--primary)" /> {a.customerMobile}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{a.guestCount} Guests</span>
                        </td>
                        <td>
                          <strong style={{ color: '#4EE3B8' }}>₹{a.totalAmount}</strong>
                        </td>
                        <td>
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 11,
                            color: a.whatsappSent ? '#25D366' : 'var(--text-muted)'
                          }}>
                            <MessageSquare size={12} /> {a.whatsappSent ? 'Delivered' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 10,
                            fontWeight: 700,
                            background: 'rgba(78, 227, 184, 0.15)',
                            color: '#4EE3B8'
                          }}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => setSelectedEventForAttendees(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  background: 'var(--primary)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
