import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Booking } from '@msm/shared';
import { CompleteJobModal } from '../components/CompleteJobModal';

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const b = await apiClient.getBooking(id);
      setBooking(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load booking');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const completeBooking = async () => {
    if (!id) return;
    try {
      await apiClient.setBookingStatus(id, { status: 'COMPLETED' });
      setShowComplete(false);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to complete booking');
    }
  };

  const cancelBooking = async () => {
    if (!id) return;
    try {
      await apiClient.setBookingStatus(id, { status: 'CANCELLED' });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel booking');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/app/bookings" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>← Back to Bookings</Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to={`/app/bookings/${booking.id}/edit`} style={{ padding: '0.5rem 0.75rem', background: '#e5e7eb', color: '#374151', textDecoration: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>Edit</Link>
            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
              <>
                <button onClick={() => setShowComplete(true)} style={{ padding: '0.5rem 0.75rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>Complete</button>
                <button onClick={cancelBooking} style={{ padding: '0.5rem 0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>Cancel</button>
              </>
            )}
          </div>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>}

        <div style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>{booking.client?.fullName}</h2>
          <div style={{ color: '#6b7280', marginBottom: '0.5rem' }}>{new Date(booking.scheduledAt).toLocaleString()}</div>
          <div style={{ marginBottom: '0.5rem' }}><strong>Status:</strong> {booking.status}</div>
          <div style={{ marginBottom: '0.5rem' }}><strong>Service:</strong> {booking.service?.name ?? '—'}</div>
          {booking.addOns && booking.addOns.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Add-ons:</strong> {booking.addOns.map((a) => a.name).join(', ')}
            </div>
          )}
          {booking.notes && (
            <div style={{ marginTop: '0.5rem', color: '#374151' }}>{booking.notes}</div>
          )}
        </div>
      </div>

      <CompleteJobModal open={showComplete} onCancel={() => setShowComplete(false)} onConfirm={completeBooking} />
    </Layout>
  );
}
