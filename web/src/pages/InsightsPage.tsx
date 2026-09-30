import React from 'react';
import { Sparkles, ArrowRight, Zap, Lightbulb } from 'lucide-react';
import { AIInsight } from '../types';

interface InsightsPageProps {
  insights: AIInsight[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ insights }) => {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>AI Predictive Hospitality Analytics</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automated intelligence analyzing member spend patterns, churn signals, and revenue opportunities</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
        {insights.map((item, idx) => {
          const isGold = item.tone === 'gold';
          return (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: 20,
                border: isGold ? '1px solid rgba(232, 184, 74, 0.4)' : '1px solid var(--border)',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: isGold ? 'rgba(232, 184, 74, 0.15)' : 'rgba(0, 29, 74, 0.08)',
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    {isGold ? <Zap size={16} color="#BF8E22" /> : <Lightbulb size={16} color="#001D4A" />}
                  </div>
                  <span className={`badge ${isGold ? 'badge-gold' : 'badge-royal'}`}>
                    AI Actionable
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.body}</p>
              </div>

              <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" style={{ fontSize: 12, padding: '6px 12px' }}>
                  Execute Action
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
