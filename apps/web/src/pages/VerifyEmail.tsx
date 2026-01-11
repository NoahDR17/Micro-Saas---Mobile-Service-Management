import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('No verification token provided');
      setLoading(false);
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await apiClient.verifyEmail(token);
      setSuccess(true);
      setAuth(response);
      
      // Redirect to setup or dashboard after 2 seconds
      setTimeout(() => {
        navigate(response.business.setupCompleted ? '/app/dashboard' : '/app/setup');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setResendLoading(true);
    setError('');
    
    try {
      const response = await apiClient.resendVerificationEmail(email);
      setError('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #e5e7eb 0%, #f3f4f6 100%)',
      padding: '16px',
      boxSizing: 'border-box',
      overflow: 'auto',
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '32px 24px',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '440px',
        boxSizing: 'border-box',
        textAlign: 'center',
      }}>
        {/* App Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12" y2="18"/>
          </svg>
        </div>

        {loading ? (
          <>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px',
            }}>
              Verifying Email
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0 0 24px',
            }}>
              Please wait while we verify your email address...
            </p>
            <div style={{
              display: 'inline-block',
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </>
        ) : success ? (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px',
            }}>
              Email Verified!
            </h1>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              margin: '0',
            }}>
              Your email has been successfully verified. Redirecting...
            </p>
          </>
        ) : error ? (
          <>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 8px',
            }}>
              Verification Failed
            </h1>
            <p style={{
              color: '#991b1b',
              backgroundColor: '#fee2e2',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              margin: '0 0 20px',
            }}>
              {error}
            </p>

            {/* Resend Form */}
            <div style={{
              textAlign: 'left',
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0f172a',
                margin: '0 0 12px',
              }}>
                Request a new verification link
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '12px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleResendEmail()}
              />
              <button
                onClick={handleResendEmail}
                disabled={resendLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: resendLoading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                }}
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>

            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: '16px 0 0',
            }}>
              Back to{' '}
              <Link to="/login" style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '600',
              }}>
                login
              </Link>
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
