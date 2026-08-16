import { Suspense, lazy, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { SplashScreen } from "@/components/splash-screen"
import { Toaster } from "@/components/ui/sonner"
import { ROUTES } from "@/constants"
import { AppLayout } from "@/layouts/AppLayout"
import { Auth } from "@/pages/Auth"
import { Dashboard } from "@/pages/Dashboard"
import { Dossiers } from "@/pages/Dossiers"
import { Landing } from "@/pages/Landing"
import { Settings } from "@/pages/Settings"
import { Templates } from "@/pages/Templates"
import { DocumentLibrary } from "@/pages/studio/DocumentLibrary"
import { ResumeLibraryProvider } from "@/store/resumes"
import { DocumentLibraryProvider } from "@/store/documents"

const ResumeCreator = lazy(() =>
  import("@/pages/ResumeCreator").then((module) => ({
    default: module.ResumeCreator,
  }))
)

const DocumentEditor = lazy(() =>
  import("@/pages/studio/DocumentEditor").then((module) => ({
    default: module.DocumentEditor,
  }))
)

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && (
        <SplashScreen onFinished={() => setShowSplash(false)} />
      )}
      <Toaster />
      <BrowserRouter>
        <ResumeLibraryProvider>
          <DocumentLibraryProvider>
            <Routes>
              <Route path={ROUTES.landing} element={<Landing />} />
              <Route path={ROUTES.login} element={<Auth />} />
              <Route path={ROUTES.register} element={<Auth />} />
              <Route path={ROUTES.app} element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="documents" element={<Dossiers />} />
                <Route path="dossiers" element={<Navigate to={ROUTES.documents} replace />} />
                <Route path="dossiers/templates" element={<Templates />} />
                <Route
                  path="dossiers/creator"
                  element={
                    <Suspense fallback={null}>
                      <ResumeCreator />
                    </Suspense>
                  }
                />
                <Route path="templates" element={<DocumentLibrary />} />
                <Route
                  path="templates/editor"
                  element={
                    <Suspense fallback={null}>
                      <DocumentEditor />
                    </Suspense>
                  }
                />
                <Route path="settings" element={<Settings />} />
                <Route
                  path="*"
                  element={<Navigate to={ROUTES.dashboard} replace />}
                />
              </Route>
              <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
            </Routes>
          </DocumentLibraryProvider>
        </ResumeLibraryProvider>
      </BrowserRouter>
    </>
  )
}

export default App
