import React from 'react';
import { Crown, TrendingUp, Sparkles, Shield, DollarSign } from 'lucide-react';
import { KPI, Outlet } from '../types';

interface CeoPageProps {
  kpis: KPI[];
  outlets: Outlet[];
}

export const CeoPage: React.FC<CeoPageProps> = ({ kpis, outlets }) => {
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #00122E 0%, #001D4A 60%, #0A3175 100%)',
        borderRadius: 24,
        padding: 32,
        color: 'white',
        marginBottom: 28,
        border: '1px solid rgba(232, 184, 74, 0.3)',
        boxShadow: '0 12px 30px rgba(0, 29, 74, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(232, 184, 74, 0.15)', border: '1px solid rgba(232, 184, 74, 0.4)', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#E8B84A', marginBottom: 12 }}>
              <Crown size={13} />
              EXECUTIVE BOARD BRIEFING
            </div>
            <h2 className="serif-title" style={{ fontSize: 28, fontWeight: 700 }}>Hospitality Group Executive Suite</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4, maxWidth: 600 }}>
              Consolidated financial health, VIP patron retention, and forward quarter projections for Sizzlo &amp; Yanki Brands.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>ANNUAL RUN-RATE</p>
            <p style={{ fontSize: 32, fontWeight: 800, color: '#E8B84A' }}>₹33.0 Cr</p>
            <span style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>+18.4% YoY Growth</span>
          </div>
        </div>
      </div>

      {/* Strategic Insights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'grid', placeItems: 'center' }}>
              <DollarSign size={20} color="#10B981" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Gross Margins</h3>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>64.2%</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>+2.1% expansion driven by banquet bookings and beverage contribution</p>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232, 184, 74, 0.15)', display: 'grid', placeItems: 'center' }}>
              <Sparkles size={20} color="#BF8E22" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Member Retention Rate</h3>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>88.6%</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Industry benchmark: 65%. Sizzlo loyalty program drives 2.8x repeat frequency</p>
        </div>

        <div style={{ background: 'white', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(0, 29, 74, 0.1)', display: 'grid', placeItems: 'center' }}>
              <Shield size={20} color="#001D4A" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Net Promoter Score</h3>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>+78 NPS</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Rated world-class across dining ambiance, host greeting, and culinary standard</p>
        </div>
      </div>
    </div>
  );
};
