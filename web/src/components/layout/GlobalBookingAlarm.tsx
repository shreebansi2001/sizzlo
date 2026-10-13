import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Armchair, CheckCircle2, VolumeX, Bell, Crown } from 'lucide-react';
import { playZomatoAlertSound } from '../../utils/audioAlert';

interface ActiveInquiry {
  dbId: number;
  name: string;
  mobile: string;
  guests: number;
  outlet: string;
  time: string;
  isVip: boolean;
  tierTag: string;
  tableAssigned?: string;
}

interface GlobalBookingAlarmProps {
  onNavigateToReservations: () => void;
  onRefresh?: () => void;
}

export const GlobalBookingAlarm: React.FC<GlobalBookingAlarmProps> = ({
  onNavigateToReservations,
  onRefresh
}) => {
  const [activeInquiry, setActiveInquiry] = useState<ActiveInquiry | null>(null);
  const [isBeeping, setIsBeeping] = useState<boolean>(false);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const prevIdsRef = useRef<Set<number>>(new Set());
  const isFirstPollRef = useRef<boolean>(true);
  const acknowledgedIdsRef = useRef<Set<number>>(
    (() => {
      try {
        const stored = sessionStorage.getItem('sizzlo_ack_booking_ids');
        return stored ? new Set<number>(JSON.parse(stored)) : new Set<number>();
      } catch (_) {
        return new Set<number>();
      }
    })()
  );

  const markIdAcknowledged = (id: number) => {
    acknowledgedIdsRef.current.add(id);
    try {
      sessionStorage.setItem(
        'sizzlo_ack_booking_ids',
        JSON.stringify(Array.from(acknowledgedIdsRef.current))
      );
    } catch (_) {}
  };

  // Continuous alarm loop: keeps beeping every 3.5s across ALL pages until accepted/dismissed
  useEffect(() => {
    if (!isBeeping) return;

    // Immediately play first chime
    playZomatoAlertSound();

    const timer = setInterval(() => {
      playZomatoAlertSound();
    }, 3500);

    return () => clearInterval(timer);
  }, [isBeeping]);

  // Polling backend /api/reservations globally every 5 seconds
  useEffect(() => {
    const pollReservations = async () => {
      try {
        const res = await axios.get('/api/reservations');
        if (res.data?.success && Array.isArray(res.data.data)) {
          const list: any[] = res.data.data;
          const currentIds = new Set<number>(list.map(r => r.id));

          if (!isFirstPollRef.current) {
            // Find newly arrived inquiries that haven't been acknowledged
            const newArrivals = list.filter(
              r => !prevIdsRef.current.has(r.id) && !acknowledgedIdsRef.current.has(r.id)
            );

            if (newArrivals.length > 0) {
              const latest = newArrivals[0];
              const isVip = Boolean(latest.vip) || 
                (latest.tierPriorityTag !== 'Non-Subscriber' && latest.tierPriorityTag !== 'GUEST' && Boolean(latest.tierPriorityTag));

              setActiveInquiry({
                dbId: latest.id,
                name: latest.customerName || 'VIP Guest',
                mobile: latest.customerMobile || '',
                guests: latest.guests || 2,
                outlet: latest.outlet || 'Yanki Sizzlerr',
                time: latest.reservationTime || 'Upcoming',
                isVip,
                tierTag: latest.tierPriorityTag || (isVip ? 'VIP Priority' : 'Non-Subscriber'),
                tableAssigned: latest.tableAssigned
              });
              setIsBeeping(true);
            }
          } else {
            isFirstPollRef.current = false;
            // On first load, check if there's any pending unassigned inquiry that hasn't been acknowledged
            const unassigned = list.filter(
              r => (!r.tableAssigned || r.status === 'Pending') &&
                   r.status !== 'Completed' &&
                   r.status !== 'Cancelled' &&
                   !acknowledgedIdsRef.current.has(r.id)
            );
            if (unassigned.length > 0) {
              const latest = unassigned[0];
              const isVip = Boolean(latest.vip) || 
                (latest.tierPriorityTag !== 'Non-Subscriber' && latest.tierPriorityTag !== 'GUEST' && Boolean(latest.tierPriorityTag));

              setActiveInquiry({
                dbId: latest.id,
                name: latest.customerName || 'VIP Guest',
                mobile: latest.customerMobile || '',
                guests: latest.guests || 2,
                outlet: latest.outlet || 'Yanki Sizzlerr',
                time: latest.reservationTime || 'Upcoming',
                isVip,
                tierTag: latest.tierPriorityTag || (isVip ? 'VIP Priority' : 'Non-Subscriber'),
                tableAssigned: latest.tableAssigned
              });
              setIsBeeping(true);
            }
          }

          prevIdsRef.current = currentIds;
        }
      } catch (err) {
        // Silent poll error catch
      }
    };

    pollReservations();
    const interval = setInterval(pollReservations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Accept Booking: updates status to Confirmed, turns beep off immediately!
  const handleAcceptBooking = async () => {
    if (!activeInquiry) return;
    setIsAccepting(true);
    try {
      await axios.patch(`/api/reservations/${activeInquiry.dbId}/status?status=Confirmed`);
      markIdAcknowledged(activeInquiry.dbId);
      setIsBeeping(false);
      setActiveInquiry(null);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Accept booking error:', e);
      // Still mute alarm locally so host is not annoyed
      markIdAcknowledged(activeInquiry.dbId);
      setIsBeeping(false);
      setActiveInquiry(null);
    } finally {
      setIsAccepting(false);
    }
  };

  // Handle Assign Table: navigates to #reservations desk and silences beep
  const handleAssignTable = () => {
    if (activeInquiry) {
      markIdAcknowledged(activeInquiry.dbId);
    }
    setIsBeeping(false);
    setActiveInquiry(null);
    onNavigateToReservations();
  };

  // Handle Mute / Stop Alarm
  const handleMuteAlarm = () => {
    if (activeInquiry) {
      markIdAcknowledged(activeInquiry.dbId);
    }
    setIsBeeping(false);
    setActiveInquiry(null);
  };

  if (!activeInquiry) return null;

  return (
    <div
      style={{
        margin: '14px 24px 0 24px',
        background: activeInquiry.isVip
          ? 'linear-gradient(90deg, rgba(201, 162, 77, 0.28), rgba(255, 138, 0, 0.22))'
          : 'linear-gradient(90deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.28))',
        border: activeInquiry.isVip ? '2px solid var(--gold)' : '2px solid #10B981',
        borderRadius: 16,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: activeInquiry.isVip
          ? '0 8px 30px rgba(201, 162, 77, 0.35)'
          : '0 8px 30px rgba(16, 185, 129, 0.35)',
        animation: 'pulse 1.8s infinite',
        flexWrap: 'wrap',
        gap: 12,
        zIndex: 999
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: activeInquiry.isVip ? 'var(--gold)' : '#10B981',
            color: '#070A09',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 900,
            fontSize: 20,
            boxShadow: activeInquiry.isVip
              ? '0 0 15px rgba(201, 162, 77, 0.8)'
              : '0 0 15px rgba(16, 185, 129, 0.8)'
          }}
        >
          {activeInquiry.isVip ? <Crown size={22} color="#070A09" /> : <Bell size={22} color="#070A09" />}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              {activeInquiry.isVip ? '👑 VIP Priority Table Booking Received!' : '🔔 Table Reservation Received!'}
            </h4>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 6,
                background: activeInquiry.isVip ? 'rgba(201, 162, 77, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                color: activeInquiry.isVip ? 'var(--gold)' : '#10B981',
                border: activeInquiry.isVip ? '1px solid rgba(201, 162, 77, 0.5)' : '1px solid rgba(16, 185, 129, 0.4)'
              }}
            >
              {activeInquiry.tierTag || 'VIP Priority'}
            </span>
            {isBeeping && (
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  fontWeight: 800,
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#EF4444'
                  }}
                />
                Beeping continuously until accepted
              </span>
            )}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            <strong style={{ color: activeInquiry.isVip ? 'var(--gold)' : 'var(--primary)' }}>
              {activeInquiry.name}
            </strong>{' '}
            booked for <strong>{activeInquiry.guests} guests</strong> at{' '}
            <strong>{activeInquiry.outlet}</strong> ({activeInquiry.time}). Settle dining table now.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Accept Button: immediately turns off beep and confirms status */}
        <button
          onClick={handleAcceptBooking}
          disabled={isAccepting}
          className="btn btn-primary"
          style={{
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#10B981',
            color: '#070A09',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer'
          }}
        >
          <CheckCircle2 size={16} />
          {isAccepting ? 'Accepting...' : 'Accept Booking'}
        </button>

        {/* Assign Table: switches tab to reservations desk */}
        <button
          onClick={handleAssignTable}
          className="btn btn-primary"
          style={{
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            borderRadius: 10,
            cursor: 'pointer'
          }}
        >
          <Armchair size={16} />
          Assign Table Now
        </button>

        {/* Mute Alarm */}
        <button
          onClick={handleMuteAlarm}
          className="btn btn-outline"
          style={{
            padding: '9px 14px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            borderRadius: 10,
            cursor: 'pointer'
          }}
        >
          <VolumeX size={14} />
          Stop Beep
        </button>
      </div>
    </div>
  );
};
