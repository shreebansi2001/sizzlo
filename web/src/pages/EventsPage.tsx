import React, { useState, useEffect } from 'react';
import { PartyPopper, TrendingUp, Calendar, Truck, UserCheck, ShieldAlert, Sparkles, Phone, Mail } from 'lucide-react';
import { fetchBanquetLeads, assignBanquetLead, BanquetLeadDTO } from '../api/client';
import { EventItem } from '../types';

interface EventsPageProps {
  events?: EventItem[];
}

export const EventsPage: React.FC<EventsPageProps> = () => {
  const [leads, setLeads] = useState<BanquetLeadDTO[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const loadLeads = async () => {
    try {
      const data = await fetchBanquetLeads();
      setLeads(data);
    } catch (_) {}
  };

  useEffect(() => {
    loadLeads();
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

  const totalGuests = leads.reduce((acc, l) => acc + (l.paxCount || 0), 0);

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

      {/* Header and Compliance Banner */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)' }}>
          House of Yanki Banquet &amp; Outdoor Catering (ODC) Desk
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          SRS Chapter 07: Large Gatherings (20+ Covers) &amp; Outdoor Catering Management
        </p>
      </div>

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
          <span className="kpi-label">TOTAL PROJECTED COVERS</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#10B981' }}>
            {totalGuests.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Cumulative attendee headcount</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">ODC &amp; LAWN EVENTS</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: '#3B82F6' }}>
            {leads.filter(l => l.eventCategory.toLowerCase().includes('outdoor') || l.eventCategory.toLowerCase().includes('lawn')).length}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>High-margin outdoor catering</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">QUALIFIED FOR 20% DISCOUNT</span>
          <div className="kpi-value" style={{ marginTop: 6, fontSize: 24, color: 'var(--gold-dark)' }}>
            {leads.filter(l => l.paxCount >= 300).length}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>300+ guests (Elite tier perk)</span>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Incoming Event Inquiries</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Routed directly from Sizzlo mobile app 20+ guest trigger</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, background: 'rgba(255, 138, 0, 0.15)', color: 'var(--primary)', padding: '4px 10px', borderRadius: 20 }}>
            {leads.length} Leads
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer Contact</th>
                <th>Category</th>
                <th>Target Date &amp; Shift</th>
                <th>Guest Count</th>
                <th>Special Notes</th>
                <th>Sales Desk Assignee</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{lead.customerName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.customerMobile}</div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#3B82F6',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      {lead.eventCategory}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{lead.targetDate}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.shift} Shift</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 14 }}>
                      {lead.paxCount} Guests
                    </span>
                    {lead.paxCount >= 300 && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#10B981' }}>★ 20% Elite Perk Eligible</div>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 220 }}>
                    {lead.customRequirements || 'Standard banquet package'}
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: lead.assignedTo ? 'var(--text-main)' : 'var(--warning)'
                    }}>
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
    </div>
  );
};
