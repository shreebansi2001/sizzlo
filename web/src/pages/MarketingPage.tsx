import React, { useState } from 'react';
import { Megaphone, MessageCircle, Bell, Cake, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { MarketingChannel, CampaignPreset } from '../types';

interface MarketingPageProps {
  channels: MarketingChannel[];
  presets: CampaignPreset[];
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ channels, presets }) => {
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  const handleLaunch = (channelName: string) => {
    setBroadcastNotice(`Broadcast dispatched via ${channelName}! Audience telemetry active.`);
    setTimeout(() => setBroadcastNotice(null), 4000);
  };

  return (
    <div>
      {/* Broadcast Alert */}
      {broadcastNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10B981',
          color: '#065F46',
          padding: '12px 18px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          {broadcastNotice}
        </div>
      )}

      {/* 3 Channel Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {channels.map((c) => {
          const isWhatsApp = c.name.includes('WhatsApp');
          const isPush = c.name.includes('Push');
          const Icon = isWhatsApp ? MessageCircle : isPush ? Bell : Send;

          return (
            <div key={c.name} style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: isWhatsApp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 138, 0, 0.12)',
                    display: 'grid',
                    placeItems: 'center'
                  }}>
                    <Icon size={22} color={isWhatsApp ? '#10B981' : 'var(--primary)'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>{c.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Verified audience: {c.reach}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Open Rate
                  </span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{c.open}</div>
                </div>
                <button
                  onClick={() => handleLaunch(c.name)}
                  className="primary-btn"
                  style={{ fontSize: 12, padding: '8px 16px' }}
                >
                  Broadcast
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Automated Campaigns List */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Automated VIP Engagement Journeys</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Event-triggered notifications delivering bespoke dining incentives</p>
          </div>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            background: 'rgba(201, 162, 77, 0.15)',
            color: 'var(--gold)',
            padding: '4px 12px',
            borderRadius: 20
          }}>
            3 Active Automated Flows
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {presets.map((p) => {
            const isBirthday = p.name.includes('Birthday');
            const isRenewal = p.name.includes('Renewal');
            const Icon = isBirthday ? Cake : isRenewal ? RefreshCw : Megaphone;

            return (
              <div key={p.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 16,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)'
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'grid',
                  placeItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <Icon size={20} color="var(--gold)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(255, 138, 0, 0.15)',
                      color: 'var(--primary)'
                    }}>
                      {p.tag}
                    </span>
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{p.name}</h4>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.desc}</p>
                </div>
                <button
                  onClick={() => setBroadcastNotice(`Edited automated journey for: ${p.name}`)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Configure
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
