import { useState, useEffect } from 'react'
import type { Activity, ActivityType, Instructor } from '../types'
import { INTENSITY_LABELS, INTENSITY_COLORS } from '../constants/activityTypes'

interface Props {
  open: boolean
  date: string
  horseId: string
  horseName: string
  existing?: Activity
  activityTypes: ActivityType[]
  instructors: Instructor[]
  onSave: (a: Activity) => void
  onDelete?: (id: string) => void
  onClose: () => void
}

const CIRCLE_NUMS = ['①','②','③','④','⑤']

function newId() {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export default function ActivityModal({
  open, date, horseId, horseName, existing, activityTypes, instructors, onSave, onDelete, onClose
}: Props) {
  const [typeId, setTypeId] = useState(activityTypes[0]?.id ?? '')
  const [count, setCount] = useState(1)
  const [instructorId, setInstructorId] = useState('')
  const [instructorOther, setInstructorOther] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (existing) {
      setTypeId(existing.activityTypeId)
      setCount(existing.count ?? 1)
      setInstructorId(existing.instructorId ?? (existing.instructorName ? 'other' : ''))
      setInstructorOther(existing.instructorName ?? '')
      setNote(existing.note ?? '')
    } else {
      setTypeId(activityTypes[0]?.id ?? '')
      setCount(1)
      setInstructorId('')
      setInstructorOther('')
      setNote('')
    }
  }, [existing, open, activityTypes])

  if (!open) return null

  const selectedType = activityTypes.find(t => t.id === typeId)

  function handleSave() {
    const a: Activity = {
      id: existing?.id ?? newId(),
      horseId,
      date,
      activityTypeId: typeId,
      count,
      instructorId: instructorId && instructorId !== 'other' ? instructorId : undefined,
      instructorName: instructorId === 'other' ? instructorOther : undefined,
      note: note || undefined,
    }
    onSave(a)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-amber-800 text-white px-5 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <div className="font-bold text-base">🐴 {horseName}</div>
            <div className="text-amber-200 text-sm">{date}</div>
          </div>
          <button onClick={onClose} className="text-amber-200 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動種別</label>
            <select
              value={typeId}
              onChange={e => setTypeId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {activityTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedType && (
              <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                <span className={`px-2 py-0.5 rounded-full text-white text-xs ${selectedType.color}`}>{selectedType.name}</span>
                <span className={INTENSITY_COLORS[selectedType.intensity]}>
                  運動強度: {INTENSITY_LABELS[selectedType.intensity]}（{selectedType.intensity}）
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">回数</label>
            <div className="flex gap-2 flex-wrap">
              {CIRCLE_NUMS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setCount(i + 1)}
                  className={`w-10 h-10 rounded-full text-lg font-bold transition-all ${
                    count === i + 1
                      ? 'bg-amber-700 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <select
              value={instructorId}
              onChange={e => setInstructorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">（なし）</option>
              {instructors.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
              <option value="other">その他（自由入力）</option>
            </select>
            {instructorId === 'other' && (
              <input
                type="text"
                placeholder="担当者名を入力"
                value={instructorOther}
                onChange={e => setInstructorOther(e.target.value)}
                className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="備考など"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          {existing && onDelete && (
            <button
              onClick={() => { onDelete(existing.id); onClose() }}
              className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              削除
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            キャンセル
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 text-sm text-white bg-amber-700 rounded-lg hover:bg-amber-800">
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
