import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../lib/authContext'

export default function RequireAuth() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
