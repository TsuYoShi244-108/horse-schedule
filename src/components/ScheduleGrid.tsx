import { useState } from 'react'
import {
  startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks,
  isToday
} from 'date-fns'
import { ja } from 'date-fns/locale'
import { useApp } from '../context/AppContext'
import { hasDailyAlert, getWeeklyEvaluation } from '../utils/scoring'
import ActivityModal from './ActivityModal'
import WeeklyRatingBadge from './WeeklyRatingBadge'
import type { Activity } from '../types'

export default function ScheduleGrid() {
  const { horses, activities, activityTypes, instructors, thresholds, addActivity, updateActivity, deleteActivity } = useApp()
  const [weekBase, setWeekBase] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [modal, setModal] = useState<{
    open: boolean
    date: string
    horseId: string
    horseName: string
    existing?: Activity
  }>({ open: false, date: '', horseId: '', horseName: '' })

  const weekDays = eachDayOfInterval({ start: weekBase, end: endOfWeek(weekBase, { weekStartsOn: 1 }) })
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))
  const instructorMap = Object.fromEntries(instructors.map(i => [i.id, i.name]))

  function openCell(horseId: string, horseName: string, date: Date, existing?: Activity) {
    const dateStr = format(date, 'yyyy-MM-dd')
    setModal({ open: true, date: dateStr, horseId, horseName, existing })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setWeekBase(w => subWeeks(w, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >◀</button>
        <div className="text-center">
          <div className="font-bold text-gray-800">
            {format(weekBase, 'yyyy年M月d日', { locale: ja })} 〜 {format(endOfWeek(weekBase, { weekStartsOn: 1 }), 'M月d日', { locale: ja })}
          </div>
          <button
            onClick={() => setWeekBase(startOfWeek(new Date(), { weekStartsOn: 1 }))}
            className="text-xs text-amber-600 hover:underline mt-0.5"
          >
            今週に戻る
          </button>
        </div>
        <button
          onClick={() => setWeekBase(w => addWeeks(w, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >▶</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 text-left px-3 py-2 text-gray-500 font-medium border-b border-r border-gray-200 min-w-[120px]">
                馬
              </th>
              {weekDays.map(day => (
                <th
                  key={day.toISOString()}
                  className={`px-2 py-2 text-center font-medium border-b border-gray-200 min-w-[110px] ${
                    isToday(day) ? 'bg-amber-50 text-amber-700' : 'text-gray-600'
                  }`}
                >
                  <div>{format(day, 'M/d', { locale: ja })}</div>
                  <div className="text-xs font-normal">{format(day, 'EEE', { locale: ja })}</div>
                </th>
              ))}
              <th className="px-2 py-2 text-center font-medium border-b border-gray-200 min-w-[90px] text-gray-500">
                週評価
              </th>
            </tr>
          </thead>
          <tbody>
            {horses.map((horse, hi) => {
              const weekEval = getWeeklyEvaluation(horse.id, weekBase, activities, activityTypes, thresholds)
              return (
                <tr key={horse.id} className={hi % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className={`sticky left-0 z-10 px-3 py-2 border-b border-r border-gray-200 font-medium text-gray-800 ${hi % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="text-sm leading-tight">{horse.name}</div>
                    {horse.breed && <div className="text-xs text-gray-400">{horse.breed}</div>}
                  </td>
                  {weekDays.map(day => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayActivities = activities.filter(a => a.horseId === horse.id && a.date === dateStr)
                    const alert = hasDailyAlert(horse.id, dateStr, activities, activityTypes)
                    return (
                      <td
                        key={day.toISOString()}
                        className={`px-1 py-1 border-b border-gray-200 align-top min-h-[60px] ${
                          isToday(day) ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <div className="min-h-[52px] space-y-0.5">
                          {alert && (
                            <div className="text-xs text-orange-500 font-bold mb-0.5">⚠️ 過多</div>
                          )}
                          {dayActivities.map(act => {
                            const type = typeMap[act.activityTypeId]
                            if (!type) return null
                            const instructor = act.instructorId ? instructorMap[act.instructorId] : act.instructorName
                            const circleNum = ['①','②','③','④','⑤'][Math.min((act.count ?? 1) - 1, 4)]
                            return (
                              <div
                                key={act.id}
                                onClick={e => { e.stopPropagation(); openCell(horse.id, horse.name, day, act) }}
                                className={`rounded px-1.5 py-0.5 text-xs leading-tight cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity ${type.color} ${type.textColor}`}
                              >
                                <div className="font-medium truncate flex items-center gap-1">
                                  <span className="text-sm font-bold">{circleNum}</span>
                                  <span className="truncate">{type.name}</span>
                                </div>
                                {instructor && <div className="opacity-70 text-[10px] truncate">{instructor}</div>}
                              </div>
                            )
                          })}
                          <div
                            onClick={() => openCell(horse.id, horse.name, day)}
                            className="min-h-[16px] cursor-pointer hover:bg-amber-50 rounded transition-colors flex items-center justify-center"
                          >
                            {dayActivities.length === 0 && (
                              <span className="text-gray-300 text-xs">＋</span>
                            )}
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="px-2 py-2 border-b border-gray-200 text-center">
                    <WeeklyRatingBadge rating={weekEval.rating} score={weekEval.totalScore} compact />
                    <div className="text-xs text-gray-400 mt-0.5">{weekEval.totalHours}回</div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {activityTypes.map(t => (
            <span key={t.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${t.color} ${t.textColor}`}>
              {t.name} <span className="opacity-70">強度{t.intensity}</span>
            </span>
          ))}
        </div>
      </div>

      <ActivityModal
        open={modal.open}
        date={modal.date}
        horseId={modal.horseId}
        horseName={modal.horseName}
        existing={modal.existing}
        activityTypes={activityTypes}
        instructors={instructors}
        onSave={a => modal.existing ? updateActivity(a) : addActivity(a)}
        onDelete={deleteActivity}
        onClose={() => setModal(m => ({ ...m, open: false }))}
      />
    </div>
  )
}
