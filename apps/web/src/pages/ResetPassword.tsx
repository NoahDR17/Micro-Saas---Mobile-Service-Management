import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.resetPassword(token!, password);
      setSuccess(true);
      setAuth(response.user, response.business);
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
    const [error, setError] = useState('');
  const [loading, setLoading]t: '100vh',display: 'flex',alignItems: 'center',justifyContent: 'center',background: 'linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)',padding: '16px',boxSizing: 'border-box',overflow: 'auto',}}>
      <div style={{backgroundColor: '#fff',padding: '32px 24px',borderRadius: '24px',boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',width: '100%',maxWidth: '440px',boxSizing: 'border-box',}}>
        <div style={{width: '72px',height: '72px',margin: '0 auto 20px',background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',borderRadius: '20px',display: 'flex',alignItems: 'center',justifyContent: 'center',flexS      setSuccess(true);
      setAuth(response.user, response 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.71 9.29L13.41 1C13.05 0.64 12.55 0.44 12.03 0.44C11.51 0.44 11.01 0.64 10.65 1L2.29 9.29C1.9 9.68 1.44 10.44 1.44 11V19C1.44 20.65 2.79 22 4.44 22H19.44C21.09 22 22.44 20.65 22.44 19V11C22.44 10.44 21.98 9.68 21.71 9.29ZM14.5 18H9.5C9.09 18 8.75 17.66 8.75 17.25C8.75 16.84 9.09 16.5 9.5 16.5H14.5C14.91 16.5 15.25 16.84 15.25 17.25C15.25 17.66 14.91 18 14.5 18Z" fill="#3b82f6"/>
          </svg>
        </div>

        <h2 style={{fontSize: '14px',fontWeight: '60        <div style={{widolor: '#6b7280',margin: '0 0 8px',}}>Mobile Service Manager</h2>
        <h1 style={{fontSize: '24px',fontWeight: '700',textAlign: 'center',color: '#0f172a',margin: '0 0 8px',}}>Create new password</h1>
        <p style={{fontSize: '14px',textAlign: 'center',color: '#6b7280',margin: '0 0 20px',}}>Enter a new password for your account.</p>

        {success && (
          <div style={{backgroundColor: '#f0fdf4',            <path d="M21.71 9.29L13.41 1C13.05 0.64 12.55 0.44 12.03 0.44C11.51 0.44 11.01 0.px',textAlign: 'center',}}>
            Password reset successful. Redirecting...
          </div>
        )}

        {error && (
          <div style={{backgroundColor: '#fee2e2',color: '#991b1b',padding: '12px 16px',borderRadius: '12px',marginBottom: '16px',fontSize: '14px',}}>
            {error}
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={{ margi        </div>
 }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{display: 'block',fontSize: '14px',fontWeight: '500',color: '#0f172a',margi        <p style={{fontSize: '14px',textAlign:       <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{width: '100%',padding: '10px 12px',border: '1px solid #e5e7eb',borderRadius: '12px',fontSize: '14px',boxSizing: 'border-box',backgroundColor: '#fafbfc',}} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{display: 'block',fontSize: '14px',fontWeight: '500',color: '#0f172a',marginBottom: '6px',}}>Co            {error}
          </div>
        )}

        {!successpassword'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required style={{width: '100%',padding: '10px 12px',border: '1px solid #e5e7eb',borderRadius: '12px',fontSize: '14px',boxSizing: 'border-box',backgroundCol            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{display: 'block',fontSize: '14px',fontWeight: '500',color: '#0f172a',marginBottom: '6px',}}>Co            {error}
          </div>
        )}

        {!successpassword'} value={confirmPassword} onChange={(e) => setConfirmPassword',fontSize: '14px',fontWeight: '600',cursor: loading || !password || !confirmPassword ? 'not-allowed' : 'pointer',}}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p style={{fontSize: '14px',textAlign: 'center',color: '#6b7280',margin: 0,}}>
          Remember your password? <Link to="/login" style={{color: '#3b82f6',t
            <div style={{ marginBottom: '16px' }}>
              <label style={{displiv>
    </div>
  );
}
