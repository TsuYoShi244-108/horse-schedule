export interface ActivityType {
  id: string
  name: string
  intensity: 0 | 1 | 2 | 3
  color: string
  textColor: string
  isRest: boolean
}

export interface Horse {
  id: string
  name: string
  breed?: string
  gender?: string
  birthYear?: number
  coatColor?: string
  note?: string
}

export interface Instructor {
  id: string
  name: string
  isRegular: boolean
}

export interface Activity {
  id: string
  horseId: string
  date: string
  activityTypeId: string
  count: number
  instructorId?: string
  instructorName?: string
  note?: string
}

export interface WeeklyEvaluation {
  horseId: string
  weekStart: string
  totalScore: number
  totalHours: number
  rating: 1 | 2 | 3 | 4 | 5
  label: string
  emoji: string
}

export interface EvaluationThresholds {
  excellent: [number, number]
  good: [number, number]
  normal: [number, number]
  caution: [number, number]
}
