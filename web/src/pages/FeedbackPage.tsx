import React, { useState, useEffect } from 'react';
import { 
  Star, Calendar, MessageSquare, ThumbsUp, AlertTriangle, CheckCircle2, 
  Phone, MessageCircle, RefreshCw, X, ShieldAlert, Sparkles, Filter 
} from 'lucide-react';
import { fetchFeedbackTickets, resolveFeedbackTicket, FeedbackTicketDTO } from '../api/client';

export const FeedbackPage: React.FC = () => {
  const [tickets, setTickets] = useState<FeedbackTicketDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'urgent' | 'resolved'>('urgent');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('All');
  
  // Resolve modal state
  const [resolvingTicket, setResolvingTicket] = useState<FeedbackTicketDTO | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolve, setIsSubmittingResolve] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFeedbackTickets();
      if (data && data.length > 0) {
        setTickets(data);
      }
    } catch (_) {}
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleOpenResolve = (ticket: FeedbackTicketDTO) => {
    setResolvingTicket(ticket);
    setResolutionNotes(`Store Manager spoke with guest ${ticket.customerName}. Apology offered and dining credit issued.`);
  };

  const handleConfirmResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTicket) return;
    setIsSubmittingResolve(true);
    try {
      await resolveFeedbackTicket(resolvingTicket.id, resolutionNotes);
      setTickets(prev => prev.map(t => 
        t.id === resolvingTicket.id 
          ? { ...t, status: 'RESOLVED', isUrgentRecovery: false, resolutionNotes } 
          : t
      ));
      setToastMessage(`✅ Recovery ticket #${resolvingTicket.id} marked as RESOLVED!`);
      setResolvingTicket(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert('Failed to resolve ticket: ' + (err.message || 'Error'));
    } finally {
      setIsSubmittingResolve(false);
    }
  };

  // Metric Computations
  const totalReviews = tickets.length;
  const avgRating = totalReviews > 0 
    ? (tickets.reduce((acc, t) => acc + (t.rating || 5), 0) / totalReviews).toFixed(1)
    : '4.8';
  const urgentCount = tickets.filter(t => t.isUrgentRecovery && t.status === 'OPEN').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED').length;
  const resolutionRate = totalReviews > 0
    ? Math.round((resolvedCount / totalReviews) * 100)
    : 98;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    const matchesOutlet = selectedOutlet === 'All' || (t.outletName || '').toLowerCase().includes(selectedOutlet.toLowerCase());
    if (!matchesOutlet) return false;
    if (activeTab === 'urgent') return t.isUrgentRecovery && t.status === 'OPEN';
    if (activeTab === 'resolved') return t.status === 'RESOLVED';
    return true;
  });

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '12px 18px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 700
        }}>
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}

      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card">
          <span className="kpi-label">OVERALL SATISFACTION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div className="kpi-value" style={{ fontSize: 26, color: 'var(--primary)' }}>{avgRating}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star 
                  key={i} 
                  size={15} 
                  fill={i <= Math.round(Number(avgRating)) ? 'var(--gold)' : 'none'} 
                  color="var(--gold)" 
                />
              ))}
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            Across {totalReviews} live dining reviews
          </span>
        </div>

        <div className="kpi-card" style={{
          border: urgentCount > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid var(--border)',
          background: urgentCount > 0 ? 'rgba(239, 68, 68, 0.04)' : 'var(--surface)'
        }}>
          <span className="kpi-label" style={{ color: urgentCount > 0 ? '#EF4444' : undefined }}>
            🚨 URGENT RECOVERY TICKETS
          </span>
          <div className="kpi-value" style={{ fontSize: 26, marginTop: 6, color: urgentCount > 0 ? '#EF4444' : 'var(--primary)' }}>
            {urgentCount} Open
          </div>
          <span style={{ fontSize: 11, color: urgentCount > 0 ? '#EF4444' : 'var(--text-muted)', fontWeight: 600, marginTop: 4, display: 'block' }}>
            {urgentCount > 0 ? 'Requires Store Manager call < 2 hrs' : 'All service issues addressed'}
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">RESOLUTION RATE</span>
          <div className="kpi-value" style={{ fontSize: 26, marginTop: 6, color: '#10B981' }}>
            {resolutionRate}%
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            {resolvedCount} of {totalReviews} tickets resolved
          </span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">SMART SENTIMENT ROUTING</span>
          <div className="kpi-value" style={{ fontSize: 26, marginTop: 6, color: 'var(--gold)' }}>
            Active
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            ⭐ 4-5 Stars ➔ Google Reviews | ⭐ 1-3 ➔ Urgent Recovery
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        {/* Header & Filter Controls */}
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>
              Subscriber Reviews &amp; Urgent Hospitality Desk
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Real-time sentiment monitoring, Google Reviews deflection &amp; 2-hour guest complaint escalation
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Outlet Selector */}
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text-main)',
                fontSize: 12,
                fontWeight: 600,
                outline: 'none'
              }}
            >
              <option value="All">All Outlets</option>
              <option value="Bodakdev">Bodakdev Signature</option>
              <option value="CG Road">CG Road House of Yanki</option>
              <option value="Sindhu Bhavan">Sindhu Bhavan (Dough)</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadTickets}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface-alt)',
                color: 'var(--text-main)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              {isLoading ? 'Syncing...' : 'Sync Live'}
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '12px 24px',
          background: 'var(--surface-alt)',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('urgent')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'urgent' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid transparent',
              background: activeTab === 'urgent' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              color: activeTab === 'urgent' ? '#EF4444' : 'var(--text-muted)'
            }}
          >
            🚨 Urgent Recovery Queue ({urgentCount})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'all' ? '1px solid var(--gold)' : '1px solid transparent',
              background: activeTab === 'all' ? 'rgba(232, 184, 74, 0.15)' : 'transparent',
              color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)'
            }}
          >
            All Feedback ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              border: activeTab === 'resolved' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent',
              background: activeTab === 'resolved' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
              color: activeTab === 'resolved' ? '#10B981' : 'var(--text-muted)'
            }}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Table / Cards */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: 940 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>Guest &amp; Outlet</th>
                <th style={{ minWidth: 100 }}>Star Rating</th>
                <th style={{ minWidth: 140 }}>Category Breakdown</th>
                <th style={{ minWidth: 260 }}>Guest Feedback &amp; Incident</th>
                <th style={{ minWidth: 140 }}>Status &amp; Channel</th>
                <th style={{ textAlign: 'right', minWidth: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {activeTab === 'urgent' 
                      ? '🎉 No open urgent recovery tickets! All dining service complaints have been handled.' 
                      : 'No feedback tickets found for the selected criteria.'}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  const isUrgent = ticket.isUrgentRecovery && ticket.status === 'OPEN';
                  return (
                    <tr 
                      key={ticket.id}
                      style={{
                        background: isUrgent ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                        borderBottom: '1px solid var(--border)'
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13 }}>
                          {ticket.customerName}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {ticket.customerMobile}
                        </div>
                        <span style={{ 
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          background: 'var(--surface-alt)',
                          color: 'var(--gold-dark)',
                          marginTop: 4
                        }}>
                          {ticket.outletName}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star 
                            size={16} 
                            fill={ticket.rating >= 4 ? 'var(--gold)' : '#EF4444'} 
                            color={ticket.rating >= 4 ? 'var(--gold)' : '#EF4444'} 
                          />
                          <span style={{ fontWeight: 800, fontSize: 15, color: ticket.rating <= 2 ? '#EF4444' : 'var(--text-main)' }}>
                            {ticket.rating}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 5</span>
                        </div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: 4,
                          marginTop: 4,
                          background: ticket.rating >= 4 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: ticket.rating >= 4 ? '#10B981' : '#EF4444'
                        }}>
                          {ticket.rating >= 4 ? 'Satisfied Guest' : '🚨 Urgent Escalation'}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <div>Food: <strong style={{ color: 'var(--text-main)' }}>{ticket.foodRating ?? ticket.rating}★</strong></div>
                          <div>Service: <strong style={{ color: 'var(--text-main)' }}>{ticket.serviceRating ?? ticket.rating}★</strong></div>
                          <div>Cleanliness: <strong style={{ color: 'var(--text-main)' }}>{ticket.cleanlinessRating ?? ticket.rating}★</strong></div>
                        </div>
                      </td>

                      <td>
                        <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4, margin: '0 0 6px 0' }}>
                          "{ticket.comments}"
                        </p>
                        {ticket.resolutionNotes && (
                          <div style={{
                            fontSize: 11,
                            background: 'rgba(16, 185, 129, 0.08)',
                            borderLeft: '2px solid #10B981',
                            padding: '4px 8px',
                            color: '#059669',
                            borderRadius: '0 4px 4px 0'
                          }}>
                            <strong>Manager Action:</strong> {ticket.resolutionNotes}
                          </div>
                        )}
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                          Logged: {new Date(ticket.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>

                      <td>
                        {isUrgent ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            background: 'rgba(239, 68, 68, 0.15)',
                            color: '#EF4444',
                            border: '1px solid rgba(239, 68, 68, 0.4)'
                          }}>
                            <ShieldAlert size={12} /> OPEN RECOVERY
                          </span>
                        ) : ticket.status === 'RESOLVED' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 800,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10B981',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            <CheckCircle2 size={12} /> RESOLVED
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                            background: 'rgba(232, 184, 74, 0.15)',
                            color: 'var(--gold-dark)'
                          }}>
                            {ticket.status}
                          </span>
                        )}
                        {ticket.isGoogleRedirected && (
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>
                            ↗ Google Review Prompted
                          </span>
                        )}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Call Button */}
                          <a
                            href={`tel:${ticket.customerMobile}`}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: 'var(--surface-alt)',
                              border: '1px solid var(--border)',
                              color: 'var(--primary)',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              textDecoration: 'none'
                            }}
                            title="Call Guest"
                          >
                            <Phone size={12} /> Call
                          </a>

                          {/* WhatsApp Button */}
                          <a
                            href={`https://wa.me/${ticket.customerMobile.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Dear ${ticket.customerName}, this is the General Manager from ${ticket.outletName}. We noted your feedback regarding your recent dining experience and would love to assist you personally.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '6px 10px',
                              borderRadius: 8,
                              background: 'rgba(37, 211, 102, 0.12)',
                              border: '1px solid rgba(37, 211, 102, 0.4)',
                              color: '#25D366',
                              fontSize: 11,
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              textDecoration: 'none'
                            }}
                            title="Message on WhatsApp"
                          >
                            <MessageCircle size={12} /> WhatsApp
                          </a>

                          {/* Resolve Complaint Button */}
                          {isUrgent && (
                            <button
                              onClick={() => handleOpenResolve(ticket)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 8,
                                background: 'var(--primary)',
                                color: '#070A09',
                                border: 'none',
                                fontSize: 11,
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Resolution Modal */}
      {resolvingTicket && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 24,
            padding: 28,
            maxWidth: 520,
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'grid',
                  placeItems: 'center'
                }}>
                  <CheckCircle2 size={18} color="#10B981" />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--primary)', margin: 0 }}>
                    Resolve Guest Complaint
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Ticket #{resolvingTicket.id} · {resolvingTicket.customerName} ({resolvingTicket.customerMobile})
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setResolvingTicket(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              background: 'var(--surface-alt)',
              padding: '12px 16px',
              borderRadius: 12,
              marginBottom: 16,
              fontSize: 12.5,
              color: 'var(--text-main)',
              lineHeight: 1.4
            }}>
              <strong>Guest Complaint:</strong> "{resolvingTicket.comments}"
            </div>

            <form onSubmit={handleConfirmResolve}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                  Store Manager Resolution Notes
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe resolution taken (e.g. Guest phoned, complimentary sizzler voucher issued, staff briefed)..."
                  required
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'var(--background)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: 12,
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolve}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    background: 'var(--primary)',
                    border: 'none',
                    color: '#070A09',
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {isSubmittingResolve ? 'Saving...' : 'Mark as Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
