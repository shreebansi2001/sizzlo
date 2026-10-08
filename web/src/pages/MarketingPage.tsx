import React, { useState } from 'react';
import { Megaphone, MessageCircle, Bell, Cake, RefreshCw, Send, CheckCircle2, User, Users, Smartphone, Sparkles, AlertCircle } from 'lucide-react';
import { MarketingChannel, CampaignPreset } from '../types';
import { sendNotification } from '../api/client';

interface MarketingPageProps {
  channels: MarketingChannel[];
  presets: CampaignPreset[];
}

interface DispatchedLog {
  id: number;
  title: string;
  target: string;
  type: string;
  channel: string;
  time: string;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ channels, presets }) => {
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Send Notification Form State
  const [targetType, setTargetType] = useState<'ALL' | 'SPECIFIC'>('ALL');
  const [targetInput, setTargetInput] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'tag' | 'gift' | 'sparkle' | 'alert' | 'card'>('tag');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Local history of sent notifications
  const [recentDispatches, setRecentDispatches] = useState<DispatchedLog[]>([
    {
      id: 1,
      title: 'Weekend Sizzler Festival 20% Off',
      target: 'All Registered Users (Broadcast)',
      type: 'Offer Voucher',
      channel: 'Push Notification + WhatsApp',
      time: '10 mins ago',
    },
    {
      id: 2,
      title: 'VIP Anniversary Dine-in Complimentary Dessert',
      target: 'Rahul Mehta (+91 98250 12345)',
      type: 'VIP Privilege',
      channel: 'WhatsApp & App Vault',
      time: '2 hours ago',
    },
  ]);

  const handleLaunch = (channelName: string) => {
    setBroadcastNotice(`Broadcast dispatched via ${channelName}! Audience telemetry active.`);
    setTimeout(() => setBroadcastNotice(null), 4000);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please provide both Title and Message.');
      return;
    }

    if (targetType === 'SPECIFIC' && !targetInput.trim()) {
      alert('Please specify the recipient Mobile Number or Membership ID.');
      return;
    }

    setIsSending(true);

    const isMemId = targetInput.toUpperCase().startsWith('YSM');
    const payload = {
      targetType,
      targetMembershipId: targetType === 'SPECIFIC' && isMemId ? targetInput.trim() : undefined,
      targetMobile: targetType === 'SPECIFIC' && !isMemId ? targetInput.trim() : undefined,
      title: title.trim(),
      message: message.trim(),
      type: category,
      sendWhatsApp,
    };

    const res = await sendNotification(payload);

    if (res.success) {
      setBroadcastNotice(`✅ Notification successfully dispatched! ${targetType === 'ALL' ? 'Broadcast to all users.' : `Sent to ${targetInput}`}`);
      setRecentDispatches((prev) => [
        {
          id: Date.now(),
          title: title.trim(),
          target: targetType === 'ALL' ? 'All Registered Users (Broadcast)' : targetInput.trim(),
          type: category.toUpperCase(),
          channel: sendWhatsApp ? 'Push Notification + WhatsApp' : 'In-App Push Notification',
          time: 'Just now',
        },
        ...prev,
      ]);
      setTitle('');
      setMessage('');
      if (targetType === 'SPECIFIC') setTargetInput('');
    } else {
      setBroadcastNotice(`⚠️ Notice: ${res.message || 'Notification queued.'}`);
    }

    setIsSending(false);
    setTimeout(() => setBroadcastNotice(null), 5000);
  };

  return (
    <div>
      {/* Broadcast Alert */}
      {broadcastNotice && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          color: '#10B981',
          padding: '14px 20px',
          borderRadius: 12,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
        }}>
          <CheckCircle2 size={18} color="#10B981" />
          {broadcastNotice}
        </div>
      )}

      {/* Direct Push & WhatsApp Dispatcher Console */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        marginBottom: 28,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255, 138, 0, 0.15)', display: 'grid', placeItems: 'center' }}>
                <Send size={18} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)' }}>Push & WhatsApp Notification Dispatcher</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Send instant mobile push alerts and WhatsApp updates to all members or a specific user</p>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 14px', borderRadius: 20 }}>
            ● Live Gateway Active
          </span>
        </div>

        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Target Audience Tabs */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Recipient Audience
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: targetType === 'ALL' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: targetType === 'ALL' ? 'rgba(255, 138, 0, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'ALL' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: targetType === 'ALL' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Users size={18} />
                <span>All Registered Users (Broadcast)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('SPECIFIC')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: targetType === 'SPECIFIC' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: targetType === 'SPECIFIC' ? 'rgba(255, 138, 0, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'SPECIFIC' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: targetType === 'SPECIFIC' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <User size={18} />
                <span>Particular User (Direct)</span>
              </button>
            </div>
          </div>

          {/* If specific, show phone/membership ID input */}
          {targetType === 'SPECIFIC' && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Recipient Mobile Number or Membership ID <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 9825012345 or YSM-2024-04821"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Form Row: Title & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Notification Title <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. New Privilege Offer: 20% Off at Bodakdev"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
                Category Icon
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 14,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="tag">🏷️ Discount / Voucher</option>
                <option value="gift">🎁 VIP Privilege</option>
                <option value="sparkle">✨ Loyalty Reward</option>
                <option value="card">💳 Subscription / Card</option>
                <option value="alert">🔔 Important Alert</option>
              </select>
            </div>
          </div>

          {/* Message Content */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>
              Message Body <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Enjoy 20% savings on your dining bill across all Yanki Sizzlerr and Dough outlets this weekend!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* WhatsApp Integration Toggle & Submit */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#10B981', cursor: 'pointer' }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                Also dispatch via WhatsApp Official Gateway to registered number
              </span>
            </label>

            <button
              type="submit"
              disabled={isSending}
              className="btn btn-primary"
              style={{
                padding: '12px 28px',
                fontSize: 14,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: 12,
                cursor: isSending ? 'not-allowed' : 'pointer',
                opacity: isSending ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              {isSending ? 'Dispatching...' : 'Send Real-Time Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* 3 Channel Metrics Cards */}
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
                  Quick Ping
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatched History Log */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        marginBottom: 28,
        boxShadow: 'var(--shadow-card)'
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>
          Recent Notification Broadcast History
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {recentDispatches.map((log) => (
            <div key={log.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: 14,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.15)', display: 'grid', placeItems: 'center' }}>
                  <Bell size={18} color="#10B981" />
                </div>
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>{log.title}</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Target: <strong style={{ color: 'var(--gold)' }}>{log.target}</strong> · Channel: {log.channel}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{log.time}</span>
            </div>
          ))}
        </div>
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
