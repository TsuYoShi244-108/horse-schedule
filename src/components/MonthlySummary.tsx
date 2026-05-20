import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachWeekOfInterval, startOfWeek } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useApp } from '../context/AppContext'
import { getWeeklyEvaluation, hasDailyAlert } from '../utils/scoring'
import WeeklyRatingBadge from './WeeklyRatingBadge'

export default function MonthlySummary() {
  const { horses, activities, activityTypes, instructors, thresholds } = useApp()
  const [monthBase, setMonthBase] = useState(() => new Date())

  const monthStart = startOfMonth(monthBase)
  const monthEnd = endOfMonth(monthBase)
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 })

  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))
  const instructorMap = Object.fromEntries(instructors.map(i => [i.id, i.name]))

  function getMonthActivities(horseId: string) {
    return activities.filter(a => {
      if (a.horseId !== horseId) return false
      const d = a.date
      return d >= format(monthStart, 'yyyy-MM-dd') && d <= format(monthEnd, 'yyyy-MM-dd')
    })
  }

  function countAlertDays(horseId: string) {
    const dates = new Set(activities.filter(a => a.horseId === horseId).map(a => a.date))
    let count = 0
    for (const date of dates) {
      if (date >= format(monthStart, 'yyyy-MM-dd') && date <= format(monthEnd, 'yyyy-MM-dd')) {
        if (hasDailyAlert(horseId, date, activities, activityTypes)) count++
      }
    }
    return count
  }

  return (
    <div className="space-y-4 pb-20 md:pb-4">
      <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
        <button
          onClick={() => setMonthBase(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >◀</button>
        <div className="font-bold text-gray-800">
          {format(monthBase, 'yyyy年M月', { locale: ja })} 月次集計
        </div>
        <button
          onClick={() => setMonthBase(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >▶</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {horses.map(horse => {
          const monthActs = getMonthActivities(horse.id)
          let totalHours = 0
          let totalScore = 0
          let restDays = 0
          const instructorTally: Record<string, number> = {}

          for (const act of monthActs) {
            const type = typeMap[act.activityTypeId]
            if (!type) continue
            const cnt = act.count ?? 1
            if (!type.isRest) {
              totalHours += cnt
              totalScore += type.intensity * cnt
            } else {
              restDays += cnt
            }
            const name = act.instructorId ? instructorMap[act.instructorId] : act.instructorName
            if (name) instructorTally[name] = (instructorTally[name] ?? 0) + cnt
          }

          const weekEvals = weeks.map(w => {
            const ws = startOfWeek(w, { weekStartsOn: 1 })
            return getWeeklyEvaluation(horse.id, ws, activities, activityTypes, thresholds)
          })
          const alertDays = countAlertDays(horse.id)
          const topInstructors = Object.entries(instructorTally).sort((a, b) => b[1] - a[1]).slice(0, 3)

          return (
            <div key={horse.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-amber-800 text-white px-4 py-3">
                <div className="font-bold">{horse.name}</div>
                {horse.breed && <div className="text-amber-200 text-xs">{horse.breed} / {horse.gender}</div>}
              </div>

              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-800">{totalHours}回</div>
                    <div className="text-xs text-gray-500">総稼働回数</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-lg font-bold text-gray-800">{totalScore.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">強度スコア</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className={`text-lg font-bold ${alertDays > 0 ? 'text-orange-500' : 'text-gray-800'}`}>
                      {alertDays > 0 ? `⚠️${alertDays}` : restDays}
                    </div>
                    <div className="text-xs text-gray-500">{alertDays > 0 ? '注意日数' : '休養日数'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">週次評価推移</div>
                  <div className="flex gap-1">
                    {weekEvals.map(ev => (
                      <div key={ev.weekStart} className="flex-1 flex flex-col items-center gap-0.5">
                        <WeeklyRatingBadge rating={ev.rating} score={ev.totalScore} compact />
                        <div className="text-[9px] text-gray-400">
                          {format(new Date(ev.weekStart), 'M/d')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <WeeklyScoreBarChart weekEvals={weekEvals} />

                {topInstructors.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">担当者</div>
                    <div className="flex flex-wrap gap-1">
                      {topInstructors.map(([name, count]) => (
                        <span key={name} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800">
                          {name} <span className="text-amber-500">{count}回</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeeklyScoreBarChart({ weekEvals }: { weekEvals: ReturnType<typeof getWeeklyEvaluation>[] }) {
  const max = Math.max(...weekEvals.map(e => e.totalScore), 1)
  const ratingColors: Record<number, string> = {
    5: '#f59e0b',
    4: '#22c55e',
    3: '#3b82f6',
    2: '#f97316',
    1: '#ef4444',
  }

  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-1">週別強度スコア</div>
      <svg width="100%" height="48" viewBox={`0 0 ${weekEvals.length * 40} 48`}>
        {weekEvals.map((ev, i) => {
          const barH = Math.max(2, (ev.totalScore / max) * 36)
          const x = i * 40 + 4
          const y = 36 - barH + 4
          return (
            <g key={ev.weekStart}>
              <rect
                x={x}
                y={y}
                width={32}
                height={barH}
                rx={3}
                fill={ratingColors[ev.rating]}
                opacity={0.8}
              />
              <text x={x + 16} y={46} textAnchor="middle" fontSize={8} fill="#9ca3af">
                W{i + 1}
              </text>
              {ev.totalScore > 0 && (
                <text x={x + 16} y={y - 1} textAnchor="middle" fontSize={8} fill="#6b7280">
                  {ev.totalScore}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
