import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Admin-only layout route. In App.jsx, wrap any admin-only route with it:
 *
 *   <Route element={<AdminRoute />}>
 *     <Route path="agents" element={<AgentsPage />} />
 *   </Route>
 *
 * Future admin-only routes go inside that same AdminRoute block.
 * Requires an authenticated session whose profile role is 'admin'.
 */
export default function AdminRoute() {
  const { isAuthenticated, session } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (session?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}