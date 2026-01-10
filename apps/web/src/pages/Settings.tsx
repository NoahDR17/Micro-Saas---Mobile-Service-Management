import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { MessageChannel } from '@msm/shared';

export function Settings() {
  const { business, refreshAuth } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [name, setName] = useState(business?.name || '');
  const [timezone, setTimezone] = useState(business?.timezone || 'Europe/London');
  const [defaultRebookIntervalDays, setDefaultRebookIntervalDays] = useState(business?.defaultRebookIntervalDays?.toString() || '30');
  const [identifierLabel, setIdentifierLabel] = useState(business?.identifierLabel || '');
  const [defaultChannel, setDefaultChannel] = useState<MessageChannel>(business?.defaultChannel || 'EMAIL');
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleEdit = () => {
    // Reset form to current values
    setName(business?.name || '');
    setTimezone(business?.timezone || 'Europe/London');
    setDefaultRebookIntervalDays(business?.defaultRebookIntervalDays?.toString() || '30');
    setIdentifierLabel(business?.identifierLabel || '');
    setDefaultChannel(business?.defaultChannel || 'EMAIL');
    setIsEditing(true);
    setError('');
    setSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await apiClient.updateBusiness({
        name,
        timezone,
        defaultRebookIntervalDays: parseInt(defaultRebookIntervalDays, 10),
        identifierLabel: identifierLabel || null,
        defaultChannel,
      });
      
      await refreshAuth(); // Refresh to get updated business data
      setSuccess(true);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>Settings</h1>

        {/* Business Settings */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#111827' }}>Business Information</h2>
            {!isEditing && (
              <button
                onClick={handleEdit}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                }}
              >
                Edit Settings
              </button>
            )}
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {success && !isEditing && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              Settings updated successfully
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Timezone *
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Default Rebook Interval (days) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={defaultRebookIntervalDays}
                    onChange={(e) => setDefaultRebookIntervalDays(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    How many days after a completed job should clients be marked as "due to rebook"
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Default Message Channel *
                  </label>
                  <select
                    value={defaultChannel}
                    onChange={(e) => setDefaultChannel(e.target.value as MessageChannel)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Custom Client Field Label (optional)
                  </label>
                  <input
                    type="text"
                    value={identifierLabel}
                    onChange={(e) => setIdentifierLabel(e.target.value)}
                    placeholder="e.g., License Plate, Account Number"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem',
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    Add a custom identifier field for your clients (e.g., for tracking vehicle details)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e5e7eb',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: saving ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                  Business Name
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#6b7280' }}>
                  {business?.name}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                  Timezone
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#6b7280' }}>
                  {business?.timezone}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                  Default Rebook Interval
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#6b7280' }}>
                  {business?.defaultRebookIntervalDays} days
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                  Default Message Channel
                </label>
                <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#6b7280' }}>
                  {business?.defaultChannel}
                </div>
              </div>

              {business?.identifierLabel && (
                <div>
                  <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem' }}>
                    Custom Client Field
                  </label>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', color: '#6b7280' }}>
                    {business.identifierLabel}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Settings Sections */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Automations & Messages</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <Link
              to="/app/templates"
              style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                color: '#111827',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Message Templates</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Create and edit templates for automated messages
                </div>
              </div>
              <span style={{ color: '#2563eb' }}>→</span>
            </Link>
            <Link
              to="/app/message-logs"
              style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                color: '#111827',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>Message Logs</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  View all sent and queued messages
                </div>
              </div>
              <span style={{ color: '#2563eb' }}>→</span>
            </Link>
          </div>
        </div>

        {/* Coming Soon Sections */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Coming Soon</h2>
          <ul style={{ color: '#6b7280', fontSize: '0.875rem', paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>Automation rules (reminder timing, review delays)</li>
            <li style={{ marginBottom: '0.5rem' }}>Automation rules</li>
            <li style={{ marginBottom: '0.5rem' }}>User management</li>
            <li>API keys & integrations</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
