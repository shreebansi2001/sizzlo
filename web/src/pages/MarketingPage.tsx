import React, { useState, useEffect } from 'react';
import { 
  Megaphone, MessageCircle, Bell, Cake, RefreshCw, Send, 
  CheckCircle2, User, Users, Smartphone, Sparkles, AlertCircle, Crown, Gift, Tag, Clock 
} from 'lucide-react';
import { MarketingChannel, CampaignPreset } from '../types';
import { sendNotification, fetchNotificationHistory } from '../api/client';

interface MarketingPageProps {
  channels?: MarketingChannel[];
  presets?: CampaignPreset[];
}

interface DispatchedLog {
  id: number;
  title: string;
  target: string;
  type: string;
  channel: string;
  time: string;
  message?: string;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ channels, presets: initialPresets }) => {
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Send Notification Form State
  const [targetType, setTargetType] = useState<'ALL' | 'VIP' | 'FREE' | 'SPECIFIC'>('ALL');
  const [targetInput, setTargetInput] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'tag' | 'gift' | 'sparkle' | 'alert' | 'card'>('tag');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Broadcast History
  const [recentDispatches, setRecentDispatches] = useState<DispatchedLog[]>([
    {
      id: 1,
      title: 'Weekend Sizzler Festival 20% Off',
      target: 'All Registered Users (Broadcast)',
      type: 'TAG',
      channel: 'Push Notification + WhatsApp',
      time: '10 mins ago',
      message: 'Flat 20% privilege discount on all artisanal sizzler combos across all Yanki outlets.'
    },
    {
      id: 2,
      title: 'VIP Sparkling Sunday Brunch Priority Pass',
      target: 'VIP Subscribers Only',
      type: 'GIFT',
      channel: 'Push Notification + WhatsApp',
      time: '2 hours ago',
      message: 'Reserve exclusive priority seating for Yanki Sparkling Sunday Brunch at CG Road.'
    },
  ]);

  const loadHistory = async () => {
    try {
      const history = await fetchNotificationHistory();
      if (history && history.length > 0) {
        const formatted: DispatchedLog[] = history.map((h: any) => ({
          id: h.id,
          title: h.title,
          target: h.targetType === 'ALL' 
            ? 'All Registered Users (Broadcast)' 
            : h.targetType === 'VIP' 
              ? 'VIP Subscribers Only' 
              : h.targetType === 'FREE' 
                ? 'Non-Subscribed (Free Users)' 
                : (h.targetMobile || h.targetMembershipId || 'Specific User'),
          type: (h.type || 'TAG').toUpperCase(),
          channel: h.sendWhatsApp ? 'Push Notification + WhatsApp' : 'In-App Mobile Push',
          time: h.createdAt ? new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
          message: h.description,
        }));
        setRecentDispatches(formatted);
      }
    } catch (_) {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const templates = [
    {
      label: '🔥 Weekend Sizzler Discount',
      title: 'Weekend Sizzler Festival: Flat 20% Off',
      message: 'Enjoy a flat 20% privilege discount on all artisanal sizzler combos across all Yanki Sizzlerr and Dough outlets this weekend!',
      category: 'tag' as const,
      audience: 'ALL' as const
    },
    {
      label: '🥂 Sunday Brunch Invite',
      title: 'Exclusive VIP Sunday Brunch Pass',
      message: 'Join our signature Sunday Brunch buffet with live sizzler grill stations, artisanal desserts & jazz music. Priority table passes are now live!',
      category: 'gift' as const,
      audience: 'VIP' as const
    },
    {
      label: '✨ Upgrade to VIP Offer',
      title: 'Unlock 12 Complimentary Dining Vouchers',
      message: 'Upgrade to Yanki Signature or Elite VIP today and receive 12 exclusive 10% dining discount passes and free birthday dinner rewards!',
      category: 'card' as const,
      audience: 'FREE' as const
    },
    {
      label: '🌟 2X Loyalty Points Flash',
      title: 'Flash Alert: 2X Loyalty Points Active!',
      message: 'Earn double loyalty points on every ₹1 spent at all House of Yanki restaurants for the next 48 hours. Fast-track your free annual renewal!',
      category: 'sparkle' as const,
      audience: 'ALL' as const
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
    setCategory(tpl.category);
    setTargetType(tpl.audience);
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
      const targetLabel = targetType === 'ALL' 
        ? 'All Registered Users' 
        : targetType === 'VIP' 
          ? 'VIP Subscribers' 
          : targetType === 'FREE' 
            ? 'Free Users' 
            : targetInput;

      setBroadcastNotice(`✅ Notification broadcast successfully dispatched to ${targetLabel}!`);
      setRecentDispatches((prev) => [
        {
          id: Date.now(),
          title: title.trim(),
          target: targetLabel,
          type: category.toUpperCase(),
          channel: sendWhatsApp ? 'Push Notification + WhatsApp' : 'In-App Mobile Push',
          time: 'Just now',
          message: message.trim(),
        },
        ...prev,
      ]);
      setTitle('');
      setMessage('');
      if (targetType === 'SPECIFIC') setTargetInput('');
      await loadHistory();
    } else {
      setBroadcastNotice(`⚠️ Notice: ${res.message || 'Notification queued.'}`);
    }

    setIsSending(false);
    setTimeout(() => setBroadcastNotice(null), 5000);
  };

  const defaultPresets = initialPresets && initialPresets.length > 0 ? initialPresets : [
    { name: 'VIP Birthday Week Surprise', tag: 'BIRTHDAY', desc: 'Auto-delivers a complimentary couple meal and celebration dessert voucher 7 days prior to registered birth date.' },
    { name: 'Subscription Renewal Alert', tag: 'RENEWAL', desc: 'Notifies patrons 30, 15, and 3 days before annual VIP subscription expiry with instant online renewal links.' },
    { name: 'Points Expiry & Extension', tag: 'RETENTION', desc: 'Encourages patrons with >10,000 unredeemed loyalty points to book a table before end of fiscal quarter.' }
  ];

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
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--primary)' }}>Push &amp; WhatsApp Notification Broadcast Console</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Send instant mobile push alerts and WhatsApp updates to your audience in real time</p>
              </div>
            </div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', padding: '6px 14px', borderRadius: 20 }}>
            ● Live Push Gateway Active
          </span>
        </div>

        {/* Quick Broadcast Templates */}
        <div style={{ marginBottom: 20, background: 'var(--surface-alt)', padding: 14, borderRadius: 14, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: 8 }}>
            Quick Broadcast Templates
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {templates.map(t => (
              <button
                key={t.label}
                type="button"
                onClick={() => handleApplyTemplate(t)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Target Audience Tabs */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Recipient Audience
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              <button
                type="button"
                onClick={() => setTargetType('ALL')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: targetType === 'ALL' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: targetType === 'ALL' ? 'rgba(255, 138, 0, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'ALL' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: targetType === 'ALL' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 12
                }}
              >
                <Users size={16} />
                <span>All Users (Broadcast)</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('VIP')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: targetType === 'VIP' ? '2px solid var(--gold)' : '1px solid var(--border)',
                  background: targetType === 'VIP' ? 'rgba(232, 184, 74, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'VIP' ? 'var(--gold)' : 'var(--text-main)',
                  fontWeight: targetType === 'VIP' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 12
                }}
              >
                <Crown size={16} />
                <span>VIP Subscribers Only</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('FREE')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: targetType === 'FREE' ? '2px solid #94A3B8' : '1px solid var(--border)',
                  background: targetType === 'FREE' ? 'rgba(148, 163, 184, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'FREE' ? '#CBD5E1' : 'var(--text-main)',
                  fontWeight: targetType === 'FREE' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 12
                }}
              >
                <Sparkles size={16} />
                <span>Free Users Only</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('SPECIFIC')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: targetType === 'SPECIFIC' ? '2px solid var(--primary)' : '1px solid var(--border)',
                  background: targetType === 'SPECIFIC' ? 'rgba(255, 138, 0, 0.12)' : 'var(--surface-alt)',
                  color: targetType === 'SPECIFIC' ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: targetType === 'SPECIFIC' ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: 12
                }}
              >
                <User size={16} />
                <span>Specific User</span>
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
                placeholder="e.g. Weekend Sizzler Festival: Flat 20% Off"
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
                Also dispatch via WhatsApp Gateway to registered customer phone numbers
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
              {isSending ? 'Dispatching Broadcast...' : 'Broadcast Real-Time Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* Broadcast Delivery History */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        padding: 24,
        marginBottom: 28,
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>Dispatched Broadcast History</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time telemetry of recent notifications sent to app users</p>
          </div>
          <button
            onClick={loadHistory}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentDispatches.map((log) => (
            <div key={log.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
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
                    {log.message && <span style={{ marginLeft: 6, color: 'var(--text-dim)' }}>— "{log.message}"</span>}
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
          {defaultPresets.map((p) => {
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
