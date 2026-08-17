import { Suspense, lazy, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { SplashScreen } from "@/components/splash-screen"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ROUTES } from "@/constants"
import { AppLayout } from "@/layouts/AppLayout"
import { Auth } from "@/pages/Auth"
import { Dashboard } from "@/pages/Dashboard"
import { Dossiers } from "@/pages/Dossiers"
import { ForgotPassword } from "@/pages/ForgotPassword"
import { Landing } from "@/pages/Landing"
import { MfaVerify } from "@/pages/MfaVerify"
import { Notepad } from "@/pages/Notepad"
import { NotepadEditor } from "@/pages/NotepadEditor"
import { PageDetail } from "@/pages/PageDetail"
import { Pages } from "@/pages/Pages"
import { ProjectDetail } from "@/pages/ProjectDetail"
import { Projects } from "@/pages/Projects"
import { Settings } from "@/pages/Settings"
import { Templates } from "@/pages/Templates"
import { DocumentLibrary } from "@/pages/studio/DocumentLibrary"
import { ResumeLibraryProvider } from "@/store/resumes"
import { DocumentLibraryProvider } from "@/store/documents"
import { NotificationsProvider } from "@/store/notifications"
import { PagesProvider } from "@/store/pages"

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
        <TooltipProvider>
          <ResumeLibraryProvider>
            <DocumentLibraryProvider>
              <NotificationsProvider>
                <PagesProvider>
                  <Routes>
                    <Route path={ROUTES.landing} element={<Landing />} />
                    <Route path={ROUTES.login} element={<Auth />} />
                    <Route path={ROUTES.register} element={<Auth />} />
                    <Route path={ROUTES.forgotPassword} element={<ForgotPassword />} />
                    <Route path={ROUTES.resetPassword} element={<ForgotPassword />} />
                    <Route path={ROUTES.mfaVerify} element={<MfaVerify />} />
                    <Route path={ROUTES.app} element={<AppLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="pages" element={<Pages />} />
                      <Route path="pages/:id" element={<PageDetail />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="projects/:id" element={<ProjectDetail />} />
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
                      <Route path="notepad" element={<Notepad />} />
                      <Route path="notepad/:id" element={<NotepadEditor />} />
                      <Route
                        path="*"
                        element={<Navigate to={ROUTES.dashboard} replace />}
                      />
                    </Route>
                    <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
                  </Routes>
                </PagesProvider>
              </NotificationsProvider>
            </DocumentLibraryProvider>
          </ResumeLibraryProvider>
        </TooltipProvider>
      </BrowserRouter>
    </>
  )
}

export default App
