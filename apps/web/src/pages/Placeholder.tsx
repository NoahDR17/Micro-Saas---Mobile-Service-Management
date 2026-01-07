import React from 'react';
import { Layout } from '../components/Layout';

export function Placeholder() {
  return (
    <Layout>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', margin: 0 }}>
            Coming Soon
          </h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            This feature is under development.
          </p>
        </div>
      </div>
    </Layout>
  );
}
