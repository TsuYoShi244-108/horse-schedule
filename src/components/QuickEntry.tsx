import { useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { INTENSITY_LABELS } from '../constants/activityTypes'
import type { Activity } from '../types'

const CIRCLE_NUMS = ['①', '②', '③', '④', '⑤']

function newId() {
  return `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

type Step = 'form' | 'confirm' | 'done'

export default function QuickEntry() {
  const { horses, activityTypes, instructors, activities, addActivity } = useApp()
  const { user } = useAuth()

  const today = format(new Date(), 'yyyy-MM-dd')

  const [step, setStep] = useState<Step>('form')
  const [date, setDate] = useState(today)
  const [horseId, setHorseId] = useState('')
  const [typeId, setTypeId] = useState(activityTypes[0]?.id ?? '')
  const [count, setCount] = useState(1)
  const [instructorId, setInstructorId] = useState(
    user ? (instructors.find(i => i.id === user.id) ? user.id : '') : ''
  )
  const [instructorOther, setInstructorOther] = useState('')
  const [note, setNote] = useState('')

  const horse = horses.find(h => h.id === horseId)
  const type = activityTypes.find(t => t.id === typeId)
  const instructor = instructorId && instructorId !== 'other'
    ? instructors.find(i => i.id === instructorId)?.name
    : instructorId === 'other' ? instructorOther : ''

  // 当日のその馬の既存活動数（警告用）
  const sameDay = activities.filter(a => a.horseId === horseId && a.date === date)
  const highIntensityToday = sameDay.reduce((sum, a) => {
    const t = activityTypes.find(x => x.id === a.activityTypeId)
    return sum + (t && t.intensity >= 2 ? (a.count ?? 1) : 0)
  }, 0)
  const wouldAlert = type && type.intensity >= 2 && highIntensityToday + count >= 3

  function canProceed() {
    return !!horseId && !!typeId
  }

  function handleConfirm() {
    setStep('confirm')
  }

  function handleSave() {
    const a: Activity = {
      id: newId(),
      horseId,
      date,
      activityTypeId: typeId,
      count,
      instructorId: instructorId && instructorId !== 'other' ? instructorId : undefined,
      instructorName: instructorId === 'other' ? instructorOther : undefined,
      note: note || undefined,
    }
    addActivity(a)
    setStep('done')
  }

  function handleReset() {
    setStep('form')
    setHorseId('')
    setTypeId(activityTypes[0]?.id ?? '')
    setCount(1)
    setInstructorId(user ? (instructors.find(i => i.id === user.id) ? user.id : '') : '')
    setInstructorOther('')
    setNote('')
    setDate(today)
  }

  if (step === 'done') {
    return (
      <div className="max-w-md mx-auto pb-20 md:pb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-lg font-bold text-gray-800 mb-1">登録しました</div>
          <div className="text-sm text-gray-500 mb-6">
            {horse?.name} / {type?.name} {CIRCLE_NUMS[count - 1]}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800"
            >
              続けて入力
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'confirm') {
    return (
      <div className="max-w-md mx-auto pb-20 md:pb-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-amber-800 text-white px-5 py-4">
            <div className="font-bold text-base">確認</div>
            <div className="text-amber-200 text-sm">内容を確認して登録してください</div>
          </div>

          <div className="p-5 space-y-3">
            {wouldAlert && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-sm text-orange-700">
                ⚠️ この登録により、本日の高強度活動が3回以上になります
              </div>
            )}

            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2.5 pr-4 text-gray-500 w-24">日付</td>
                  <td className="py-2.5 font-medium text-gray-800">
                    {format(new Date(date), 'yyyy年M月d日（EEE）', { locale: ja })}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-gray-500">馬</td>
                  <td className="py-2.5 font-medium text-gray-800">
                    🐴 {horse?.name}
                    {horse?.breed && <span className="text-xs text-gray-400 ml-1">{horse.breed}</span>}
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-gray-500">活動</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${type?.color} ${type?.textColor}`}>
                      {type?.name}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">強度{type?.intensity}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 text-gray-500">回数</td>
                  <td className="py-2.5 font-bold text-lg text-amber-700">{CIRCLE_NUMS[count - 1]}</td>
                </tr>
                {instructor && (
                  <tr>
                    <td className="py-2.5 pr-4 text-gray-500">担当者</td>
                    <td className="py-2.5 text-gray-800">{instructor}</td>
                  </tr>
                )}
                {note && (
                  <tr>
                    <td className="py-2.5 pr-4 text-gray-500">メモ</td>
                    <td className="py-2.5 text-gray-800">{note}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 pb-5 flex gap-3">
            <button
              onClick={() => setStep('form')}
              className="flex-1 px-4 py-2.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              修正する
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2.5 text-sm text-white bg-amber-700 rounded-lg hover:bg-amber-800 font-medium"
            >
              登録する
            </button>
          </div>
        </div>
      </div>
    )
  }

  // フォーム画面
  return (
    <div className="max-w-md mx-auto pb-20 md:pb-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-amber-800 text-white px-5 py-4">
          <div className="font-bold text-base">活動を記録</div>
          <div className="text-amber-200 text-sm">馬と活動内容を選んでください</div>
        </div>

        <div className="p-5 space-y-4">
          {/* 日付 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* 馬 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">馬 *</label>
            <select
              value={horseId}
              onChange={e => setHorseId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">— 選択してください —</option>
              {horses.map(h => (
                <option key={h.id} value={h.id}>{h.name}{h.breed ? `（${h.breed}）` : ''}</option>
              ))}
            </select>
          </div>

          {/* 活動種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動 *</label>
            <select
              value={typeId}
              onChange={e => setTypeId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              {activityTypes.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}（強度{t.intensity} / {INTENSITY_LABELS[t.intensity]}）
                </option>
              ))}
            </select>
            {type && (
              <div className="mt-1 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${type.color} ${type.textColor}`}>{type.name}</span>
              </div>
            )}
          </div>

          {/* 回数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">回数</label>
            <div className="flex gap-2">
              {CIRCLE_NUMS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setCount(i + 1)}
                  className={`w-11 h-11 rounded-full text-lg font-bold transition-all ${
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

          {/* 担当者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <select
              value={instructorId}
              onChange={e => setInstructorId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
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

          {/* メモ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ（任意）</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              placeholder="備考など"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={handleConfirm}
            disabled={!canProceed()}
            className="w-full py-3 bg-amber-700 text-white font-medium text-sm rounded-lg hover:bg-amber-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            確認画面へ →
          </button>
        </div>
      </div>
    </div>
  )
}
