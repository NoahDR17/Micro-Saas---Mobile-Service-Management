import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Client } from '@msm/shared';

export function ClientEdit() {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    identifierValue: '',
    notes: '',
    doNotContact: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      
      try {
        const client = await apiClient.getClient(id);
        setFormData({
          fullName: client.fullName,
          phone: client.phone || '',
          email: client.email || '',
          address: client.address || '',
          identifierValue: client.identifierValue || '',
          notes: client.notes || '',
          doNotContact: client.doNotContact,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch client');
      } finally {
        setFetching(false);
      }
    };

    fetchClient();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.phone && !formData.email) {
      setError('Either phone or email must be provided');
      return;
    }

    if (!id) return;

    setLoading(true);

    try {
      await apiClient.updateClient(id, {
        fullName: formData.fullName,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
        identifierValue: formData.identifierValue || null,
        notes: formData.notes || null,
        doNotContact: formData.doNotContact,
      });
      navigate('/app/clients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (fetching) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/app/clients"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            ← Back to Clients
          </Link>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', margin: 0 }}>
            Edit Client
          </h2>

          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Identifier Value
              </label>
              <input
                type="text"
                name="identifierValue"
                value={formData.identifierValue}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="doNotContact"
                  checked={formData.doNotContact}
                  onChange={handleChange}
                />
                <span style={{ fontWeight: '500' }}>Do Not Contact</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: loading ? '#9ca3af' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Updating...' : 'Update Client'}
              </button>
              <Link
                to="/app/clients"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.25rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'block',
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
