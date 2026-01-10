import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { apiClient } from '../api/client';
import type { MessageTemplateType, MessageChannel } from '@msm/shared';

export function TemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [type, setType] = useState<MessageTemplateType>('CONFIRMATION');
  const [channel, setChannel] = useState<MessageChannel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [preview, setPreview] = useState<{ subject: string | null; body: string } | null>(null);
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew) {
      loadTemplate();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getTemplate(id);
      setType(data.type);
      setChannel(data.channel);
      setSubject(data.subject || '');
      setBody(data.body);
      setEnabled(data.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!body) return;
    
    try {
      if (isNew) {
        // For new templates, do manual substitution
        const vars = {
          client_name: 'John Doe',
          booking_date: '15th January 2026',
          booking_time: '2:00 PM',
          service_name: 'Standard Clean',
          business_name: 'Your Business',
        };
        const previewBody = body.replace(/\{(\w+)\}/g, (match, key) => vars[key as keyof typeof vars] || match);
        const previewSubject = subject.replace(/\{(\w+)\}/g, (match, key) => vars[key as keyof typeof vars] || match);
        setPreview({ subject: previewSubject || null, body: previewBody });
      } else if (id) {
        // Use API preview for existing templates
        const vars = {
          client_name: 'John Doe',
          booking_date: '15th January 2026',
          booking_time: '2:00 PM',
          service_name: 'Standard Clean',
          business_name: 'Your Business',
        };
        const result = await apiClient.previewTemplate(id, vars);
        setPreview(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview failed');
    }
  };

  const insertVariable = (variable: string) => {
    setBody((prev) => prev + `{${variable}}`);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (isNew) {
        await apiClient.createTemplate({
          type,
          channel,
          subject: channel === 'EMAIL' ? subject : undefined,
          body,
          enabled,
        });
      } else if (id) {
        await apiClient.updateTemplate(id, {
          subject: channel === 'EMAIL' ? subject : null,
          body,
          channel,
          enabled,
        });
      }
      navigate('/app/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    setError('');
    setShowDeleteConfirm(false);
    try {
      await apiClient.deleteTemplate(id);
      navigate('/app/templates');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
    } finally {
      setDeleting(false);
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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/app/templates"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Back to Templates
          </Link>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            {isNew ? 'New Template' : 'Edit Template'}
          </h1>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Template Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MessageTemplateType)}
                required
                disabled={!isNew}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  background: isNew ? 'white' : '#f9fafb',
                }}
              >
                <option value="CONFIRMATION">Booking Confirmation</option>
                <option value="REMINDER">Reminder</option>
                <option value="REVIEW">Review Request</option>
                <option value="REBOOK">Rebook Message</option>
              </select>
              {!isNew && (
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  Type cannot be changed after creation
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Channel *
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as MessageChannel)}
                required
                disabled={!isNew}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  background: isNew ? 'white' : '#f9fafb',
                }}
              >
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
              {!isNew && (
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  Channel cannot be changed after creation
                </p>
              )}
            </div>

            {channel === 'EMAIL' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="e.g., Booking Confirmation - {service_name}"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Message Body *
              </label>
              <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {['client_name', 'booking_date', 'booking_time', 'service_name', 'business_name'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVariable(v)}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      background: '#dbeafe',
                      color: '#1e40af',
                      border: '1px solid #3b82f6',
                      borderRadius: '0.25rem',
                      cursor: 'pointer',
                    }}
                  >
                    + {v}
                  </button>
                ))}
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={8}
                placeholder={`Hi {client_name},\n\nYour booking for {service_name} is confirmed for {booking_date} at {booking_time}.\n\nThank you,\n{business_name}`}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontWeight: 500, color: '#374151' }}>Template enabled</span>
              </label>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handlePreview}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Preview with Sample Data
              </button>
              {preview && (
                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}>
                  {preview.subject && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <strong>Subject:</strong> {preview.subject}
                    </div>
                  )}
                  <div>
                    <strong>Body:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem', fontFamily: 'inherit' }}>
                      {preview.body}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link
                  to="/app/templates"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#e5e7eb',
                    color: '#374151',
                    borderRadius: '0.375rem',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: saving ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Saving...' : isNew ? 'Create Template' : 'Save Changes'}
                </button>
              </div>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: deleting ? '#9ca3af' : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 500,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Template"
        message="Are you sure you want to delete this template? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Layout>
  );
}
