import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { MessageTemplate } from '@msm/shared';

export function Templates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CONFIRMATION: 'Booking Confirmation',
      REMINDER: 'Reminder',
      REVIEW: 'Review Request',
      REBOOK: 'Rebook Message',
    };
    return labels[type] || type;
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
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem', color: '#111827' }}>
              Message Templates
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Create templates for automated messages. Use variables like {'{client_name}'}, {'{booking_date}'}, {'{service_name}'}
            </p>
          </div>
          <Link
            to="/app/templates/new"
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            + New Template
          </Link>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {templates.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No templates yet</p>
            <p style={{ margin: 0 }}>Create your first message template to get started with automations</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  opacity: template.enabled ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                        {getTemplateTypeLabel(template.type)}
                      </h3>
                      <span
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          borderRadius: '0.25rem',
                          background: template.channel === 'EMAIL' ? '#dbeafe' : '#fef3c7',
                          color: template.channel === 'EMAIL' ? '#1e40af' : '#92400e',
                        }}
                      >
                        {template.channel}
                      </span>
                      {!template.enabled && (
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '0.25rem',
                            background: '#fee2e2',
                            color: '#991b1b',
                          }}
                        >
                          Disabled
                        </span>
                      )}
                    </div>
                    {template.subject && (
                      <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                        Subject: {template.subject}
                      </p>
                    )}
                    <p
                      style={{
                        margin: '0.5rem 0 0 0',
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {template.body.substring(0, 150)}{template.body.length > 150 ? '...' : ''}
                    </p>
                  </div>
                  <Link
                    to={`/app/templates/${template.id}`}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      color: '#2563eb',
                      fontWeight: '500',
                      fontSize: '0.875rem',
                    }}
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600', color: '#1e40af' }}>Available Variables</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.875rem' }}>
            <code style={{ padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.25rem', color: '#1e40af' }}>
              {'{client_name}'}
            </code>
            <code style={{ padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.25rem', color: '#1e40af' }}>
              {'{booking_date}'}
            </code>
            <code style={{ padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.25rem', color: '#1e40af' }}>
              {'{booking_time}'}
            </code>
            <code style={{ padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.25rem', color: '#1e40af' }}>
              {'{service_name}'}
            </code>
            <code style={{ padding: '0.25rem 0.5rem', background: 'white', borderRadius: '0.25rem', color: '#1e40af' }}>
              {'{business_name}'}
            </code>
          </div>
        </div>
      </div>
    </Layout>
  );
}
