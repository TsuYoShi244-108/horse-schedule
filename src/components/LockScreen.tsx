import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export default function LockScreen() {
  const { login } = useAuth()
  const { instructors } = useApp()
  const [selectedId, setSelectedId] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const pinRef = useRef<HTMLInputElement>(null)

  // ログインに使えるのは常勤メンバーのみ
  const regularMembers = instructors.filter(i => i.isRegular)

  const selected = regularMembers.find(i => i.id === selectedId)

  useEffect(() => {
    if (selectedId) {
      setPin('')
      setError('')
      pinRef.current?.focus()
    }
  }, [selectedId])

  async function handleLogin() {
    if (!selected || pin.length < 4) return
    setLoading(true)
    setError('')
    try {
      const ok = await login(selected.id, selected.name, pin)
      if (!ok) {
        setError('PINが正しくありません')
        setPin('')
        pinRef.current?.focus()
      }
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🐴</div>
          <h1 className="text-2xl font-bold text-amber-900">馬稼働管理</h1>
          <p className="text-sm text-amber-700 mt-1">常勤メンバー専用</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
          <div className="bg-amber-800 px-5 py-4">
            <h2 className="text-white font-bold text-base">ログイン</h2>
          </div>

          <div className="p-5 space-y-4">
            {/* 名前選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">— 選択してください —</option>
                {regularMembers.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            {/* PIN入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN（4桁以上）
              </label>
              <input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError('') }}
                onKeyDown={handleKeyDown}
                disabled={!selectedId || loading}
                placeholder="••••"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-50 disabled:text-gray-400 tracking-widest text-center text-lg"
              />
            </div>

            {/* エラー */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* ログインボタン */}
            <button
              onClick={handleLogin}
              disabled={!selectedId || pin.length < 4 || loading}
              className="w-full py-2.5 bg-amber-700 text-white font-medium text-sm rounded-lg hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  確認中…
                </>
              ) : 'ログイン'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-amber-600 mt-4">
          PINを忘れた場合は管理者に連絡してください
        </p>
      </div>
    </div>
  )
}
