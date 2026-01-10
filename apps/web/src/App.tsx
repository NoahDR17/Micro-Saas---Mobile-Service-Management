import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Setup } from './pages/Setup';
import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { ClientNew } from './pages/ClientNew';
import { ClientEdit } from './pages/ClientEdit';
import { Placeholder } from './pages/Placeholder';
import { Bookings } from './pages/Bookings';
import { BookingNew } from './pages/BookingNew';
import { BookingEdit } from './pages/BookingEdit';
import { BookingDetail } from './pages/BookingDetail';
import { Services } from './pages/Services';
import { ServiceNew } from './pages/ServiceNew';
import { ServiceEdit } from './pages/ServiceEdit';
import { Settings } from './pages/Settings';
import { Templates } from './pages/Templates';
import { TemplateEditor } from './pages/TemplateEditor';
import { MessageLogs } from './pages/MessageLogs';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Setup route (protected but doesn't require setup completion) */}
          <Route
            path="/app/setup"
            element={
              <ProtectedRoute requireSetup={false}>
                <Setup />
              </ProtectedRoute>
            }
          />

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
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/bookings/new"
            element={
              <ProtectedRoute>
                <BookingNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/bookings/:id/edit"
            element={
              <ProtectedRoute>
                <BookingEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/services"
            element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/services/new"
            element={
              <ProtectedRoute>
                <ServiceNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/services/:id"
            element={
              <ProtectedRoute>
                <ServiceEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/templates"
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/templates/new"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/templates/:id"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/message-logs"
            element={
              <ProtectedRoute>
                <MessageLogs />
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
