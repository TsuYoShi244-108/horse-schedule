import { startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns'
import type { Activity, ActivityType, WeeklyEvaluation } from '../types'
import { DEFAULT_THRESHOLDS, RATINGS, DAILY_LESSON_ALERT_THRESHOLD } from '../constants/evaluationConfig'

export function getWeeklyEvaluation(
  horseId: string,
  weekStart: Date,
  activities: Activity[],
  activityTypes: ActivityType[],
  thresholds = DEFAULT_THRESHOLDS,
): WeeklyEvaluation {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))

  const weekActivities = activities.filter(a =>
    a.horseId === horseId &&
    isWithinInterval(parseISO(a.date), { start: weekStart, end: weekEnd })
  )

  let totalScore = 0
  let totalCount = 0

  for (const act of weekActivities) {
    const type = typeMap[act.activityTypeId]
    if (!type) continue
    const cnt = act.count ?? 1
    totalCount += cnt
    totalScore += type.intensity * cnt
  }

  const rating = scoreToRating(totalScore, thresholds)
  const ratingInfo = RATINGS.find(r => r.rating === rating)!

  return {
    horseId,
    weekStart: weekStart.toISOString().slice(0, 10),
    totalScore: Math.round(totalScore * 10) / 10,
    totalHours: totalCount,
    rating,
    label: ratingInfo.label,
    emoji: ratingInfo.emoji,
  }
}

function scoreToRating(score: number, thresholds = DEFAULT_THRESHOLDS): 1 | 2 | 3 | 4 | 5 {
  const { excellent, good, normal, caution } = thresholds
  if (score >= excellent[0] && score <= excellent[1]) return 5
  if (score >= good[0] && score < excellent[0]) return 4
  if (score > excellent[1]) return 2
  if (score >= normal[0] && score < good[0]) return 3
  if (score >= caution[0] && score < normal[0]) return 2
  return 1
}

export function hasDailyAlert(
  horseId: string,
  date: string,
  activities: Activity[],
  activityTypes: ActivityType[],
): boolean {
  const typeMap = Object.fromEntries(activityTypes.map(t => [t.id, t]))
  const dayActivities = activities.filter(a => a.horseId === horseId && a.date === date)
  const highIntensityCount = dayActivities.reduce((sum, a) => {
    const type = typeMap[a.activityTypeId]
    return sum + (type && type.intensity >= 2 ? (a.count ?? 1) : 0)
  }, 0)
  return highIntensityCount >= DAILY_LESSON_ALERT_THRESHOLD
}

export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}
