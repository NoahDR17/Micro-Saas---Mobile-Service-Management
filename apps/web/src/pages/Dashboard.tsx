import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { apiClient } from '../api/client';
import type { Booking } from '@msm/shared';

interface DashboardStats {
  todayBookings: number;
  upcomingBookings: number;
  dueToRebookCount: number;
  automationActivityToday: number;
  weeklyIncomeEstimate: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, bookingsData] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getDashboardBookings(),
      ]);

      setStats(statsData);
      setUpcomingBookings(bookingsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
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
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', marginBottom: '1.5rem', color: '#111827' }}>Dashboard</h1>

        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Today's Bookings */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Today's Bookings</p>
                <p style={{ fontSize: '2.25rem', fontWeight: '700', margin: 0, color: '#2563eb' }}>{stats?.todayBookings ?? 0}</p>
              </div>
              <div style={{ fontSize: '2rem' }}>📅</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>
              {stats?.upcomingBookings ?? 0} more coming this week
            </p>
          </div>

          {/* Due to Rebook */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Due to Rebook</p>
                <p style={{ fontSize: '2.25rem', fontWeight: '700', margin: 0, color: '#f59e0b' }}>{stats?.dueToRebookCount ?? 0}</p>
              </div>
              <div style={{ fontSize: '2rem' }}>🎯</div>
            </div>
            <Link
              to="/app/clients"
              style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.75rem', fontWeight: '500' }}
            >
              View clients →
            </Link>
          </div>

          {/* Automation Activity */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Automations Today</p>
                <p style={{ fontSize: '2.25rem', fontWeight: '700', margin: 0, color: '#10b981' }}>{stats?.automationActivityToday ?? 0}</p>
              </div>
              <div style={{ fontSize: '2rem' }}>⚡</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>Messages sent & scheduled</p>
          </div>

          {/* Weekly Income */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, marginBottom: '0.25rem' }}>Weekly Income</p>
                <p style={{ fontSize: '2.25rem', fontWeight: '700', margin: 0, color: '#059669' }}>
                  £{((stats?.weeklyIncomeEstimate ?? 0) / 100).toFixed(2)}
                </p>
              </div>
              <div style={{ fontSize: '2rem' }}>💷</div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: 0 }}>From scheduled jobs</p>
          </div>
        </div>

        {/* Upcoming Bookings Section */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#111827' }}>Upcoming This Week</h2>
            <Link to="/app/bookings" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
              View all →
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <p style={{ color: '#6b7280', margin: 0 }}>No bookings this week</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Client
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Service
                    </th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#6b7280' }}>
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingBookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#111827' }}>
                        <Link
                          to={`/app/clients/${booking.clientId}`}
                          style={{ color: '#2563eb', textDecoration: 'none' }}
                        >
                          {booking.client?.fullName || 'Unknown'}
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#111827' }}>
                        {booking.service?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '0.75rem 0', fontSize: '0.875rem', color: '#111827' }}>
                        {new Date(booking.scheduledAt).toLocaleDateString()} {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/app/bookings/new"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              + New Booking
            </Link>
            <Link
              to="/app/clients/new"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#10b981',
                color: 'white',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              + New Client
            </Link>
            <Link
              to="/app/services"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#8b5cf6',
                color: 'white',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
              }}
            >
              Manage Services
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
