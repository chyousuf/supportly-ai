import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './components/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Inbox from './pages/dashboard/Inbox'
import KnowledgeBase from './pages/dashboard/KnowledgeBase'
import WidgetCustomization from './pages/dashboard/WidgetCustomization'
import Integrations from './pages/dashboard/Integrations'
import Analytics from './pages/dashboard/Analytics'
import Settings from './pages/dashboard/Settings'
import RulesAndPermissions from './pages/dashboard/RulesAndPermissions'
import SuperAdmin from './pages/dashboard/SuperAdmin'
import WidgetShowcase from './pages/WidgetShowcase'
import BackendArchitecturePage from './pages/BackendArchitecturePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/showcase" element={<WidgetShowcase />} />
            <Route path="/setup-widget" element={<WidgetShowcase />} />
            <Route path="/backend-showcase" element={<BackendArchitecturePage />} />
            <Route path="/backend-architecture" element={<BackendArchitecturePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="knowledge" element={<KnowledgeBase />} />
              <Route path="widget" element={<WidgetCustomization />} />
              <Route path="rules-permissions" element={<RulesAndPermissions />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="super-admin" element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdmin />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
