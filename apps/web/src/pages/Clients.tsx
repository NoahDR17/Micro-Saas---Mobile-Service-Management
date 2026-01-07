import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Client } from '@msm/shared';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getClients({ search, archived: showArchived });
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search, showArchived]);

  const handleArchive = async (id: string) => {
    try {
      await apiClient.archiveClient(id);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive client');
    }
  };

  const handleUnarchive = async (id: string) => {
    try {
      await apiClient.unarchiveClient(id);
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive client');
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>Clients</h2>
          <Link
            to="/app/clients/new"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '0.25rem',
              fontWeight: '500',
            }}
          >
            Add Client
          </Link>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.25rem',
              fontSize: '1rem',
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
            />
            Show Archived
          </label>
        </div>

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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : clients.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            textAlign: 'center',
            color: '#6b7280',
          }}>
            No clients found
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {clients.map((client) => (
              <div
                key={client.id}
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
                      {client.fullName}
                    </h3>
                    {client.phone && (
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        📞 {client.phone}
                      </p>
                    )}
                    {client.email && (
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        ✉️ {client.email}
                      </p>
                    )}
                    {client.address && (
                      <p style={{ margin: '0.25rem 0', color: '#6b7280' }}>
                        📍 {client.address}
                      </p>
                    )}
                    {client.doNotContact && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                      }}>
                        Do Not Contact
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <Link
                      to={`/app/clients/${client.id}`}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: '#e5e7eb',
                        color: '#374151',
                        textDecoration: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      Edit
                    </Link>
                    {client.archivedAt ? (
                      <button
                        onClick={() => handleUnarchive(client.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => handleArchive(client.id)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
