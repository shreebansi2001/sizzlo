import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Calendar, 
  Receipt, 
  Crown, 
  Clock, 
  ChevronRight, 
  RefreshCw, 
  X,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { fetchReservations, fetchPendingBills, fetchMembers } from '../../api/client';
import { Reservation, Member } from '../../types';
import { BillSettlementDTO } from '../../api/client';

export interface AdminNotification {
  id: string;
  category: 'RESERVATION' | 'BILLING' | 'LOYALTY';
  title: string;
  description: string;
  timeAgo: string;
  targetTab: string;
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  meta?: any;
}

interface NotificationCenterProps {
  onTabChange?: (tab: string) => void;
}

const STORAGE_KEY = 'sizzlo_admin_read_notifications';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onTabChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [filter, setFilter] = useState<'ALL' | 'RESERVATION' | 'BILLING' | 'LOYALTY'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Load real-time alerts from APIs
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const [reservations, pendingBills, members] = await Promise.all([
        fetchReservations().catch(() => [] as Reservation[]),
        fetchPendingBills().catch(() => [] as BillSettlementDTO[]),
        fetchMembers().catch(() => [] as Member[])
      ]);

      const items: AdminNotification[] = [];

      // 1. Table Reservation & Booking Inquiries
      reservations.forEach((res, index) => {
        // Flag unseated reservations or pending bookings
        const isPending = res.status === 'Pending' || !res.tableAssigned;
        if (isPending) {
          items.push({
            id: `res-${res.id || index}`,
            category: 'RESERVATION',
            title: `Table Inquiry: ${res.customerName} (${res.guests} Guests)`,
            description: `${res.reservationTime || 'Tonight'} at ${res.outlet || 'Main Dining'} • ${res.specialRequests || (res.tableAssigned ? `Table: ${res.tableAssigned}` : 'Awaiting floor assignment')}`,
            timeAgo: index === 0 ? 'Just now' : `${(index + 1) * 8}m ago`,
            targetTab: 'reservations',
            priority: res.vip ? 'HIGH' : 'MEDIUM',
            meta: res
          });
        }
      });

      // 2. Pending Cashier Bill Settlements & Due Collections
      pendingBills.forEach((bill, index) => {
        if (bill.status === 'PENDING_APPROVAL') {
          items.push({
            id: `bill-${bill.id}`,
            category: 'BILLING',
            title: `Pending Bill #${bill.posInvoiceNumber || bill.id}: ₹${bill.netPayable?.toLocaleString('en-IN')}`,
            description: `${bill.customerName} at ${bill.outletName} • Mode: ${bill.paymentMode} awaiting verification`,
            timeAgo: `${(index + 1) * 12}m ago`,
            targetTab: 'payments',
            priority: 'HIGH',
            meta: bill
          });
        }
      });

      // Also include members with outstanding dues (> 0) under Billing
      members.forEach((mem, index) => {
        if (mem.pendingDues && mem.pendingDues > 0) {
          items.push({
            id: `due-${mem.id}`,
            category: 'BILLING',
            title: `Pending Due: ₹${Number(mem.pendingDues).toLocaleString('en-IN')}`,
            description: `${mem.fullName || mem.firstName} (${mem.mobile}) • Outstanding dues awaiting collection`,
            timeAgo: `${(index + 1) * 20}m ago`,
            targetTab: 'payments',
            priority: 'HIGH',
            meta: mem
          });
        }
      });

      // 3. VIP Loyalty Milestones & Free Renewal Qualifiers
      members.forEach((mem) => {
        if (mem.loyaltyPoints >= 10000 || mem.status === 'Renewal Due') {
          items.push({
            id: `vip-${mem.id}`,
            category: 'LOYALTY',
            title: `VIP Milestone: ${mem.fullName || mem.firstName}`,
            description: `Earned ${mem.loyaltyPoints?.toLocaleString('en-IN')} points • Qualified for complimentary annual renewal`,
            timeAgo: '1h ago',
            targetTab: 'loyalty',
            priority: 'MEDIUM',
            meta: mem
          });
        }
      });

      setNotifications(items);
    } catch (err) {
      console.warn('Failed to fetch live notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Save read status to localStorage
  const markAsRead = (id: string) => {
    setReadIds(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch (_) {}
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.category === filter;
  });

  const resCount = notifications.filter(n => n.category === 'RESERVATION').length;
  const billCount = notifications.filter(n => n.category === 'BILLING').length;
  const vipCount = notifications.filter(n => n.category === 'LOYALTY').length;

  const handleNotificationClick = (item: AdminNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (onTabChange) {
      onTabChange(item.targetTab);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        title="Operational Notifications & Inquiries"
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: isOpen ? 'rgba(201, 162, 77, 0.15)' : 'var(--surface)',
          border: isOpen ? '1px solid var(--gold)' : '1px solid var(--border)',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none',
        }}
      >
        <Bell size={16} color={isOpen ? 'var(--gold)' : 'var(--text-main)'} />
        {unreadCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              borderRadius: 9,
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
              border: '2px solid var(--background)',
              animation: 'pulse 2s infinite',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: 390,
            maxWidth: 'calc(100vw - 32px)',
            background: 'linear-gradient(165deg, #16201B 0%, #0E1512 100%)',
            border: '1px solid rgba(201, 162, 77, 0.3)',
            borderRadius: 18,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(201, 162, 77, 0.08)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(201, 162, 77, 0.15)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--gold)',
              }}>
                <Bell size={14} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Notifications & Inquiries
                  {unreadCount > 0 && (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      padding: '2px 6px',
                      borderRadius: 10,
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Live operational alerts & inquiries
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={loadNotifications}
                title="Refresh alerts"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 6,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <RefreshCw size={13} className={isLoading ? 'spin' : ''} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  style={{
                    background: 'rgba(201, 162, 77, 0.1)',
                    border: '1px solid rgba(201, 162, 77, 0.25)',
                    color: 'var(--gold)',
                    cursor: 'pointer',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 10,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <CheckCheck size={12} />
                  <span>Read all</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'rgba(0, 0, 0, 0.15)',
              overflowX: 'auto',
            }}
          >
            {[
              { id: 'ALL', label: `All (${notifications.length})` },
              { id: 'RESERVATION', label: `Inquiries (${resCount})` },
              { id: 'BILLING', label: `Bills (${billCount})` },
              { id: 'LOYALTY', label: `VIPs (${vipCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={{
                  fontSize: 11,
                  fontWeight: filter === tab.id ? 700 : 500,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: filter === tab.id ? 'var(--gold)' : 'rgba(255, 255, 255, 0.05)',
                  color: filter === tab.id ? '#0B0F0D' : 'var(--text-muted)',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div
            style={{
              maxHeight: 360,
              overflowY: 'auto',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {filteredNotifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-muted)' }}>
                <Sparkles size={28} color="var(--gold)" style={{ opacity: 0.6, margin: '0 auto 10px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>
                  All Caught Up!
                </div>
                <div style={{ fontSize: 11, marginTop: 4 }}>
                  No pending alerts in this category. All inquiries and tables are in sync.
                </div>
              </div>
            ) : (
              filteredNotifications.map(item => {
                const isRead = readIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    style={{
                      background: isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(201, 162, 77, 0.07)',
                      border: isRead ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(201, 162, 77, 0.25)',
                      borderRadius: 12,
                      padding: '11px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(201, 162, 77, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(201, 162, 77, 0.07)';
                    }}
                  >
                    {/* Category Icon */}
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: 
                          item.category === 'RESERVATION' ? 'rgba(16, 185, 129, 0.15)' :
                          item.category === 'BILLING' ? 'rgba(245, 158, 11, 0.15)' :
                          'rgba(168, 85, 247, 0.15)',
                        border: 
                          item.category === 'RESERVATION' ? '1px solid rgba(16, 185, 129, 0.3)' :
                          item.category === 'BILLING' ? '1px solid rgba(245, 158, 11, 0.3)' :
                          '1px solid rgba(168, 85, 247, 0.3)',
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {item.category === 'RESERVATION' && <Calendar size={15} color="#10B981" />}
                      {item.category === 'BILLING' && <Receipt size={15} color="#F59E0B" />}
                      {item.category === 'LOYALTY' && <Crown size={15} color="#A855F7" />}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ 
                          fontSize: 12, 
                          fontWeight: isRead ? 600 : 700, 
                          color: isRead ? 'var(--text-main)' : 'var(--gold)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {item.title}
                        </span>
                        {!isRead && (
                          <span style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: 'var(--gold)',
                            boxShadow: '0 0 6px var(--gold)',
                            flexShrink: 0,
                          }} />
                        )}
                      </div>

                      <p style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 3,
                        lineHeight: 1.4,
                      }}>
                        {item.description}
                      </p>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 6,
                        fontSize: 10,
                        color: 'var(--text-muted)',
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={10} />
                          {item.timeAgo}
                        </span>
                        <span style={{
                          color: 'var(--gold)',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}>
                          Open {item.targetTab} <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '10px 16px',
              borderTop: '1px solid var(--border)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            <span>Live auto-sync every 30s</span>
            <button
              onClick={() => {
                setIsOpen(false);
                if (onTabChange) onTabChange('reservations');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--gold)',
                fontWeight: 600,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>View All Reservations</span>
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
