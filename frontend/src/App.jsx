import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Admin
import BusinessForm from './pages/admin/BusinessForm';
import ServicesList from './pages/admin/ServicesList';
import ServiceForm from './pages/admin/ServiceForm';
import SchedulesList from './pages/admin/SchedulesList';
import PageBuilder from './pages/admin/PageBuilder';
import BookingsCalendar from './pages/admin/BookingsCalendar';

// Public
import LandingPage from './pages/public/LandingPage';
import BookingFlow from './pages/public/BookingFlow';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/new"
            element={
              <ProtectedRoute>
                <BusinessForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/services"
            element={
              <ProtectedRoute>
                <ServicesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/services/new"
            element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/services/:serviceId/edit"
            element={
              <ProtectedRoute>
                <ServiceForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/schedules"
            element={
              <ProtectedRoute>
                <SchedulesList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/page"
            element={
              <ProtectedRoute>
                <PageBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/business/:businessId/bookings"
            element={
              <ProtectedRoute>
                <BookingsCalendar />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/:slug/reservar" element={<BookingFlow />} />
          <Route path="/:slug" element={<LandingPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;