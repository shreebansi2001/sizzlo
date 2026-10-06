import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: { email: string; role: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const DEMO_EMAIL = 'admin@sizzlo.com';
  const DEMO_PASS = 'admin123';

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Accept official demo credentials or generic admin
      const isEmailValid = cleanEmail === DEMO_EMAIL || cleanEmail === 'admin';
      const isPassValid = cleanPass === DEMO_PASS || cleanPass === 'admin';

      if (isEmailValid && isPassValid) {
        const userData = { email: DEMO_EMAIL, role: 'Super Admin' };
        localStorage.setItem('yanki_admin_auth', JSON.stringify(userData));
        onLoginSuccess(userData);
      } else {
        setError('Invalid credentials. Use demo email: admin@sizzlo.com & password: admin123');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const userData = { email: DEMO_EMAIL, role: 'Super Admin' };
      localStorage.setItem('yanki_admin_auth', JSON.stringify(userData));
      onLoginSuccess(userData);
    }, 300);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #142821 0%, #070A09 60%, #030504 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: -100,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(circle, rgba(201, 162, 77, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(255, 138, 0, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: 460,
        background: 'rgba(23, 23, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(201, 162, 77, 0.25)',
        borderRadius: 28,
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(201, 162, 77, 0.1)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <img 
              src="/sizzlo-mascot.png" 
              alt="Sizzlo" 
              className="animate-float"
              style={{ 
                width: 68, 
                height: 68, 
                objectFit: 'contain',
                filter: 'drop-shadow(0 6px 16px rgba(255, 138, 0, 0.45))'
              }} 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <h1 style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: 26, 
              fontWeight: 700, 
              color: 'var(--text-main)', 
              letterSpacing: 1 
            }}>
              YANKI
            </h1>
            <span className="brand-badge" style={{ fontSize: 10, padding: '2px 8px' }}>
              SUPER ADMIN
            </span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Privilege & Hospitality Management Console
          </p>
        </div>

        {/* Demo Credentials Notice Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(201, 162, 77, 0.12) 0%, rgba(201, 162, 77, 0.04) 100%)',
          border: '1px solid rgba(201, 162, 77, 0.35)',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              fontSize: 11, 
              fontWeight: 700, 
              color: 'var(--gold)', 
              letterSpacing: 1, 
              textTransform: 'uppercase' 
            }}>
              <Sparkles size={13} color="var(--gold)" />
              Client Demo Credentials
            </span>
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={12} />
              Single Key Active
            </span>
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 10 }}>
            <div>Email: <strong style={{ color: '#FFFFFF' }}>{DEMO_EMAIL}</strong></div>
            <div>Password: <strong style={{ color: '#FFFFFF' }}>{DEMO_PASS}</strong></div>
          </div>

          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 10,
              background: 'var(--gold-subtle)',
              border: '1px solid rgba(201, 162, 77, 0.4)',
              color: 'var(--gold)',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'all 0.2s ease',
            }}
          >
            <ShieldCheck size={14} />
            <span>1-Click Client Demo Sign In</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            color: '#FCA5A5',
            padding: '10px 14px',
            borderRadius: 12,
            fontSize: 12,
            marginBottom: 18,
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 11, 
              fontWeight: 700, 
              letterSpacing: 1, 
              textTransform: 'uppercase', 
              color: 'var(--text-muted)', 
              marginBottom: 6 
            }}>
              Admin Email / Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sizzlo.com"
                required
                style={{
                  width: '100%',
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '12px 14px 12px 42px',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ 
              display: 'block', 
              fontSize: 11, 
              fontWeight: 700, 
              letterSpacing: 1, 
              textTransform: 'uppercase', 
              color: 'var(--text-muted)', 
              marginBottom: 6 
            }}>
              Master Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '12px 42px 12px 42px',
                  color: 'var(--text-main)',
                  fontSize: 13,
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '13px',
              fontSize: 14,
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 6px 20px rgba(255, 138, 0, 0.4)',
            }}
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Console'}</span>
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Security badge at bottom */}
        <div style={{ 
          marginTop: 24, 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 6,
          color: 'var(--text-dim)',
          fontSize: 11,
        }}>
          <ShieldCheck size={13} color="var(--gold)" />
          <span>Secured VIP Operations & Patrons Telemetry</span>
        </div>
      </div>
    </div>
  );
};
