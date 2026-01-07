import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Client, Service, AddOn } from '@msm/shared';

export function BookingEdit() {
  const { id } = useParams<{ id: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [c, s, a] = await Promise.all([
          apiClient.getClients({ archived: false }),
          apiClient.getServices({ active: true }),
          apiClient.getAddOns({ active: true }),
        ]);
        setClients(c);
        setServices(s);
        setAddOns(a);
        if (id) {
          const b = await apiClient.getBooking(id);
          setClientId(b.clientId);
          setServiceId(b.serviceId || '');
          setSelectedAddOns((b.addOns || []).map((x) => x.id));
          setScheduledAt(new Date(b.scheduledAt).toISOString().slice(0, 16));
          setNotes(b.notes || '');
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientId || !scheduledAt || !id) {
      setError('Client and date/time are required');
      return;
    }
    setLoading(true);
    try {
      await apiClient.updateBooking(id, {
        clientId,
        serviceId: serviceId || null,
        addOnIds: selectedAddOns,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: notes || null,
      });
      navigate('/app/bookings');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update booking');
    } finally {
      setLoading(false);
    }
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
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/app/bookings" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>← Back to Bookings</Link>
        </div>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, marginBottom: '1.5rem' }}>Edit Booking</h2>
          {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Client *</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Service</label>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}>
                <option value="">No service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Add-ons</label>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {addOns.map((a) => (
                  <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={selectedAddOns.includes(a.id)} onChange={() => toggleAddOn(a.id)} />
                    {a.name}
                  </label>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Date & Time *</label>
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} required style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', fontWeight: 500 }}>{loading ? 'Updating...' : 'Update Booking'}</button>
              <Link to="/app/bookings" style={{ flex: 1, padding: '0.75rem', background: '#e5e7eb', color: '#374151', borderRadius: '0.25rem', textDecoration: 'none', textAlign: 'center', display: 'block', fontWeight: 500 }}>Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
