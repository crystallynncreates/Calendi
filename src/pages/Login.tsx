import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Lock } from 'lucide-react';
import { login, register, hasAnyUser } from '../auth';

type Mode = 'sign-in' | 'create';

export default function Login() {
  const navigate = useNavigate();
  const isFirstTime = !hasAnyUser();
  const [mode, setMode] = useState<Mode>(isFirstTime ? 'create' : 'sign-in');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (mode === 'create') {
      const result = register(username, password);
      if (!result.ok) { setError(result.error || 'registration failed'); setLoading(false); return; }
    } else {
      const result = login(username, password);
      if (!result.ok) { setError(result.error || 'login failed'); setLoading(false); return; }
    }

    navigate('/');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: '#06060F' }}
    >
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
        <div className="orb-drift" style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="orb-drift-2" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 65%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', boxShadow: '0 0 40px rgba(139,92,246,0.2)' }}>
            <Lock size={28} style={{ color: '#8B5CF6' }} />
          </div>
          <h1 className="text-3xl font-bold font-mono lowercase" style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            calendi
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(226,232,240,0.35)' }}>your time, your way</p>
        </div>

        {/* Tabs */}
        {!isFirstTime && (
          <div className="flex gap-1 mb-5 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {(['sign-in', 'create'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2 rounded-lg text-xs font-mono font-semibold transition-all"
                style={{
                  background: mode === m ? '#8B5CF6' : 'transparent',
                  color: mode === m ? '#fff' : 'rgba(226,232,240,0.4)',
                  boxShadow: mode === m ? '0 2px 10px rgba(139,92,246,0.4)' : 'none',
                }}
              >
                {m === 'sign-in' ? 'sign in' : 'create account'}
              </button>
            ))}
          </div>
        )}

        {isFirstTime && (
          <div className="mb-5 text-center">
            <p className="text-sm font-semibold" style={{ color: 'rgba(226,232,240,0.7)' }}>create your account</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.3)' }}>your data stays on this device</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="glass rounded-3xl p-6 anim-scale-in">
          <div className="mb-4">
            <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(226,232,240,0.45)' }}>username</label>
            <input
              className="input-dark"
              placeholder="your username"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoCapitalize="none"
              autoComplete={mode === 'create' ? 'new-password' : 'username'}
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(226,232,240,0.45)' }}>password</label>
            <div className="relative">
              <input
                className="input-dark pr-10"
                type={showPw ? 'text' : 'password'}
                placeholder={mode === 'create' ? 'min 4 characters' : 'your password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(226,232,240,0.3)', padding: 2 }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="btn-pill w-full"
            style={{
              background: loading || !username || !password ? 'rgba(139,92,246,0.3)' : '#8B5CF6',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
              opacity: loading || !username || !password ? 0.6 : 1,
            }}
          >
            {loading ? (
              <span className="font-mono text-sm">unlocking...</span>
            ) : (
              <><span className="font-mono text-sm">{mode === 'create' ? 'create account' : 'sign in'}</span><ArrowRight size={14} /></>
            )}
          </button>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: 'rgba(226,232,240,0.2)' }}>
          data is stored locally on this device only
        </p>
      </div>
    </div>
  );
}
