import type { ActivityType } from '../types'

export const DEFAULT_ACTIVITY_TYPES: ActivityType[] = [
  // ── 優先表示（プルダウン上位） ──
  { id: 'lesson', name: 'レッスン', intensity: 2, color: 'bg-blue-500', textColor: 'text-white', isRest: false },
  { id: 'forest', name: '森林浴', intensity: 1, color: 'bg-green-500', textColor: 'text-white', isRest: false },
  { id: 'light_lesson', name: 'ライトレッスン', intensity: 1, color: 'bg-emerald-400', textColor: 'text-white', isRest: false },
  { id: 'nori', name: '下乗り', intensity: 2, color: 'bg-purple-500', textColor: 'text-white', isRest: false },
  // ── その他 ──
  { id: 'hayabusa', name: '林道爆走', intensity: 3, color: 'bg-red-500', textColor: 'text-white', isRest: false },
  { id: 'lesson_canter', name: 'レッスン（駆け足20分+）', intensity: 3, color: 'bg-red-400', textColor: 'text-white', isRest: false },
  { id: 'trekking', name: 'トレッキング', intensity: 2, color: 'bg-cyan-500', textColor: 'text-white', isRest: false },
  { id: 'therapy', name: 'ホースセラピー', intensity: 1, color: 'bg-yellow-400', textColor: 'text-gray-800', isRest: false },
  { id: 'light_nori', name: '軽い下乗り', intensity: 1, color: 'bg-lime-400', textColor: 'text-gray-800', isRest: false },
  { id: 'rest', name: '休養', intensity: 0, color: 'bg-gray-300', textColor: 'text-gray-600', isRest: true },
  { id: 'medical', name: '医療・ケア', intensity: 0, color: 'bg-orange-400', textColor: 'text-white', isRest: false },
]

export const INTENSITY_LABELS: Record<number, string> = {
  0: '—',
  1: '低',
  2: '中',
  3: '高',
}

export const INTENSITY_COLORS: Record<number, string> = {
  0: 'text-gray-400',
  1: 'text-green-600',
  2: 'text-blue-600',
  3: 'text-red-600',
}
