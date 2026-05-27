import {
  createContext, useContext, useState, useEffect,
  useCallback, type ReactNode,
} from 'react'
import type { Horse, Instructor, Activity, ActivityType, EvaluationThresholds } from '../types'
import { DEFAULT_ACTIVITY_TYPES } from '../constants/activityTypes'
import { INITIAL_HORSES } from '../constants/horses'
import { INITIAL_INSTRUCTORS } from '../constants/instructors'
import { DEFAULT_THRESHOLDS } from '../constants/evaluationConfig'
import {
  getSettings, saveSettings, updateSettings,
  addActivityDoc, updateActivityDoc, deleteActivityDoc,
  subscribeActivities,
  type AppSettings,
} from '../lib/firestoreDB'
import { ensureAuth } from '../lib/firebase'

const CURRENT_DATA_VERSION = 3

interface AppContextValue {
  horses: Horse[]
  instructors: Instructor[]
  activities: Activity[]
  activityTypes: ActivityType[]
  thresholds: EvaluationThresholds
  loading: boolean
  addActivity: (a: Activity) => Promise<void>
  updateActivity: (a: Activity) => Promise<void>
  deleteActivity: (id: string) => Promise<void>
  addHorse: (h: Horse) => Promise<void>
  updateHorse: (h: Horse) => Promise<void>
  deleteHorse: (id: string) => Promise<void>
  addInstructor: (i: Instructor) => Promise<void>
  deleteInstructor: (id: string) => Promise<void>
  addActivityType: (t: ActivityType) => Promise<void>
  updateActivityType: (t: ActivityType) => Promise<void>
  deleteActivityType: (id: string) => Promise<void>
  updateThresholds: (t: EvaluationThresholds) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

// ── マイグレーション ─────────────────────────────────
const DEFAULT_HORSE_MAP = Object.fromEntries(INITIAL_HORSES.map(h => [h.id, h]))
const DEFAULT_TYPE_MAP = Object.fromEntries(DEFAULT_ACTIVITY_TYPES.map(t => [t.id, t]))
const LATE_HORSE_IDS = ['yume', 'maruko', 'potato']

function migrate(raw: Partial<AppSettings>): AppSettings {
  let v = raw.dataVersion ?? 0
  let horses: Horse[] = raw.horses ?? INITIAL_HORSES
  let instructors: Instructor[] = raw.instructors ?? INITIAL_INSTRUCTORS
  let activityTypes: ActivityType[] = raw.activityTypes ?? DEFAULT_ACTIVITY_TYPES
  const thresholds: EvaluationThresholds = raw.thresholds ?? DEFAULT_THRESHOLDS

  if (v < 2) {
    // 名前の修正（"暗い" → "ダーク" など）
    horses = horses.map(h => {
      const def = DEFAULT_HORSE_MAP[h.id]
      return def ? { ...h, name: def.name } : h
    })
    // ポニー系を末尾に
    const main = horses.filter(h => !LATE_HORSE_IDS.includes(h.id))
    const late = LATE_HORSE_IDS.map(id => horses.find(h => h.id === id)).filter(Boolean) as Horse[]
    horses = [...main, ...late]
    // 活動種別の強度・色をデフォルトで上書き
    activityTypes = activityTypes.map(t => DEFAULT_TYPE_MAP[t.id] ?? t)
    for (const def of DEFAULT_ACTIVITY_TYPES) {
      if (!activityTypes.find(t => t.id === def.id)) activityTypes.push(def)
    }
    const defOrder = DEFAULT_ACTIVITY_TYPES.map(t => t.id)
    const builtIn = defOrder.map(id => activityTypes.find(t => t.id === id)).filter(Boolean) as ActivityType[]
    const userAdded = activityTypes.filter(t => !defOrder.includes(t.id))
    activityTypes = [...builtIn, ...userAdded]
    // 辻井を追加
    if (!instructors.find(i => i.id === 'tsujii')) {
      instructors = [...instructors, { id: 'tsujii', name: '辻井', isRegular: true }]
    }
    v = 2
  }

  if (v < 3) {
    // 刃（はや）→ 刃（じん）に改名
    horses = horses.map(h => h.id === 'haya' ? { ...h, name: '刃（じん）' } : h)
    v = 3
  }

  return { dataVersion: v, horses, instructors, activityTypes, thresholds }
}

function initialSettings(): AppSettings {
  return {
    dataVersion: CURRENT_DATA_VERSION,
    horses: INITIAL_HORSES,
    instructors: INITIAL_INSTRUCTORS,
    activityTypes: DEFAULT_ACTIVITY_TYPES,
    thresholds: DEFAULT_THRESHOLDS,
  }
}

// ── Provider ────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<AppSettings>(initialSettings)
  const [activities, setActivities] = useState<Activity[]>([])

  // 初期ロード：Firestore から settings を取得
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    ;(async () => {
      try {
        await ensureAuth()
        let s = await getSettings()
        if (!s) {
          // 初回：デフォルトデータを保存
          s = initialSettings()
          await saveSettings(s)
        } else if ((s.dataVersion ?? 0) < CURRENT_DATA_VERSION) {
          // マイグレーション実行
          s = migrate(s)
          await saveSettings(s)
        }
        setSettings(s)
      } catch (err) {
        console.error('Firestore 接続エラー:', err)
      }

      // アクティビティのリアルタイム購読
      unsubscribe = subscribeActivities(acts => {
        setActivities(acts)
        setLoading(false)
      })
    })()

    return () => { unsubscribe?.() }
  }, [])

  // Settings 更新ヘルパー
  const patchSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    await updateSettings(patch)
  }, [settings])

  const ctx: AppContextValue = {
    loading,
    horses: settings.horses,
    instructors: settings.instructors,
    activityTypes: settings.activityTypes,
    thresholds: settings.thresholds,
    activities,

    addActivity: async (a) => {
      setActivities(prev => [...prev, a])
      await addActivityDoc(a).catch(err => console.error('[Firestore] addActivity failed:', err))
    },
    updateActivity: async (a) => {
      setActivities(prev => prev.map(x => x.id === a.id ? a : x))
      await updateActivityDoc(a).catch(err => console.error('[Firestore] updateActivity failed:', err))
    },
    deleteActivity: async (id) => {
      setActivities(prev => prev.filter(x => x.id !== id))
      await deleteActivityDoc(id).catch(err => console.error('[Firestore] deleteActivity failed:', err))
    },

    addHorse: async (h) => patchSettings({ horses: [...settings.horses, h] }),
    updateHorse: async (h) => patchSettings({ horses: settings.horses.map(x => x.id === h.id ? h : x) }),
    deleteHorse: async (id) => patchSettings({ horses: settings.horses.filter(x => x.id !== id) }),

    addInstructor: async (i) => patchSettings({ instructors: [...settings.instructors, i] }),
    deleteInstructor: async (id) => patchSettings({ instructors: settings.instructors.filter(x => x.id !== id) }),

    addActivityType: async (t) => patchSettings({ activityTypes: [...settings.activityTypes, t] }),
    updateActivityType: async (t) => patchSettings({ activityTypes: settings.activityTypes.map(x => x.id === t.id ? t : x) }),
    deleteActivityType: async (id) => patchSettings({ activityTypes: settings.activityTypes.filter(x => x.id !== id) }),

    updateThresholds: async (t) => patchSettings({ thresholds: t }),
  }

  return <AppContext.Provider value={ctx}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
