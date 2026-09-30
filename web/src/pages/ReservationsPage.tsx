import React, { useState } from 'react';
import { CalendarCheck, Clock, Users, Check, X } from 'lucide-react';
import { Reservation } from '../types';

interface ReservationsPageProps {
  reservations: Reservation[];
}

export const ReservationsPage: React.FC<ReservationsPageProps> = ({ reservations }) => {
  const [list, setList] = useState<Reservation[]>(reservations);

  const updateStatus = (id: string | number, newStatus: 'Confirmed' | 'Completed' | 'Cancelled') => {
    setList(list.map((r) => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>Table Management & Host Station</h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confirm seating, manage guest capacity and VIP concierge requests</p>
        </div>
      </div>

      <div className="data-table-card">
        <table className="sizzlo-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Customer</th>
              <th>Outlet</th>
              <th>Timing</th>
              <th>Party Size</th>
              <th>Status</th>
              <th>Special Requests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{r.bookingReference}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{r.customerName}</span>
                    {r.vip && <span className="badge badge-gold">VIP</span>}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.customerMobile}</span>
                </td>
                <td>{r.outlet}</td>
                <td>{r.reservationTime}</td>
                <td style={{ fontWeight: 700 }}>{r.guests} Guests</td>
                <td>
                  <span className={`badge ${
                    r.status === 'Confirmed' ? 'badge-success' :
                    r.status === 'Completed' ? 'badge-royal' : 'badge-danger'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.specialRequests || 'None'}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.status !== 'Completed' && (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px 10px', fontSize: 11 }}
                        onClick={() => updateStatus(r.id, 'Completed')}
                      >
                        <Check size={12} color="#10B981" />
                        Seat
                      </button>
                    )}
                    {r.status !== 'Cancelled' && (
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px 10px', fontSize: 11, color: 'var(--danger)' }}
                        onClick={() => updateStatus(r.id, 'Cancelled')}
                      >
                        <X size={12} color="#EF4444" />
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
