import React, { useState } from 'react';
import { PartyPopper, TrendingUp, Calendar, Truck, Plus, CheckCircle, Clock } from 'lucide-react';
import { EventItem } from '../types';

interface EventsPageProps {
  events: EventItem[];
}

export const EventsPage: React.FC<EventsPageProps> = ({ events }) => {
  const [eventList, setEventList] = useState<EventItem[]>(events);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'Banquet' as 'Banquet' | 'ODC',
    date: '',
    guests: 100,
    value: 250000,
  });

  const totalValue = eventList.reduce((acc, e) => acc + e.value, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const created: EventItem = {
      id: `E-${100 + eventList.length + 1}`,
      name: newEvent.name,
      type: newEvent.type,
      date: newEvent.date,
      guests: Number(newEvent.guests),
      value: Number(newEvent.value),
      status: 'Pipeline',
    };
    setEventList([...eventList, created]);
    setShowModal(false);
  };

  return (
    <div>
      {/* 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'UPCOMING EVENTS', val: String(eventList.length), sub: 'Next 60 days pipeline', icon: Calendar },
          { label: 'TOTAL PIPELINE VALUE', val: `₹${(totalValue / 100000).toFixed(2)} Lakh`, sub: '+24% YoY surge', icon: TrendingUp, delta: '+24%' },
          { label: 'CONFIRMED BOOKINGS', val: String(eventList.filter(e => e.status === 'Confirmed').length), sub: 'Contracts signed & advances received', icon: PartyPopper },
          { label: 'OUTDOOR CATERING (ODC)', val: String(eventList.filter(e => e.type === 'ODC').length), sub: 'High-margin corporate & weddings', icon: Truck },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="kpi-card">
              <div className="kpi-header">
                <span className="kpi-label">{s.label}</span>
                <Icon size={16} color="var(--gold)" />
              </div>
              <div className="kpi-value" style={{ marginTop: 6, fontSize: 24 }}>{s.val}</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                {s.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Banquet &amp; Outdoor Catering Pipeline</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lead conversion, party sizes, and revenue forecasts</p>
          </div>
          <button className="primary-btn" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Booking Inquiry
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event &amp; Host</th>
                <th>Concept</th>
                <th>Event Date</th>
                <th>Guest Count</th>
                <th>Contract Value</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {eventList.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{e.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.id}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: e.type === 'Banquet' ? 'rgba(0, 29, 74, 0.08)' : 'rgba(232, 184, 74, 0.2)',
                      color: e.type === 'Banquet' ? 'var(--primary)' : 'var(--gold-dark)'
                    }}>
                      {e.type}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{e.date}</td>
                  <td style={{ fontSize: 13, fontWeight: 700 }}>{e.guests.toLocaleString('en-IN')} Pax</td>
                  <td style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{e.value.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 20,
                      background: e.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: e.status === 'Confirmed' ? '#059669' : '#D97706'
                    }}>
                      {e.status === 'Confirmed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            width: '100%',
            maxWidth: 480,
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
              Create Banquet / ODC Inquiry
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
              Add a new high-value celebration to the sales pipeline
            </p>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Event Title &amp; Host</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Reception — Shah Family"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Concept</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  >
                    <option value="Banquet">Banquet Hall</option>
                    <option value="ODC">Outdoor Catering (ODC)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Event Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Nov 2026"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Guest Count</label>
                  <input
                    type="number"
                    required
                    value={newEvent.guests}
                    onChange={(e) => setNewEvent({ ...newEvent, guests: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Estimated Value (₹)</label>
                  <input
                    type="number"
                    required
                    value={newEvent.value}
                    onChange={(e) => setNewEvent({ ...newEvent, value: Number(e.target.value) })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
