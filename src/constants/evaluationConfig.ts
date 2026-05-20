export const DEFAULT_THRESHOLDS = {
  excellent: [10, 20] as [number, number],
  good: [6, 10] as [number, number],
  normal: [3, 6] as [number, number],
  caution: [1, 3] as [number, number],
}

export const RATINGS = [
  { rating: 5 as const, label: '絶好調', emoji: '🌟', color: 'text-yellow-500', bg: 'bg-yellow-50 border-yellow-200' },
  { rating: 4 as const, label: '良好', emoji: '✅', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { rating: 3 as const, label: '普通', emoji: '📊', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  { rating: 2 as const, label: '要注意', emoji: '⚠️', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  { rating: 1 as const, label: '要確認', emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
]

export const DAILY_LESSON_ALERT_THRESHOLD = 3
