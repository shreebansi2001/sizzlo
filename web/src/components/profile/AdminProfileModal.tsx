import React, { useState } from 'react';
import { 
  User, Mail, Phone, Lock, Building2, ShieldCheck, 
  CheckCircle2, X, Sparkles, KeyRound, Save
} from 'lucide-react';
import { AdminAuthUser } from '../../types';
import { updateAdminUser } from '../../api/client';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminAuthUser | null;
  onUpdateUser: (updatedUser: AdminAuthUser) => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  if (!isOpen || !currentUser) return null;

  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [mobile, setMobile] = useState(currentUser.mobile || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNotice({ message: 'Full Name cannot be empty.', type: 'error' });
      return;
    }

    setIsSaving(true);
    setNotice(null);

    const updatedAuthUser: AdminAuthUser = {
      ...currentUser,
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
    };

    try {
      // 1. Update in backend if user ID exists
      if (currentUser.id) {
        await updateAdminUser(
          currentUser.id,
          {
            fullName: fullName.trim(),
            mobile: mobile.trim(),
            email: email.trim(),
            ...(password.trim() ? { password: password.trim() } : {}),
          },
          currentUser.roleCode,
          currentUser.branchName
        ).catch(() => null);
      }

      // 2. Persist in local storage
      localStorage.setItem('yanki_admin_auth', JSON.stringify(updatedAuthUser));

      // 3. Update React App State
      onUpdateUser(updatedAuthUser);

      setNotice({ message: 'Profile details saved successfully!', type: 'success' });
      setPassword('');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setNotice({ message: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.78)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: 16,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 540,
        background: 'linear-gradient(165deg, #16201B 0%, #0D1411 100%)',
        border: '1px solid rgba(201, 162, 77, 0.35)',
        borderRadius: 22,
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(201, 162, 77, 0.1)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.25) 0%, rgba(255, 138, 0, 0.2) 100%)',
              border: '1px solid var(--gold)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--gold)',
              boxShadow: '0 0 16px rgba(201, 162, 77, 0.25)',
            }}>
              <User size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                My Profile &amp; Settings
              </h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Manage your executive details, phone number, and access credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Notice Alert */}
        {notice && (
          <div style={{
            margin: '16px 24px 0',
            padding: '10px 14px',
            borderRadius: 10,
            background: notice.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${notice.type === 'success' ? '#10B981' : '#EF4444'}`,
            color: notice.type === 'success' ? '#10B981' : '#EF4444',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <CheckCircle2 size={16} />
            <span>{notice.message}</span>
          </div>
        )}

        {/* Modal Body / Form */}
        <form onSubmit={handleSave} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.03)',
            padding: 12,
            borderRadius: 12,
            border: '1px solid var(--border)',
          }}>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block' }}>
                Role Level &amp; Rank
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <ShieldCheck size={14} color="var(--gold)" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
                  {currentUser.roleName || 'Super Admin (Owner)'}
                </span>
              </div>
            </div>
            <div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block' }}>
                Branch Scoping
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <Building2 size={14} color="#10B981" />
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>
                  {currentUser.branchName || 'All Branches'}
                </span>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)' }} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rajesh Patel"
                required
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Mobile Phone Number */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Admin Mobile / WhatsApp Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#10B981' }} />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. +91 90991 37653"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
              💡 Used to receive instant WhatsApp guest alerts for Banquet &amp; ODC inquiries.
            </p>
          </div>

          {/* Email Address & Username */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sizzlo.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Username (System ID)
              </label>
              <input
                type="text"
                value={currentUser.username}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-dim)',
                  fontSize: 13,
                  cursor: 'not-allowed',
                }}
              />
            </div>
          </div>

          {/* Password Update (Optional) */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Change Password <span style={{ textTransform: 'none', color: 'var(--text-dim)' }}>(leave blank to keep unchanged)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new secure password"
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 38px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
            marginTop: 10,
            borderTop: '1px solid var(--border)',
            paddingTop: 16,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 22px',
                borderRadius: 10,
                background: 'var(--primary)',
                border: 'none',
                color: '#070A09',
                fontSize: 13,
                fontWeight: 800,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(255, 138, 0, 0.35)',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
