import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email.trim(), password);
      setLoading(false);
      if (!ok) {
        setError('Invalid email or password. Try the demo credentials below.');
        return;
      }
      const stored = localStorage.getItem('nexora_auth');
      const user = stored ? JSON.parse(stored) : null;
      navigate(user?.role === 'admin' ? '/dashboard' : '/user', { replace: true });
    }, 600);
  }

  const inputBase: React.CSSProperties = {
    width: '100%', height: 44,
    background: '#ffffff',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14, color: '#0F172A',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #0B2545 0%, #071629 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '20px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '5%', left: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Logo above card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, zIndex: 1,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'linear-gradient(135deg,#2563eb,#38bdf8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="rgba(255,255,255,0.3)" />
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 22, color: '#fff', letterSpacing: '-0.2px' }}>NEXORA</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#ffffff', borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        padding: '36px 32px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>Sign in to access your dashboard</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 8, padding: '10px 14px',
            fontSize: 13, color: '#EF4444', marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@nexora.com"
                required
                style={{ ...inputBase, paddingLeft: 38, paddingRight: 12 }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', display: 'block', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                style={{ ...inputBase, paddingLeft: 38, paddingRight: 40 }}
                onFocus={e => (e.target.style.borderColor = '#2563EB')}
                onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
                  color: '#94a3b8', display: 'flex', alignItems: 'center',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748B', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#2563EB', cursor: 'pointer' }}
              />
              Remember me
            </label>
            <a href="#" style={{ fontSize: 13, color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
              Forgot password?
            </a>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 44,
              background: loading ? '#93c5fd' : '#2563EB',
              color: '#ffffff', border: 'none', borderRadius: 8,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
            onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Or continue with</span>
          <div style={{ flex: 1, height: 1, background: '#E2E8F0' }} />
        </div>

        {/* SSO buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {['Google', 'IBM SSO'].map(p => (
            <button key={p} style={{
              height: 40, background: '#F5F8FC', border: '1px solid #E2E8F0',
              borderRadius: 8, fontSize: 13, color: '#0F172A', cursor: 'pointer',
              fontWeight: 500, transition: 'all 0.15s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2563EB'; (e.currentTarget as HTMLButtonElement).style.color = '#2563EB'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLButtonElement).style.color = '#0F172A'; }}
            >
              {p}
            </button>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>
          Don't have an account? Contact your administrator.
        </p>

        {/* Demo credentials hint */}
        <div style={{
          background: '#F5F8FC', border: '1px solid #E2E8F0',
          borderRadius: 8, padding: '12px 14px', fontSize: 12, color: '#64748B',
        }}>
          <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>Demo Credentials</div>
          <div><strong>Admin:</strong> admin@nexora.com / admin123</div>
          <div style={{ marginTop: 2 }}><strong>User:</strong> user@nexora.com / user123</div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
