import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Booking, BookingStatus } from '@msm/shared';

export function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [status, setStatus] = useState<BookingStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiClient.getBookings({ status: status || undefined });
      setBookings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Bookings</h2>
          <Link to="/app/bookings/new" style={{ padding: '0.5rem 1rem', background: '#2563eb', color: 'white', borderRadius: '0.25rem', textDecoration: 'none', fontWeight: 500 }}>New Booking</Link>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <label style={{ color: '#374151', fontWeight: 500 }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | '')} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
            <option value="">All</option>
            <option value="BOOKED">Booked</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : bookings.length === 0 ? (
          <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>No bookings found</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {bookings.map((b) => (
              <Link key={b.id} to={`/app/bookings/${b.id}`} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.client?.fullName ?? 'Client'}</div>
                    <div style={{ color: '#6b7280' }}>{new Date(b.scheduledAt).toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>{b.status}</div>
                </div>
                <div style={{ marginTop: '0.25rem', color: '#374151' }}>{b.service?.name ?? '—'}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
