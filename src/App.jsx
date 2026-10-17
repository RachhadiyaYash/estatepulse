import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ThemeProvider from './components/theme/ThemeProvider'
import ToastProvider from './context/ToastProvider'
import AuthProvider from './context/AuthProvider'
import ProtectedRoute from './components/ProtectedRoute'
import CrmShell from './components/layout/CrmShell'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './components/leads/LeadsPage'
import ProjectsPage from './pages/ProjectsPage'
import AppointmentsPage from './components/appointments/AppointmentsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AgentsPage from './pages/AgentsPage'
import StyleGuidePage from './pages/StyleGuidePage'
import NotFoundPage from './pages/NotFoundPage'

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
                  <Route path="agents" element={<AgentsPage />} />
                  <Route path="design" element={<StyleGuidePage />} />
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
