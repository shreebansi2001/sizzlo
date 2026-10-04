import React, { useState, useEffect } from 'react';
import { Star, Users, CheckCircle2, Clock, Plus, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface Table {
  id: number;
  tableNumber: number;
  seats: number;
  state: 'Available' | 'Reserved' | 'Occupied' | 'Cleaning';
  guest?: string;
  premium?: boolean;
}

interface WaitlistEntry {
  id: number;
  name: string;
  guests: number;
  waitMinutes: number;
  status: string;
}

const initialTables: Table[] = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  tableNumber: i + 1,
  seats: [2, 4, 4, 6][i % 4],
  state: (['Available', 'Reserved', 'Occupied', 'Cleaning'] as const)[i % 4],
  guest: i % 4 === 2 ? ['Rahul Mehta', 'Priya Shah', 'Kabir Joshi'][i % 3] : undefined,
  premium: i === 3 || i === 11,
}));

export const FloorPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    { id: 1, name: 'Mehta family', guests: 4, waitMinutes: 12, status: 'WAITING' },
    { id: 2, name: 'Aarav Shah', guests: 2, waitMinutes: 7, status: 'WAITING' },
    { id: 3, name: 'Desai', guests: 6, waitMinutes: 3, status: 'WAITING' },
  ]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState('Navrangpura');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    // Load from Java 8 backend
    axios.get('/api/floor/tables')
      .then(res => {
        if (res.data?.success && res.data.data?.length > 0) {
          setTables(res.data.data);
        }
      })
      .catch(() => {});

    axios.get('/api/floor/waitlist')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setWaitlist(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const cycleTableState = (tableNumber: number) => {
    // Call backend
    axios.post(`/api/floor/tables/${tableNumber}/cycle`)
      .then(res => {
        if (res.data?.success && res.data.data) {
          setTables(prev => prev.map(t => t.tableNumber === tableNumber ? res.data.data : t));
        }
      })
      .catch(() => {
        // Fallback local update
        setTables(prev => prev.map(t => {
          if (t.tableNumber !== tableNumber) return t;
          const next = t.state === 'Occupied' ? 'Cleaning' : t.state === 'Cleaning' ? 'Available' : t.state === 'Available' ? 'Reserved' : 'Occupied';
          return { ...t, state: next, guest: next === 'Available' ? undefined : t.guest };
        }));
      });
  };

  const assignGuest = (waitlistId: number, tableNumber: number) => {
    axios.post(`/api/floor/waitlist/${waitlistId}/assign?tableNumber=${tableNumber}`)
      .then(() => {
        setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
        setTables(prev => prev.map(t => t.tableNumber === tableNumber ? { ...t, state: 'Occupied', guest: 'Seated VIP' } : t));
        setIsAssigning(false);
      })
      .catch(() => {
        setWaitlist(prev => prev.filter(w => w.id !== waitlistId));
        setIsAssigning(false);
      });
  };

  const occupiedSeats = tables.filter(t => t.state === 'Occupied' || t.state === 'Reserved').reduce((acc, t) => acc + t.seats, 0);
  const totalSeats = tables.reduce((acc, t) => acc + t.seats, 0);
  const capacityPercent = Math.round((occupiedSeats / (totalSeats || 1)) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Floor & Tables</h1>
          <p className="page-subtitle">Live dining floor seating, capacity tracking and table waitlist</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            className="outlet-select" 
            value={selectedOutlet} 
            onChange={(e) => setSelectedOutlet(e.target.value)}
          >
            <option value="Navrangpura">Navrangpura (Flagship)</option>
            <option value="Shilaj">Shilaj</option>
            <option value="Gandhinagar">Gandhinagar</option>
            <option value="Bodakdev">Bodakdev Signature</option>
          </select>
          <button className="btn btn-primary" onClick={() => setIsAssigning(true)}>
            <Plus size={16} /> Assign Booking
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* Main Floor Grid */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 className="card-title">Main Dining Floor</h2>
              <p className="card-subtitle">Tap any table to cycle its state (Available → Reserved → Occupied → Cleaning)</p>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></span> Available
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }}></span> Reserved
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }}></span> Occupied
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></span> Cleaning
              </span>
            </div>
          </div>

          <div className="floor-grid">
            {tables.map(table => (
              <div 
                key={table.tableNumber}
                className={`table-cell ${table.state}`}
                onClick={() => cycleTableState(table.tableNumber)}
                style={{
                  outline: selectedTable === table.tableNumber ? '2px solid var(--primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-main)' }}>
                    T{table.tableNumber}
                  </strong>
                  {table.premium && <Star size={14} color="var(--gold)" fill="var(--gold)" />}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  <Users size={12} /> {table.seats} seats
                </div>

                <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: 700, 
                    letterSpacing: 0.8, 
                    textTransform: 'uppercase',
                    color: table.state === 'Available' ? 'var(--success)' :
                           table.state === 'Reserved' ? 'var(--gold)' :
                           table.state === 'Occupied' ? 'var(--primary)' : 'var(--text-muted)'
                  }}>
                    {table.state}
                  </span>
                  {table.guest && (
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {table.guest}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Capacity & Waitlist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Capacity Card */}
          <div className="card">
            <h2 className="card-title">Seating Capacity</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 14 }}>
              <span style={{ color: 'var(--text-muted)' }}>{occupiedSeats} booked</span>
              <strong style={{ color: 'var(--text-main)' }}>{totalSeats} seats</strong>
            </div>
            
            <div style={{ height: 10, background: 'rgba(255,255,255,0.08)', borderRadius: 999, overflow: 'hidden', margin: '10px 0' }}>
              <div style={{
                height: '100%',
                width: `${capacityPercent}%`,
                background: capacityPercent > 80 ? 'var(--primary)' : 'var(--success)',
                transition: 'width 0.4s ease'
              }} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {totalSeats - occupiedSeats} seats currently available for this dinner slot
            </p>
          </div>

          {/* Waitlist Card */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="card-title">Live Waitlist</h2>
              <span className="badge badge-orange">{waitlist.length} waiting</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {waitlist.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                  No guests currently waiting
                </p>
              ) : (
                waitlist.map(w => (
                  <div 
                    key={w.id} 
                    style={{ 
                      padding: 12, 
                      borderRadius: 12, 
                      background: 'var(--surface-alt)', 
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 13, color: 'var(--text-main)' }}>{w.name}</strong>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Users size={11} /> {w.guests} guests · <Clock size={11} /> {w.waitMinutes}m
                      </p>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => assignGuest(w.id, tables.find(t => t.state === 'Available')?.tableNumber || 1)}
                    >
                      Assign
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
