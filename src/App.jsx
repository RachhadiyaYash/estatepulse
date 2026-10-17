import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ThemeProvider from './components/context/ThemeProvider'
import ToastProvider from './components/context/ToastProvider'
import AuthProvider from './components/context/AuthProvider'
import ProtectedRoute from './components/modules/auth/ProtectedRoute'
import AdminRoute from './components/modules/auth/AdminRoute'
import CrmShell from './components/layout/CrmShell'

import LoginPage from './components/modules/auth/LoginPage'
import DashboardPage from './components/modules/dashboard/DashboardPage'
import LeadsPage from './components/modules/leads/LeadsPage'
import ProjectsPage from './components/modules/projects/ProjectsPage'
import AppointmentsPage from './components/modules/appointments/AppointmentsPage'
import AnalyticsPage from './components/modules/analytics/AnalyticsPage'
import AgentsPage from './components/modules/agents/AgentsPage'
import NotFoundPage from './components/ui/NotFoundPage'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<CrmShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="leads" element={<LeadsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="appointments" element={<AppointmentsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route element={<AdminRoute />}>
                    <Route path="agents" element={<AgentsPage />} />
                    {/* future admin-only routes go inside this AdminRoute block */}
                  </Route>
                
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Route>

              <Route path="/home" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
