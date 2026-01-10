import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { MessageLog, MessageStatus } from '@msm/shared';

export function MessageLogs() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, [statusFilter]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const query = statusFilter ? { status: statusFilter } : {};
      const data = await apiClient.getMessageLogs(query);
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load message logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    const colors: Record<MessageStatus, { bg: string; text: string }> = {
      QUEUED: { bg: '#fef3c7', text: '#92400e' },
      SENT: { bg: '#d1fae5', text: '#065f46' },
      FAILED: { bg: '#fee2e2', text: '#991b1b' },
      SKIPPED: { bg: '#e5e7eb', text: '#374151' },
    };
    return colors[status] || colors.SKIPPED;
  };

  const getTemplateTypeLabel = (type: string | null) => {
    if (!type) return 'Manual';
    const labels: Record<string, string> = {
      CONFIRMATION: 'Confirmation',
      REMINDER: 'Reminder',
      REVIEW: 'Review',
      REBOOK: 'Rebook',
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', margin: 0, marginBottom: '0.5rem', color: '#111827' }}>
            Message Logs
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            View all sent and queued messages
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 500, color: '#374151' }}>Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MessageStatus | '')}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '1rem',
            }}
          >
            <option value="">All</option>
            <option value="QUEUED">Queued</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {logs.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '3rem 2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No messages yet</p>
            <p style={{ margin: 0 }}>Messages will appear here once automations start running</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Date
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Type
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Channel
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Recipient
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Subject / Preview
                  </th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const statusColors = getStatusColor(log.status);
                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        {getTemplateTypeLabel(log.templateType)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '0.25rem',
                            background: log.channel === 'EMAIL' ? '#dbeafe' : '#fef3c7',
                            color: log.channel === 'EMAIL' ? '#1e40af' : '#92400e',
                          }}
                        >
                          {log.channel}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        {log.recipient}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                        {log.subject ? (
                          <div>
                            <div style={{ fontWeight: 500, color: '#111827' }}>{log.subject}</div>
                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                              {log.body.substring(0, 80)}{log.body.length > 80 ? '...' : ''}
                            </div>
                          </div>
                        ) : (
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>
                            {log.body.substring(0, 80)}{log.body.length > 80 ? '...' : ''}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#111827' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            borderRadius: '0.25rem',
                            background: statusColors.bg,
                            color: statusColors.text,
                          }}
                        >
                          {log.status}
                        </span>
                        {log.errorMessage && (
                          <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.25rem' }}>
                            {log.errorMessage}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
