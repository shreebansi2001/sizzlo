import React from 'react';
import { Star, Calendar, MessageSquare, ThumbsUp } from 'lucide-react';
import { FeedbackItem } from '../types';

interface FeedbackPageProps {
  feedbacks: FeedbackItem[];
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ feedbacks }) => {
  return (
    <div>
      {/* Metrics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="kpi-card">
          <span className="kpi-label">OVERALL SATISFACTION</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <div className="kpi-value" style={{ fontSize: 26 }}>4.8</div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} fill="var(--gold)" color="var(--gold)" />
              ))}
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Based on 1,248 verified patron reviews</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">NET PROMOTER SCORE (NPS)</span>
          <div className="kpi-value" style={{ fontSize: 26, marginTop: 6 }}>+78</div>
          <span style={{ fontSize: 11, color: '#059669', fontWeight: 600, marginTop: 4, display: 'block' }}>Top 5% in luxury hospitality</span>
        </div>

        <div className="kpi-card">
          <span className="kpi-label">RESPONSE RESOLUTION</span>
          <div className="kpi-value" style={{ fontSize: 26, marginTop: 6 }}>98.4%</div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>Average reply time: &lt; 2 hours</span>
        </div>
      </div>

      {/* Feedback Records Table */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Subscriber Reviews &amp; Hospitality Feedback</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time sentiment monitoring across table visits and online reservations</p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Star Rating</th>
                <th>Overall Verdict</th>
                <th style={{ width: '40%' }}>Patron Comment</th>
                <th>Date Submitted</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {item.profile?.full_name ?? 'VIP Connoisseur'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {item.profile?.membership_id ?? item.id}
                      {item.profile?.mobile && ` · ${item.profile.mobile}`}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={16} fill="var(--gold)" color="var(--gold)" />
                      <span style={{ fontWeight: 800, fontSize: 14 }}>{item.rating}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 5</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: 20,
                      background: item.overall_rating === 'Excellent' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(232, 184, 74, 0.2)',
                      color: item.overall_rating === 'Excellent' ? '#059669' : 'var(--gold-dark)'
                    }}>
                      {item.overall_rating}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.4 }}>
                      "{item.comment}"
                    </p>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} />
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
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
