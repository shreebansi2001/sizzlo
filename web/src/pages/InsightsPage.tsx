import React from 'react';
import { Sparkles, Brain, Cpu, Zap, TrendingUp, ShieldCheck, Clock, Layers } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const upcomingCapabilities = [
    {
      icon: TrendingUp,
      tag: 'CAPACITY & SURGE',
      title: 'Dynamic Yield & Table Load Balancing',
      description: 'Predicts high-traffic rush hours across Bodakdev, SG Highway & Bopal Banquets, automatically tuning reservation buffer margins to maximize table turnover.',
      status: 'In Training',
      eta: 'v2.1 Release',
    },
    {
      icon: Zap,
      tag: 'RETENTION RADAR',
      title: 'Predictive VIP Churn & Automated Rewards',
      description: 'Identifies patrons at risk of lapsing based on 60-day visit cadence anomalies and automatically prepares customized dining incentives.',
      status: 'Pipeline Active',
      eta: 'v2.1 Release',
    },
    {
      icon: ShieldCheck,
      tag: 'REVENUE ACCELERATOR',
      title: 'Banquet Lead Conversion & Upsell Scoring',
      description: 'Scores corporate & wedding inquiries using historical banquet party sizes and spend profiles, recommending optimal menu packages.',
      status: 'Beta Testing',
      eta: 'v2.2 Release',
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 40 }}>
      {/* Hero Coming Soon Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0A241C 0%, #12382C 50%, #081B15 100%)',
          borderRadius: 24,
          padding: '48px 36px',
          border: '1.5px solid rgba(201, 162, 77, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.05, pointerEvents: 'none' }}>
          <Brain size={300} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 138, 0, 0.15)',
              border: '1px solid rgba(255, 138, 0, 0.5)',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              color: '#FF8A00',
              letterSpacing: 1.2,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF8A00',
                boxShadow: '0 0 10px #FF8A00',
                display: 'inline-block',
              }}
            />
            COMING SOON · AI ENGINE 2.0
          </div>

          <h2
            className="serif-title"
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: -0.5,
              color: '#FFFFFF',
              marginBottom: 12,
            }}
          >
            AI Predictive Hospitality Intelligence
          </h2>

          <p
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 15,
              lineHeight: 1.7,
              marginBottom: 24,
            }}
          >
            We are training deep learning algorithms on member dining frequencies, average bill values, and reservation patterns to unlock autonomous revenue optimization for Yanki Hospitality Group.
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(201, 162, 77, 0.3)',
              padding: '10px 18px',
              borderRadius: 14,
              color: 'var(--gold)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Clock size={16} />
            <span>Deployment Target: Q4 FY26 · Active Model Architecture Finalization</span>
          </div>
        </div>
      </div>

      {/* Feature Preview Header */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>
            Upcoming Autonomous Capabilities
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Preview of intelligence modules currently under development for the Sizzlo Admin Suite
          </p>
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#10B981',
            background: 'rgba(16, 185, 129, 0.1)',
            padding: '6px 12px',
            borderRadius: 20,
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          Phase 2 Engineering Pipeline
        </span>
      </div>

      {/* 3 Upcoming Modules Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {upcomingCapabilities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1px solid var(--border)',
                padding: 24,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'rgba(201, 162, 77, 0.12)',
                      border: '1px solid rgba(201, 162, 77, 0.25)',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Icon size={20} color="var(--gold)" />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 0.8,
                      color: 'var(--gold)',
                      background: 'rgba(201, 162, 77, 0.12)',
                      padding: '4px 10px',
                      borderRadius: 12,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>
                  {item.title}
                </h4>

                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 14,
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cpu size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{item.status}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
                  {item.eta}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
