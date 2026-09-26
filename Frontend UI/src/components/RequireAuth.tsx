import { Navigate, Outlet, useLocation } from 'react-router'

export default function RequireAuth() {
  const location = useLocation()
  const isAuthenticated = Boolean(window.localStorage.getItem('vistora-auth-user'))

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
