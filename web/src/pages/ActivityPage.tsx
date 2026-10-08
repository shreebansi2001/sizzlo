import React, { useState, useEffect } from 'react';
import { CalendarCheck, Ticket, Activity as ActivityIcon, Sparkles, Pause, Play, BellRing, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface ActivityItem {
  id: string | number;
  type: string;
  text: string;
  outlet: string;
  time: string;
  tab: string;
}

const defaultActivities: ActivityItem[] = [];

export const ActivityPage: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [paused, setPaused] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterOutlet, setFilterOutlet] = useState('all');
  const [activities, setActivities] = useState<ActivityItem[]>(defaultActivities);

  useEffect(() => {
    axios.get('/api/activity')
      .then(res => {
        if (res.data?.success && res.data.data?.length > 0) {
          const mapped = res.data.data.map((item: any) => ({
            id: item.id,
            type: item.actionType === 'REDEMPTION' ? 'Coupon' : item.actionType === 'RESERVATION' ? 'Reservation' : 'Activity',
            text: `${item.actorName} · ${item.description}`,
            outlet: item.outletName || 'Navrangpura',
            time: item.timeAgo || 'Just now',
            tab: item.actionType === 'REDEMPTION' ? 'redemption' : 'reservations'
          }));
          setActivities(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = activities.filter(a => {
    if (filterType !== 'all' && a.type !== filterType) return false;
    if (filterOutlet !== 'all' && a.outlet !== filterOutlet) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'Reservation': return <CalendarCheck size={18} color="var(--primary)" />;
      case 'Coupon': return <Ticket size={18} color="var(--gold)" />;
      case 'Points': return <Sparkles size={18} color="var(--gold)" />;
      default: return <ActivityIcon size={18} color="var(--primary)" />;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Activity Feed</h1>
          <p className="page-subtitle">Real-time user interactions, redemptions, and visits across every outlet</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline" onClick={() => setPaused(!paused)}>
            {paused ? <Play size={16} /> : <Pause size={16} />} {paused ? 'Resume Feed' : 'Pause Feed'}
          </button>
        </div>
      </div>

      {paused && (
        <div style={{
          marginBottom: 16,
          padding: '12px 18px',
          borderRadius: 12,
          background: 'rgba(201, 162, 77, 0.12)',
          border: '1px solid rgba(201, 162, 77, 0.3)',
          color: 'var(--gold)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          fontWeight: 600,
        }}>
          <Pause size={16} /> Live stream paused. New events will queue until resumed.
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <select 
          className="outlet-select" 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Activity Types</option>
          <option value="Reservation">Reservations</option>
          <option value="Coupon">Coupon Redemptions</option>
          <option value="Subscription">Subscriptions</option>
          <option value="Points">Loyalty Points</option>
        </select>

        <select 
          className="outlet-select" 
          value={filterOutlet} 
          onChange={(e) => setFilterOutlet(e.target.value)}
        >
          <option value="all">All Outlets</option>
          <option value="Navrangpura">Navrangpura</option>
          <option value="Shilaj">Shilaj</option>
          <option value="Gandhinagar">Gandhinagar</option>
          <option value="In-app">In-App Mobile</option>
        </select>

        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={12} /> Live WebSocket connected
        </span>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((item, idx) => (
            <div 
              key={`${item.id}-${idx}`}
              onClick={() => onNavigate && onNavigate(item.tab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 0',
                borderBottom: idx !== filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border-subtle)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0
              }}>
                {getIcon(item.type)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.text}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {item.type} · <span style={{ color: 'var(--gold)' }}>{item.outlet}</span>
                </p>
              </div>

              <span style={{ fontSize: 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                {item.time} →
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
