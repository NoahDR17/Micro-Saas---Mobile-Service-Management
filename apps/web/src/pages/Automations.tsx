import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { apiClient } from '../api/client';
import type { AutomationRule } from '@msm/shared';

const TriggerTypeLabels: Record<string, string> = {
  BOOKING_CREATED: 'When booking created',
  HOURS_BEFORE_BOOKING: 'Hours before booking',
  JOB_COMPLETED: 'When job completed',
  DAYS_SINCE_LAST_BOOKING: 'Days since last booking',
};

export function Automations() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getAutomations();
      setRules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (rule: AutomationRule) => {
    try {
      const updated = await apiClient.updateAutomation(rule.id, {
        enabled: !rule.enabled,
      });
      setRules(rules.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automation');
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    setDeleting(selectedRule.id);
    setShowDeleteConfirm(false);

    try {
      await apiClient.deleteAutomation(selectedRule.id);
      setRules(rules.filter((r) => r.id !== selectedRule.id));
      setSelectedRule(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete automation');
    } finally {
      setDeleting(null);
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
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '0.5rem', color: '#111827' }}>
              Automations
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Set up rules to automatically send messages to clients
            </p>
          </div>
          <Link
            to="/app/automations/new"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '0.95rem',
            }}
          >
            + New Automation
          </Link>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}>
            {error}
          </div>
        )}

        {rules.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '3rem 2rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              No automation rules set up yet
            </p>
            <Link
              to="/app/automations/new"
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Create your first automation →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {rules.map((rule) => (
              <div
                key={rule.id}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#111827' }}>
                    {rule.name}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {TriggerTypeLabels[rule.triggerType]}
                    {rule.hoursOrDays && ` - ${rule.hoursOrDays} ${rule.triggerType === 'HOURS_BEFORE_BOOKING' ? 'hours' : 'days'}`}
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Using template: {rule.template?.type || 'Unknown'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Toggle */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: '0.5rem',
                  }}>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggle(rule)}
                      style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </label>

                  {/* Edit Button */}
                  <Link
                    to={`/app/automations/${rule.id}/edit`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#e5e7eb',
                      color: '#374151',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    Edit
                  </Link>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      setSelectedRule(rule);
                      setShowDeleteConfirm(true);
                    }}
                    disabled={deleting === rule.id}
                    style={{
                      padding: '0.5rem 1rem',
                      background: deleting === rule.id ? '#9ca3af' : '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: deleting === rule.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deleting === rule.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Automation"
        message={`Are you sure you want to delete "${selectedRule?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedRule(null);
        }}
      />
    </Layout>
  );
}
