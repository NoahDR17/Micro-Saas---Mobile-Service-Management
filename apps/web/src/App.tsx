import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Clients } from './pages/Clients';
import { ClientNew } from './pages/ClientNew';
import { ClientEdit } from './pages/ClientEdit';
import { Placeholder } from './pages/Placeholder';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected routes */}
          <Route
            path="/app/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/clients/new"
            element={
              <ProtectedRoute>
                <ClientNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/clients/:id"
            element={
              <ProtectedRoute>
                <ClientEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/dashboard"
            element={
              <ProtectedRoute>
                <Placeholder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/bookings"
            element={
              <ProtectedRoute>
                <Placeholder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/more"
            element={
              <ProtectedRoute>
                <Placeholder />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
