import { Suspense, lazy, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireMfaChallenge,
} from "@/components/common/protected-route"
import { SplashScreen } from "@/components/marketing/splash-screen"
import { PublicThemeScope } from "@/components/common/public-theme-scope"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ROUTES } from "@/constants"
import { AppLayout } from "@/layouts/AppLayout"
import { ProjectLayout } from "@/layouts/ProjectLayout"
import { Auth } from "@/pages/Auth"
import { Dashboard } from "@/pages/Dashboard"
import { ForgotPassword } from "@/pages/ForgotPassword"
import { Landing } from "@/pages/Landing"
import { MfaVerify } from "@/pages/MfaVerify"
import { Settings } from "@/pages/Settings"
import { AuthProvider } from "@/store/auth"
import { ConnectivityWatcher } from "@/components/common/connectivity-watcher"
import { ResumeLibraryProvider } from "@/store/resumes"
import { DocumentLibraryProvider } from "@/store/documents"
import { NotificationsProvider } from "@/store/notifications"
import { PagesProvider } from "@/store/pages"
import { ProjectsProvider } from "@/store/projects"

import { ProjectList } from "@/pages/projects/ProjectList"
import { ProjectOverview } from "@/pages/projects/ProjectOverview"
import { ProjectDocuments } from "@/pages/projects/ProjectDocuments"
import { ProjectNotes } from "@/pages/projects/ProjectNotes"
import { ProjectTimesheet } from "@/pages/projects/ProjectTimesheet"
import { ResumeManager } from "@/pages/resumes/ResumeManager"

const ResumeCreator = lazy(() =>
  import("@/pages/ResumeCreator").then((m) => ({ default: m.ResumeCreator }))
)

const DocumentEditor = lazy(() =>
  import("@/pages/studio/DocumentEditor").then((m) => ({ default: m.DocumentEditor }))
)

const NotepadEditor = lazy(() =>
  import("@/pages/NotepadEditor").then((m) => ({ default: m.NotepadEditor }))
)

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && (
        <SplashScreen onFinished={() => setShowSplash(false)} />
      )}
      <Toaster />
      <ConnectivityWatcher />
      <BrowserRouter>
        <TooltipProvider>
          <AuthProvider>
            <ResumeLibraryProvider>
              <DocumentLibraryProvider>
                <NotificationsProvider>
                  <PagesProvider>
                    <ProjectsProvider>
                      <Routes>
                        {/* Public routes */}
                        <Route
                          path={ROUTES.landing}
                          element={
                            <PublicThemeScope>
                              <Landing />
                            </PublicThemeScope>
                          }
                        />
                        <Route element={<RedirectIfAuthenticated />}>
                          <Route
                            path={ROUTES.login}
                            element={<PublicThemeScope><Auth /></PublicThemeScope>}
                          />
                          <Route
                            path={ROUTES.register}
                            element={<PublicThemeScope><Auth /></PublicThemeScope>}
                          />
                          <Route
                            path={ROUTES.forgotPassword}
                            element={<PublicThemeScope><ForgotPassword /></PublicThemeScope>}
                          />
                          <Route
                            path={ROUTES.mfaVerify}
                            element={
                              <RequireMfaChallenge>
                                <PublicThemeScope><MfaVerify /></PublicThemeScope>
                              </RequireMfaChallenge>
                            }
                          />
                        </Route>
                        <Route
                          path={ROUTES.resetPassword}
                          element={<PublicThemeScope><ForgotPassword /></PublicThemeScope>}
                        />

                        {/* App routes */}
                        <Route path={ROUTES.app} element={<RequireAuth><AppLayout /></RequireAuth>}>
                          <Route index element={<Dashboard />} />

                          {/* Projects — flat list */}
                          <Route path="projects" element={<ProjectList />} />

                          {/* Resumes */}
                          <Route path="resumes" element={<ResumeManager />} />
                          <Route
                            path="resumes/builder"
                            element={<Suspense fallback={null}><ResumeCreator /></Suspense>}
                          />
                          <Route
                            path="resumes/builder/:resumeId"
                            element={<Suspense fallback={null}><ResumeCreator /></Suspense>}
                          />

                          {/* Settings */}
                          <Route path="settings" element={<Settings />} />

                          <Route path="*" element={<Navigate to={ROUTES.dashboard} replace />} />
                        </Route>

                        {/* Project workspace — nested under ProjectLayout */}
                        <Route
                          path="/app/projects/:id"
                          element={<RequireAuth><ProjectLayout /></RequireAuth>}
                        >
                          <Route index element={<ProjectOverview />} />
                          <Route path="documents" element={<ProjectDocuments />} />
                          <Route
                            path="documents/:docId"
                            element={<Suspense fallback={null}><DocumentEditor /></Suspense>}
                          />
                          <Route path="notes" element={<ProjectNotes />} />
                          <Route
                            path="notes/:noteId"
                            element={<Suspense fallback={null}><NotepadEditor /></Suspense>}
                          />
                          <Route path="timesheet" element={<ProjectTimesheet />} />
                        </Route>

                        <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
                      </Routes>
                    </ProjectsProvider>
                  </PagesProvider>
                </NotificationsProvider>
              </DocumentLibraryProvider>
            </ResumeLibraryProvider>
          </AuthProvider>
        </TooltipProvider>
      </BrowserRouter>
    </>
  )
}

export default App
