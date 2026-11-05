import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import Settings from './pages/Settings';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import './mobile-overrides.css';
import MSMEDashboard from './pages/MSMEDashboard';
import MyShipments from './pages/MyShipments';
import ShipmentDetail from './pages/ShipmentDetail';
import DriverDashboard from './pages/DriverDashboard';
import AdminOperations from './pages/AdminOperations';
import ZoneManagement from './pages/ZoneManagement';
import OperationsMonitor from './pages/OperationsMonitor';
import FleetDashboard from './pages/FleetDashboard';
import Analytics from './pages/Analytics';

import DriverHistory from './pages/DriverHistory';
import SavedLocations from './pages/SavedLocations';
import RouteTracking from './pages/RouteTracking';
import DeliveryReceipt from './pages/DeliveryReceipt';
import CargoVisualizer from './pages/CargoVisualizer';
import NotificationsPage from './pages/NotificationsPage';
import TrackOrders from './pages/TrackOrders';
import AdminTrips from './pages/AdminTrips';
import MyTrips from './pages/MyTrips';
import Vehicles from './pages/Vehicles';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#facc15',
          colorLink: '#facc15',
          colorTextLightSolid: '#000',
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <ModalProvider>
          <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/receipt/:id" element={<DeliveryReceipt />} />

              <Route path="/admin/*" element={
                <ProtectedRoute role="ADMIN">
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="operations" element={<AdminOperations />} />
                      <Route path="operations-monitor" element={<OperationsMonitor />} />
                      <Route path="fleet" element={<FleetDashboard />} />
                      <Route path="zones" element={<ZoneManagement />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="track-orders" element={<TrackOrders />} />
                      <Route path="trips" element={<AdminTrips />} />
                      <Route path="shipments" element={<AdminOperations />} />
                      <Route path="shipments/:id" element={<ShipmentDetail />} />
                      <Route path="companies" element={<SavedLocations />} />
                      <Route path="vehicles" element={<Vehicles />} />
                      <Route path="track/:id" element={<RouteTracking />} />
                      <Route path="cargo-3d" element={<CargoVisualizer />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="settings" element={<Settings />} />

                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/msme/*" element={
                <ProtectedRoute role="MSME">
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<MSMEDashboard />} />
                      <Route path="shipments" element={<MyShipments />} />
                      <Route path="locations" element={<SavedLocations />} />
                      <Route path="shipments/:id" element={<ShipmentDetail />} />
                      <Route path="track/:id" element={<RouteTracking />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="settings" element={<Settings />} />

                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="/driver/*" element={
                <ProtectedRoute role="DRIVER">
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<DriverDashboard />} />
                      <Route path="shipments/:id" element={<ShipmentDetail />} />
                      <Route path="track/:id" element={<RouteTracking />} />
                      <Route path="history" element={<DriverHistory />} />
                      <Route path="trips" element={<MyTrips />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="settings" element={<Settings />} />

                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </NotificationProvider>
        </ModalProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
