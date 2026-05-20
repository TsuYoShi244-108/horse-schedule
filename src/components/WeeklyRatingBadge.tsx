import { RATINGS } from '../constants/evaluationConfig'

interface Props {
  rating: 1 | 2 | 3 | 4 | 5
  score: number
  compact?: boolean
}

export default function WeeklyRatingBadge({ rating, score, compact }: Props) {
  const info = RATINGS.find(r => r.rating === rating)!
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${info.bg}`}>
        <span>{info.emoji}</span>
        <span className={info.color}>{stars}</span>
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center p-2 rounded-lg border ${info.bg} min-w-[80px]`}>
      <div className="text-lg">{info.emoji}</div>
      <div className={`text-xs font-bold ${info.color}`}>{stars}</div>
      <div className="text-xs text-gray-500">{info.label}</div>
      <div className="text-xs text-gray-400">{score}pt</div>
    </div>
  )
}
