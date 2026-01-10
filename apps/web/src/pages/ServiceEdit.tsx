import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Service } from '@msm/shared';

export function ServiceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [priceCents, setPriceCents] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadService();
  }, [id]);

  const loadService = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const services = await apiClient.getServices();
      const found = services.find((s) => s.id === id);
      if (!found) {
        setError('Service not found');
        return;
      }
      setService(found);
      setName(found.name);
      setPriceCents((found.priceCents / 100).toFixed(2));
      setDurationMinutes(found.durationMinutes.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');

    try {
      await apiClient.updateService(id, {
        name,
        priceCents: Math.round(parseFloat(priceCents) * 100),
        durationMinutes: parseInt(durationMinutes, 10),
      });
      navigate('/app/services');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
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

  if (error && !service) {
    return (
      <Layout>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem' }}>
            {error}
          </div>
          <Link
            to="/app/services"
            style={{ display: 'inline-block', marginTop: '1rem', color: '#2563eb', textDecoration: 'none' }}
          >
            ← Back to Services
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/app/services"
            style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}
          >
            ← Back to Services
          </Link>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>
            Edit Service
          </h1>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Service Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Price (£) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                required
                placeholder="50.00"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem', color: '#374151' }}>
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="1"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                required
                placeholder="60"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                to="/app/services"
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
