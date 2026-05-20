import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Page } from '../App'

interface Props {
  page: Page
  onChangePage: (p: Page) => void
  children: ReactNode
}

const NAV_ITEMS: { key: Page; label: string; icon: string }[] = [
  { key: 'entry', label: '入力', icon: '✏️' },
  { key: 'schedule', label: 'スケジュール', icon: '📅' },
  { key: 'summary', label: '月次集計', icon: '📊' },
  { key: 'settings', label: '設定', icon: '⚙️' },
]

export default function Layout({ page, onChangePage, children }: Props) {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-amber-800 text-white shadow-md">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐴</span>
            <span className="font-bold text-lg tracking-wide">馬稼働管理</span>
          </div>

          <div className="flex items-center gap-3">
            <nav className="hidden md:flex gap-1">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.key}
                  onClick={() => onChangePage(item.key)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    page === item.key
                      ? 'bg-amber-600 text-white'
                      : 'text-amber-100 hover:bg-amber-700'
                  }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </nav>

            {user && (
              <div className="flex items-center gap-2 border-l border-amber-600 pl-3 ml-1">
                <span className="text-amber-200 text-sm hidden sm:inline">
                  👤 {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-xs px-2.5 py-1 rounded-md bg-amber-700 hover:bg-amber-600 text-amber-100 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl w-full mx-auto px-2 md:px-4 py-4">
        {children}
      </main>

      {/* モバイル下部ナビ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {NAV_ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => onChangePage(item.key)}
            className={`flex-1 flex flex-col items-center py-2 text-xs ${
              page === item.key ? 'text-amber-700 font-bold' : 'text-gray-500'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
