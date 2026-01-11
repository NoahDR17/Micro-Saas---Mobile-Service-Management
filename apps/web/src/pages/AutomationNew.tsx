import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { MessageTemplate, TriggerType } from '@msm/shared';

const TriggerOptions = [
  { value: 'BOOKING_CREATED', label: 'When booking created' },
  { value: 'HOURS_BEFORE_BOOKING', label: 'Hours before booking' },
  { value: 'JOB_COMPLETED', label: 'When job completed' },
  { value: 'DAYS_SINCE_LAST_BOOKING', label: 'Days since last booking' },
];

export function AutomationNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState<TriggerType>('BOOKING_CREATED');
  const [templateId, setTemplateId] = useState('');
  const [hoursOrDays, setHoursOrDays] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getTemplates();
      setTemplates(data);
      if (data.length > 0) {
        setTemplateId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter an automation name');
      return;
    }

    if (!templateId) {
      setError('Please select a template');
      return;
    }

    if ((triggerType === 'HOURS_BEFORE_BOOKING' || triggerType === 'DAYS_SINCE_LAST_BOOKING') && !hoursOrDays) {
      setError(`Please enter the number of ${triggerType === 'HOURS_BEFORE_BOOKING' ? 'hours' : 'days'}`);
      return;
    }

    setSaving(true);

    try {
      await apiClient.createAutomation({
        name,
        triggerType,
        templateId,
        hoursOrDays: hoursOrDays ? parseInt(hoursOrDays, 10) : undefined,
        enabled: true,
      });
      navigate('/app/automations');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create automation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/app/automations"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Back to Automations
          </Link>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            Create Automation
          </h1>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Automation Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Booking confirmation"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Trigger Type */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Trigger *
              </label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value as TriggerType)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                {TriggerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hours/Days - conditionally shown */}
            {(triggerType === 'HOURS_BEFORE_BOOKING' || triggerType === 'DAYS_SINCE_LAST_BOOKING') && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                  {triggerType === 'HOURS_BEFORE_BOOKING' ? 'Hours before' : 'Days since'} *
                </label>
                <input
                  type="number"
                  min="1"
                  value={hoursOrDays}
                  onChange={(e) => setHoursOrDays(e.target.value)}
                  placeholder={triggerType === 'HOURS_BEFORE_BOOKING' ? '24' : '30'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {/* Template */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Message Template *
              </label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select a template...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.type} ({t.channel})
                  </option>
                ))}
              </select>
              {templates.length === 0 && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  No templates available. Please create one first.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to="/app/automations"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#e5e7eb',
                  color: '#374151',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 500,
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: saving ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Creating...' : 'Create Automation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
