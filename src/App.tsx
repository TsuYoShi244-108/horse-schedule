import { useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ScheduleGrid from './components/ScheduleGrid'
import MonthlySummary from './components/MonthlySummary'
import Settings from './components/Settings'
import LockScreen from './components/LockScreen'
import QuickEntry from './components/QuickEntry'
import LoadingScreen from './components/LoadingScreen'

export type Page = 'entry' | 'schedule' | 'summary' | 'settings'

function AppContent() {
  const { user } = useAuth()
  const { loading } = useApp()
  const [page, setPage] = useState<Page>('entry')

  if (loading) return <LoadingScreen />
  if (!user) return <LockScreen />

  return (
    <Layout page={page} onChangePage={setPage}>
      {page === 'entry' && <QuickEntry />}
      {page === 'schedule' && <ScheduleGrid />}
      {page === 'summary' && <MonthlySummary />}
      {page === 'settings' && <Settings />}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  )
}
