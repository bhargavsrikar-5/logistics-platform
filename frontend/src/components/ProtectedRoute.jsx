import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }) {
  const userRole = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    const roleRoutes = {
      ADMIN: '/admin',
      
      MSME: '/msme',
      DRIVER: '/driver',
      
    };
    return <Navigate to={roleRoutes[userRole] || '/login'} replace />;
  }

  return children;
}
