import { useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { SplashScreen } from "@/components/splash-screen"
import { ROUTES } from "@/constants"
import { AppLayout } from "@/layouts/AppLayout"
import { Auth } from "@/pages/Auth"
import { Dashboard } from "@/pages/Dashboard"
import { Dossiers } from "@/pages/Dossiers"
import { Landing } from "@/pages/Landing"
import { Reports } from "@/pages/Reports"
import { Settings } from "@/pages/Settings"
import { Users } from "@/pages/Users"

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && (
        <SplashScreen onFinished={() => setShowSplash(false)} />
      )}
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.landing} element={<Landing />} />
          <Route path={ROUTES.login} element={<Auth />} />
          <Route path={ROUTES.register} element={<Auth />} />
          <Route path={ROUTES.app} element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dossiers" element={<Dossiers />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={<Navigate to={ROUTES.dashboard} replace />}
            />
          </Route>
          <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
