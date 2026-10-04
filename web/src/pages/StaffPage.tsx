import React from 'react';
import { ShieldCheck, Check, X, UserPlus } from 'lucide-react';
import { StaffRole } from '../types';

interface StaffPageProps {
  roles: StaffRole[];
}

const matrix = [
  { perm: 'View Dashboard', a: [true, true, true, true, true] },
  { perm: 'Manage VIP Subscribers', a: [true, false, true, false, false] },
  { perm: 'Manage Privilege Coupons', a: [true, false, true, false, true] },
  { perm: 'Process Payment Collections', a: [true, true, false, false, false] },
  { perm: 'View Revenue & Financials', a: [true, true, true, true, false] },
  { perm: 'Reservation & Floor Control', a: [true, false, true, true, false] },
  { perm: 'Marketing Campaigns & Broadcasts', a: [true, false, false, false, true] },
  { perm: 'Manage Staff Roles & Access', a: [true, false, false, false, false] },
];

export const StaffPage: React.FC<StaffPageProps> = ({ roles }) => {
  return (
    <div>
      {/* 5 Role Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 28 }}>
        {roles.map((r) => (
          <div key={r.role} className="kpi-card" style={{ padding: 18 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(232, 184, 74, 0.2)',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 12
            }}>
              <ShieldCheck size={18} color="var(--gold-dark)" />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{r.role}</h4>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{r.count} Active Users</p>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8, lineHeight: 1.3 }}>
              {r.perms.join(' · ')}
            </p>
          </div>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 20,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>Security &amp; Permissions Matrix</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Role-based access control (RBAC) governance across group operations</p>
          </div>
          <button className="primary-btn" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <UserPlus size={14} /> Assign New Staff Role
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left', width: '30%' }}>System Permission</th>
                {roles.map((r) => (
                  <th key={r.role} style={{ textAlign: 'center' }}>{r.role}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row.perm}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)', textAlign: 'left' }}>
                    {row.perm}
                  </td>
                  {row.a.map((hasAccess, i) => (
                    <td key={i} style={{ textAlign: 'center' }}>
                      {hasAccess ? (
                        <div style={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.15)' }}>
                          <Check size={14} color="#059669" />
                        </div>
                      ) : (
                        <div style={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: '50%', background: 'rgba(148, 163, 184, 0.1)' }}>
                          <X size={14} color="#94A3B8" />
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
