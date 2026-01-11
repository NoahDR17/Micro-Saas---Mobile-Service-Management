import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export function PendingVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await apiClient.resendVerificationEmail(email);
      setMessage('Verification email sent! Check your inbox for the verification link.');
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setLoading(false);
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
        {/* Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 16px rgba(245, 158, 11, 0.3)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#0f172a',
          margin: '0 0 8px',
        }}>
          Verify Your Email
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          margin: '0 0 24px',
        }}>
          We've sent you a verification link. Check your email and click the link to verify your account.
        </p>

        {message && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#166534',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleResendEmail} style={{ marginBottom: '24px' }}>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#0f172a',
            margin: '0 0 12px',
            textAlign: 'left',
          }}>
            Didn't receive the email?
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
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </form>

        <p style={{
          fontSize: '13px',
          color: '#6b7280',
          margin: '0',
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
      </div>
    </div>
  );
}
