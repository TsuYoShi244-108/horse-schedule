import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { Horse, ActivityType } from '../types'
import { INTENSITY_LABELS } from '../constants/activityTypes'

type Tab = 'horses' | 'instructors' | 'activities' | 'thresholds' | 'pin'

function newId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export default function Settings() {
  const [tab, setTab] = useState<Tab>('horses')

  return (
    <div className="pb-20 md:pb-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {([
            { key: 'horses', label: '🐴 馬' },
            { key: 'instructors', label: '👤 担当者' },
            { key: 'activities', label: '🏷 活動メニュー' },
            { key: 'thresholds', label: '⚙️ 評価設定' },
            { key: 'pin', label: '🔑 PIN変更' },
          ] as { key: Tab; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-amber-600 text-amber-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {tab === 'horses' && <HorseSettings />}
          {tab === 'instructors' && <InstructorSettings />}
          {tab === 'activities' && <ActivityTypeSettings />}
          {tab === 'thresholds' && <ThresholdSettings />}
          {tab === 'pin' && <PinSettings />}
        </div>
      </div>
    </div>
  )
}

function HorseSettings() {
  const { horses, addHorse, updateHorse, deleteHorse } = useApp()
  const [editing, setEditing] = useState<Horse | null>(null)
  const [form, setForm] = useState<Partial<Horse>>({})

  function startAdd() {
    setEditing({ id: newId('horse'), name: '' })
    setForm({ name: '', breed: '', gender: '', birthYear: undefined, coatColor: '', note: '' })
  }

  function startEdit(h: Horse) {
    setEditing(h)
    setForm({ ...h })
  }

  function save() {
    if (!form.name?.trim()) return
    const horse: Horse = { id: editing!.id, name: form.name!, breed: form.breed, gender: form.gender, birthYear: form.birthYear, coatColor: form.coatColor, note: form.note }
    if (horses.find(h => h.id === editing!.id)) {
      updateHorse(horse)
    } else {
      addHorse(horse)
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">馬リスト（{horses.length}頭）</h3>
        <button onClick={startAdd} className="px-3 py-1.5 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800">＋ 追加</button>
      </div>

      {editing && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <h4 className="font-medium text-amber-800 text-sm">{horses.find(h => h.id === editing.id) ? '編集' : '新規追加'}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">名前 *</label>
              <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">品種</label>
              <input value={form.breed ?? ''} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">性別</label>
              <select value={form.gender ?? ''} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">—</option>
                <option>牡馬</option><option>牝馬</option><option>騙馬</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">誕生年</label>
              <input type="number" value={form.birthYear ?? ''} onChange={e => setForm(f => ({ ...f, birthYear: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">毛色</label>
              <input value={form.coatColor ?? ''} onChange={e => setForm(f => ({ ...f, coatColor: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">メモ</label>
              <input value={form.note ?? ''} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">キャンセル</button>
            <button onClick={save} className="px-3 py-1.5 text-sm text-white bg-amber-700 rounded-lg hover:bg-amber-800">保存</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {horses.map(h => (
          <div key={h.id} className="py-2 flex items-center justify-between">
            <div>
              <span className="font-medium text-gray-800">{h.name}</span>
              {h.breed && <span className="text-xs text-gray-400 ml-2">{h.breed}</span>}
              {h.gender && <span className="text-xs text-gray-400 ml-1">/ {h.gender}</span>}
              {h.birthYear && <span className="text-xs text-gray-400 ml-1">/ {h.birthYear}年生</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(h)} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">編集</button>
              <button onClick={() => deleteHorse(h.id)} className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InstructorSettings() {
  const { instructors, addInstructor, deleteInstructor } = useApp()
  const [name, setName] = useState('')

  function add() {
    if (!name.trim()) return
    addInstructor({ id: newId('inst'), name: name.trim(), isRegular: true })
    setName('')
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="担当者名"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button onClick={add} className="px-3 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800">追加</button>
      </div>
      <div className="divide-y divide-gray-100">
        {instructors.map(i => (
          <div key={i.id} className="py-2 flex items-center justify-between">
            <span className="text-gray-800">{i.name}</span>
            <button onClick={() => deleteInstructor(i.id)} className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded">削除</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityTypeSettings() {
  const { activityTypes, addActivityType, updateActivityType, deleteActivityType } = useApp()
  const [editing, setEditing] = useState<ActivityType | null>(null)
  const [form, setForm] = useState<Partial<ActivityType>>({})

  const BG_OPTIONS = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-400',
    'bg-lime-400', 'bg-green-500', 'bg-emerald-400', 'bg-cyan-500',
    'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-gray-300',
  ]

  function startAdd() {
    setEditing({ id: newId('type'), name: '', intensity: 1, color: 'bg-blue-500', textColor: 'text-white', isRest: false })
    setForm({ name: '', intensity: 1, color: 'bg-blue-500', textColor: 'text-white', isRest: false })
  }

  function save() {
    if (!form.name?.trim()) return
    const t: ActivityType = {
      id: editing!.id,
      name: form.name!,
      intensity: (form.intensity ?? 1) as 0|1|2|3,
      color: form.color ?? 'bg-blue-500',
      textColor: form.textColor ?? 'text-white',
      isRest: form.isRest ?? false,
    }
    if (activityTypes.find(x => x.id === t.id)) {
      updateActivityType(t)
    } else {
      addActivityType(t)
    }
    setEditing(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-700">活動メニュー</h3>
        <button onClick={startAdd} className="px-3 py-1.5 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800">＋ 追加</button>
      </div>

      {editing && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">活動名 *</label>
              <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">運動強度（0〜3）</label>
              <select value={form.intensity ?? 1} onChange={e => setForm(f => ({ ...f, intensity: Number(e.target.value) as 0|1|2|3 }))}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                {[0,1,2,3].map(n => <option key={n} value={n}>{n} — {INTENSITY_LABELS[n]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">色</label>
            <div className="flex flex-wrap gap-2">
              {BG_OPTIONS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full ${c} ${form.color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isRest" checked={form.isRest ?? false} onChange={e => setForm(f => ({ ...f, isRest: e.target.checked }))} />
            <label htmlFor="isRest" className="text-sm text-gray-700">休息日としてカウント</label>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(null)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg">キャンセル</button>
            <button onClick={save} className="px-3 py-1.5 text-sm text-white bg-amber-700 rounded-lg hover:bg-amber-800">保存</button>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {activityTypes.map(t => (
          <div key={t.id} className="py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full ${t.color}`} />
              <span className="font-medium text-gray-800 text-sm">{t.name}</span>
              <span className="text-xs text-gray-400">強度{t.intensity}</span>
              {t.isRest && <span className="text-xs text-gray-400">（休息）</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(t); setForm({ ...t }) }} className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded">編集</button>
              <button onClick={() => deleteActivityType(t.id)} className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded">削除</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PinSettings() {
  const { user, changePin } = useAuth()
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'wrong_pin' | 'mismatch' | 'too_short' | 'error'>('idle')

  if (!user) return null

  async function handleChange() {
    if (newPin.length < 4) { setStatus('too_short'); return }
    if (newPin !== confirmPin) { setStatus('mismatch'); return }
    setStatus('loading')
    const result = await changePin(user!.id, currentPin, newPin)
    setStatus(result)
    if (result === 'ok') {
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
    }
  }

  const messages: Record<string, { text: string; color: string }> = {
    ok: { text: 'PINを変更しました', color: 'text-green-700 bg-green-50 border-green-200' },
    wrong_pin: { text: '現在のPINが正しくありません', color: 'text-red-600 bg-red-50 border-red-200' },
    mismatch: { text: '新しいPINと確認用PINが一致しません', color: 'text-red-600 bg-red-50 border-red-200' },
    too_short: { text: 'PINは4桁以上で設定してください', color: 'text-red-600 bg-red-50 border-red-200' },
    error: { text: 'エラーが発生しました', color: 'text-red-600 bg-red-50 border-red-200' },
  }

  return (
    <div className="max-w-sm space-y-4">
      <p className="text-sm text-gray-600">
        ログイン中: <span className="font-medium text-amber-800">👤 {user.name}</span>
        <br />
        自分のPINを変更できます（4桁以上の数字）。
      </p>

      <div>
        <label className="block text-xs text-gray-600 mb-1">現在のPIN</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={currentPin}
          onChange={e => { setCurrentPin(e.target.value.replace(/\D/g, '')); setStatus('idle') }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest"
          placeholder="••••"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">新しいPIN</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={newPin}
          onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setStatus('idle') }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest"
          placeholder="••••"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">新しいPIN（確認）</label>
        <input
          type="password"
          inputMode="numeric"
          maxLength={8}
          value={confirmPin}
          onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setStatus('idle') }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 tracking-widest"
          placeholder="••••"
        />
      </div>

      {status !== 'idle' && status !== 'loading' && messages[status] && (
        <div className={`text-sm border rounded-lg px-3 py-2 ${messages[status].color}`}>
          {messages[status].text}
        </div>
      )}

      <button
        onClick={handleChange}
        disabled={status === 'loading' || !currentPin || !newPin || !confirmPin}
        className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? '変更中…' : 'PINを変更'}
      </button>
    </div>
  )
}

function ThresholdSettings() {
  const { thresholds, updateThresholds } = useApp()
  const [form, setForm] = useState(thresholds)

  function save() {
    updateThresholds(form)
    alert('保存しました')
  }

  return (
    <div className="space-y-4 max-w-sm">
      <p className="text-sm text-gray-600">週次評価スコアの閾値を設定します。スコア = 強度レベル × 時間（h）の合計です。</p>

      {([
        { key: 'excellent', label: '★★★★★ 絶好調', color: 'text-yellow-500' },
        { key: 'good', label: '★★★★ 良好', color: 'text-green-600' },
        { key: 'normal', label: '★★★ 普通', color: 'text-blue-600' },
        { key: 'caution', label: '★★ 要注意', color: 'text-orange-500' },
      ] as const).map(row => (
        <div key={row.key}>
          <label className={`block text-sm font-medium mb-1 ${row.color}`}>{row.label}</label>
          <div className="flex items-center gap-2">
            <input type="number" step="0.5" min="0"
              value={form[row.key][0]}
              onChange={e => setForm(f => ({ ...f, [row.key]: [Number(e.target.value), f[row.key][1]] }))}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-gray-400">〜</span>
            <input type="number" step="0.5" min="0"
              value={form[row.key][1]}
              onChange={e => setForm(f => ({ ...f, [row.key]: [f[row.key][0], Number(e.target.value)] }))}
              className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-xs text-gray-400">pt</span>
          </div>
        </div>
      ))}

      <button onClick={save} className="px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-800">
        保存
      </button>
    </div>
  )
}
