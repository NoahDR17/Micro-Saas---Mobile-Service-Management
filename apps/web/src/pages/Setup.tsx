import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { MessageChannel } from '@msm/shared';

interface SetupState {
  businessName: string;
  timezone: string;
  identifierLabel: string;
  defaultRebookIntervalDays: number;
  defaultChannel: MessageChannel;
  initialService: {
    name: string;
    priceCents: number;
    durationMinutes: number;
  };
}

export function Setup() {
  const navigate = useNavigate();
  const { business, refreshAuth } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [state, setState] = useState<SetupState>({
    businessName: business?.name || '',
    timezone: business?.timezone || 'Europe/London',
    identifierLabel: business?.identifierLabel || '',
    defaultRebookIntervalDays: business?.defaultRebookIntervalDays || 30,
    defaultChannel: business?.defaultChannel || 'EMAIL',
    initialService: {
      name: '',
      priceCents: 0,
      durationMinutes: 60,
    },
  });

  const updateState = (updates: Partial<SetupState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateService = (updates: Partial<SetupState['initialService']>) => {
    setState((prev) => ({
      ...prev,
      initialService: { ...prev.initialService, ...updates },
    }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !state.businessName.trim()) {
      setError('Business name is required');
      return;
    }
    if (step === 3 && state.initialService.name && state.initialService.priceCents < 0) {
      setError('Price must be 0 or greater');
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError('');
    setStep((s) => s - 1);
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      // Update business settings
      await apiClient.updateBusiness({
        name: state.businessName,
        timezone: state.timezone,
        identifierLabel: state.identifierLabel || null,
        defaultRebookIntervalDays: state.defaultRebookIntervalDays,
        defaultChannel: state.defaultChannel,
        setupCompleted: true,
      });

      // Create initial service if provided
      if (state.initialService.name.trim()) {
        await apiClient.createService({
          name: state.initialService.name,
          priceCents: state.initialService.priceCents,
          durationMinutes: state.initialService.durationMinutes,
        });
      }

      // Refresh auth to get updated business
      await refreshAuth();

      // Navigate to dashboard
      navigate('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ maxWidth: '600px', width: '100%', background: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Welcome to Mobile Service Manager</h1>
          <p style={{ color: '#6b7280' }}>Let's get your business set up in just a few steps</p>
        </div>

        {/* Progress indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: '4px',
                background: s <= step ? '#2563eb' : '#e5e7eb',
                marginRight: s < 4 ? '0.5rem' : 0,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Step 1: Business Info */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Business Information</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Business Name *
              </label>
              <input
                type="text"
                value={state.businessName}
                onChange={(e) => updateState({ businessName: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                placeholder="e.g., Joe's Cleaning Service"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Timezone
              </label>
              <select
                value={state.timezone}
                onChange={(e) => updateState({ timezone: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              >
                <option value="Europe/London">London (GMT)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Client Identifier */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Client Identifier (Optional)</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Add a custom field for clients like "Car Registration", "Gate Code", or "Pet Name". Leave blank to skip.
            </p>
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Field Label
              </label>
              <input
                type="text"
                value={state.identifierLabel}
                onChange={(e) => updateState({ identifierLabel: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                placeholder="e.g., Car Registration"
              />
            </div>
          </div>
        )}

        {/* Step 3: Create Initial Service */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Create Your First Service</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              Add at least one service to get started. You can add more later.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Service Name
              </label>
              <input
                type="text"
                value={state.initialService.name}
                onChange={(e) => updateService({ name: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                placeholder="e.g., Standard Clean"
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Price (£)
              </label>
              <input
                type="number"
                value={state.initialService.priceCents / 100}
                onChange={(e) => updateService({ priceCents: Math.round(parseFloat(e.target.value || '0') * 100) })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Duration (minutes)
              </label>
              <input
                type="number"
                value={state.initialService.durationMinutes}
                onChange={(e) => updateService({ durationMinutes: parseInt(e.target.value || '60') })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                min="1"
              />
            </div>
          </div>
        )}

        {/* Step 4: Automation Settings & Review */}
        {step === 4 && (
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Automation Settings</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Default Rebook Interval (days)
              </label>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                How often should clients be reminded to rebook?
              </p>
              <input
                type="number"
                value={state.defaultRebookIntervalDays}
                onChange={(e) => updateState({ defaultRebookIntervalDays: parseInt(e.target.value || '30') })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
                min="1"
                max="365"
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Default Communication Channel
              </label>
              <select
                value={state.defaultChannel}
                onChange={(e) => updateState({ defaultChannel: e.target.value as MessageChannel })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS (coming soon)</option>
              </select>
            </div>

            {/* Review Summary */}
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.25rem', marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#374151' }}>Review Your Setup</h3>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                <p><strong>Business:</strong> {state.businessName}</p>
                <p><strong>Timezone:</strong> {state.timezone}</p>
                {state.identifierLabel && <p><strong>Client Field:</strong> {state.identifierLabel}</p>}
                {state.initialService.name && (
                  <p><strong>Initial Service:</strong> {state.initialService.name} (£{(state.initialService.priceCents / 100).toFixed(2)}, {state.initialService.durationMinutes}min)</p>
                )}
                <p><strong>Rebook Interval:</strong> {state.defaultRebookIntervalDays} days</p>
                <p><strong>Channel:</strong> {state.defaultChannel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button
            onClick={handleBack}
            disabled={step === 1 || loading}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              background: 'white',
              color: '#374151',
              cursor: step === 1 || loading ? 'not-allowed' : 'pointer',
              opacity: step === 1 || loading ? 0.5 : 1,
            }}
          >
            Back
          </button>
          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              style={{
                padding: '0.5rem 1.5rem',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
