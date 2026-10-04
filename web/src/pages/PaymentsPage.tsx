import React, { useState } from 'react';
import { Send, MessageCircle, Phone, Check, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { PendingPayment } from '../types';

interface PaymentsPageProps {
  payments: PendingPayment[];
}

export const PaymentsPage: React.FC<PaymentsPageProps> = ({ payments }) => {
  const [paymentList, setPaymentList] = useState<PendingPayment[]>(payments);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const totalOutstanding = paymentList.reduce((sum, p) => sum + p.pending, 0);

  const handleAction = (customer: string, action: string) => {
    setActionNotice(`${action} initiated for ${customer}`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleMarkPaid = (id: string, name: string) => {
    setPaymentList(paymentList.filter(p => p.id !== id));
    setActionNotice(`Payment received and cleared for ${name}!`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div>
      {/* Action Notification */}
      {actionNotice && (
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
          <Check size={16} color="var(--gold-dark)" />
          {actionNotice}
        </div>
      )}

      {/* Top 4 Metric Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'TOTAL OUTSTANDING', val: `₹${(totalOutstanding / 1000).toFixed(0)},000`, sub: `${paymentList.length} accounts pending` },
          { label: 'OVERDUE (30D+)', val: `₹${Math.round(totalOutstanding * 0.4 / 1000)},000`, sub: 'Requires immediate follow-up' },
          { label: 'RECOVERED THIS MONTH', val: '₹2,84,000', sub: '+14% vs last cycle' },
          { label: 'AVG COLLECTION DURATION', val: '4.2 Days', sub: 'Industry best benchmark' },
        ].map((m) => (
          <div key={m.label} className="kpi-card">
            <span className="kpi-label">{m.label}</span>
            <div className="kpi-value" style={{ marginTop: 6, fontSize: 24 }}>{m.val}</div>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <div style={{
        background: 'white',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Outstanding Subscriber Dues</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automated payment collection reminders via WhatsApp, SMS, and Email</p>
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            background: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--danger)',
            padding: '4px 10px',
            borderRadius: 20
          }}>
            {paymentList.length} Pending Actions
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount Due</th>
                <th>Plan Tier</th>
                <th>Due Date</th>
                <th>Reminder Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentList.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.id} · {p.mobile}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--danger)' }}>
                      ₹{p.pending.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      background: 'rgba(0, 29, 74, 0.08)',
                      color: 'var(--primary)',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      VIP Annual
                    </span>
                  </td>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{p.dueDate}</td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: p.reminder.includes('today') ? 'var(--warning)' : 'var(--text-muted)'
                    }}>
                      {p.reminder}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAction(p.name, 'Email reminder')}
                        title="Send Email"
                        style={{
                          background: 'white',
                          border: '1px solid var(--border)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        <Send size={12} /> Email
                      </button>

                      <button
                        onClick={() => handleAction(p.name, 'WhatsApp nudge')}
                        title="WhatsApp Reminder"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#059669',
                          padding: '6px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        <MessageCircle size={12} /> WhatsApp
                      </button>

                      <button
                        onClick={() => handleAction(p.name, 'Payment link copy')}
                        title="Copy Payment Link"
                        style={{
                          background: 'white',
                          border: '1px solid var(--border)',
                          padding: '6px 10px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        <LinkIcon size={12} /> Pay Link
                      </button>

                      <button
                        onClick={() => handleMarkPaid(p.id, p.name)}
                        title="Mark Paid"
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700
                        }}
                      >
                        <Check size={12} /> Mark Paid
                      </button>
                    </div>
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
