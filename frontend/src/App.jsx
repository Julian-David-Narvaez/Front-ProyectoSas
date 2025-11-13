import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// Auth
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin
import BookingsCalendar from './pages/admin/BookingsCalendar';
import BusinessForm from './pages/admin/BusinessForm';
import EmployeesList from './pages/admin/EmployeesList';
import PageBuilder from './pages/admin/PageBuilder';
import SchedulesList from './pages/admin/SchedulesList';
import ServiceForm from './pages/admin/ServiceForm';
import ServicesList from './pages/admin/ServicesList';
import SuperAdmin from './pages/admin/SuperAdmin';

// Public
import BookingFlow from './pages/public/BookingFlow';
import LandingPage from './pages/public/LandingPage';

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
            path="/admin/business/:businessId/employees"
            element={
              <ProtectedRoute>
                <EmployeesList />
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

          <Route
            path="/admin/superadmin"
            element={
              <ProtectedRoute>
                <SuperAdmin />
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