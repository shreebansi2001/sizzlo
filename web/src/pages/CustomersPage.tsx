import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, Mail, Phone } from 'lucide-react';
import { Member } from '../types';

interface CustomersPageProps {
  members: Member[];
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Renewal Due' | 'Expired'>('All');

  const filtered = members.filter((m) => {
    const matchesSearch = m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.membershipId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.mobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      {/* Controls Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-input" style={{ width: 280 }}>
            <Search size={16} color="#64748B" />
            <input 
              type="text" 
              placeholder="Search by name, ID or mobile..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, background: '#F1F5F9', padding: 4, borderRadius: 12 }}>
            {(['All', 'Active', 'Renewal Due'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: statusFilter === tab ? 'white' : 'transparent',
                  color: statusFilter === tab ? 'var(--primary)' : 'var(--text-muted)',
                  boxShadow: statusFilter === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-gold">
          <ShieldCheck size={16} />
          Issue New VIP Card
        </button>
      </div>

      {/* Customer CRM Table */}
      <div className="data-table-card">
        <table className="sizzlo-table">
          <thead>
            <tr>
              <th>Membership ID</th>
              <th>Member Name</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Total Spend</th>
              <th>Coupons Used</th>
              <th>Loyalty Pts</th>
              <th>Pending Dues</th>
              <th>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.membershipId}</td>
                <td>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{m.fullName}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.mobile}</p>
                  </div>
                </td>
                <td>
                  <span className={m.membershipType === 'BLACK DIAMOND' ? 'badge badge-gold' : 'badge badge-royal'}>
                    {m.membershipType}
                  </span>
                </td>
                <td>
                  <span className={`badge ${
                    m.status === 'Active' ? 'badge-success' :
                    m.status === 'Renewal Due' ? 'badge-gold' : 'badge-danger'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>₹{m.totalSpend.toLocaleString()}</td>
                <td>{m.couponsUsed} / {m.couponsTotal}</td>
                <td style={{ fontWeight: 600, color: 'var(--gold-dark)' }}>{m.loyaltyPoints.toLocaleString()}</td>
                <td>
                  {m.pendingDues > 0 ? (
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{m.pendingDues.toLocaleString()}</span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontSize: 12 }}>Paid</span>
                  )}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{m.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
