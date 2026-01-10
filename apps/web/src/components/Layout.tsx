import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, business, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard' },
    { path: '/app/bookings', label: 'Bookings' },
    { path: '/app/clients', label: 'Clients' },
    { path: '/app/services', label: 'Services' },
    { path: '/app/settings', label: 'Settings' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{
        padding: '1rem',
        backgroundColor: '#2563eb',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>{business?.name || 'Mobile Service Manager'}</h1>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>{user?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'white',
            color: '#2563eb',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '1.5rem', backgroundColor: '#f3f4f6' }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        display: 'flex',
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                flex: 1,
                padding: '1rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#6b7280',
                fontWeight: isActive ? '600' : '400',
                backgroundColor: isActive ? '#eff6ff' : 'transparent',
                borderTop: isActive ? '2px solid #2563eb' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
