import React from 'react';
import { Crown, TrendingUp, Sparkles, Shield, DollarSign, Award, Users, BarChart3, Building2, Flame } from 'lucide-react';
import { KPI, Outlet } from '../types';
import { fallbackOutlets, fallbackKPIs } from '../api/client';

interface CeoPageProps {
  kpis?: KPI[];
  outlets?: Outlet[];
}

export const CeoPage: React.FC<CeoPageProps> = ({ kpis = fallbackKPIs, outlets = fallbackOutlets }) => {
  const brandPerformance = [
    { brand: 'Yanki Sizzlerr (Flagship Restaurants)', share: '58%', revenue: '₹19.14 Cr', margin: '28.4%', trend: '+14.2%', highlight: 'Sindhu Bhavan & Vastrapur' },
    { brand: 'House of Yanki Banquet & Catering', share: '24%', revenue: '₹7.92 Cr', margin: '34.8%', trend: '+22.6%', highlight: 'High-ticket corporate & wedding ODC' },
    { brand: 'Dough by Yanki (Artisanal Pizza)', share: '18%', revenue: '₹5.94 Cr', margin: '21.2%', trend: '+31.0%', highlight: 'Fastest growing repeat delivery' },
  ];

  const executiveDirectives = [
    { title: 'Signature Tier Upsell', text: '150 subscriptions due in 30 days. Automated C-09 voucher incentive expected to yield 82% renewal.', priority: 'High', date: 'Immediate' },
    { title: 'Bodakdev Banquet Expansion', text: 'Corporate wedding pipeline full through Q3 (₹2.8 Cr committed). Expand kitchen capacity.', priority: 'Strategic', date: 'Q3 FY26' },
    { title: 'Dough by Yanki Delivery Hub', text: 'BOGO voucher usage surged 42%. Opening cloud-kitchen satellite in South Bopal.', priority: 'Growth', date: 'Q4 FY26' },
  ];

  return (
    <div>
      {/* Boardroom Executive Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #063429 0%, #0E3B32 50%, #0B4438 100%)',
        borderRadius: 24,
        padding: '36px 32px',
        color: 'white',
        marginBottom: 28,
        border: '1.5px solid rgba(201, 162, 77, 0.35)',
        boxShadow: '0 16px 40px rgba(11, 68, 56, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.08, pointerEvents: 'none' }}>
          <Crown size={220} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255, 138, 0, 0.2)',
              border: '1px solid #FF8A00',
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              color: '#FF8A00',
              letterSpacing: 1.2,
              marginBottom: 14
            }}>
              <Flame size={14} />
              CEO EXECUTIVE BOARDROOM · STATE OF YANKI
            </div>
            <h2 className="serif-title" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>
              Yanki Hospitality Group
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 6, maxWidth: 620, lineHeight: 1.6 }}>
              Consolidated executive performance, subscription run-rate, and strategic brand allocations across Yanki Sizzlerr, House of Yanki Banquets, and Dough by Yanki.
            </p>
          </div>

          <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.25)', padding: '16px 24px', borderRadius: 16, border: '1px solid rgba(201, 162, 77, 0.3)' }}>
            <p style={{ fontSize: 11, color: '#C9A24D', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>ANNUAL RUN-RATE (ARR)</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: 'white', marginTop: 2 }}>₹33.00 Cr</p>
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 700 }}>+18.4% YoY Consolidated Growth</span>
          </div>
        </div>
      </div>

      {/* 4 Core Executive Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 28 }}>
        <div style={{ background: 'white', padding: 22, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 138, 0, 0.12)', display: 'grid', placeItems: 'center' }}>
              <DollarSign size={20} color="#FF8A00" />
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Net Profit Margin</h4>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>24.8%</p>
          <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>₹8.18 Cr EBITDA · +3.2% expansion</p>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(201, 162, 77, 0.15)', display: 'grid', placeItems: 'center' }}>
              <Crown size={20} color="#C9A24D" />
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Subscription ARR</h4>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>₹4.20 Cr</p>
          <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>4,582 Active Subscribers</p>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center' }}>
              <Users size={20} color="#10B981" />
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>VIP Patron Retention</h4>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>88.6%</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>3.2x higher visit cadence vs non-members</p>
        </div>

        <div style={{ background: 'white', padding: 22, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(14, 59, 50, 0.1)', display: 'grid', placeItems: 'center' }}>
              <Award size={20} color="#0E3B32" />
            </div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Avg VIP Bill Value</h4>
          </div>
          <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>₹2,840</p>
          <p style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginTop: 4 }}>+28% premium over non-member covers</p>
        </div>
      </div>

      {/* Brand Portfolio Contributions */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 26, marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)' }}>Consolidated Brand Contributions</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Revenue distribution across Yanki hospitality business units</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: 20 }}>
            Ahmedabad Region
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {brandPerformance.map((b) => (
            <div key={b.brand} style={{ padding: '16px 20px', borderRadius: 16, background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>{b.brand}</h4>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{b.highlight}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)' }}>{b.revenue}</span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                    <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>{b.trend}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>· {b.margin} margin</span>
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: 8, borderRadius: 4, background: '#E2E8F0', overflow: 'hidden' }}>
                <div style={{ width: b.share, height: '100%', background: 'linear-gradient(90deg, #FF8A00, #C9A24D)', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Board Directives */}
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid var(--border)', padding: 26 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>Strategic Executive Directives</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 18 }}>High-priority actions approved by the executive committee</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {executiveDirectives.map((d) => (
            <div key={d.title} style={{ padding: 18, borderRadius: 16, background: 'var(--background)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: d.priority === 'High' ? '#EF4444' : '#FF8A00',
                  background: d.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 138, 0, 0.1)',
                  padding: '3px 8px',
                  borderRadius: 12
                }}>
                  {d.priority} Priority
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.date}</span>
              </div>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>{d.title}</h4>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
