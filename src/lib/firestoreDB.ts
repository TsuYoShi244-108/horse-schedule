/**
 * Firestore データ操作ヘルパー
 *
 * コレクション構成:
 *   app/settings          - 馬・担当者・活動種別・閾値・dataVersion
 *   activities/{id}       - 活動記録（リアルタイム同期）
 *   auth/{instructorId}   - PINハッシュ（salt + hash）
 */
import {
  doc, getDoc, setDoc, updateDoc,
  collection, deleteDoc,
  onSnapshot, query, type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Horse, Instructor, Activity, ActivityType, EvaluationThresholds } from '../types'

// ── 型定義 ──────────────────────────────────────────
export interface AppSettings {
  dataVersion: number
  horses: Horse[]
  instructors: Instructor[]
  activityTypes: ActivityType[]
  thresholds: EvaluationThresholds
}

export interface AuthEntry {
  salt: string
  hash: string
}

// ── Settings ────────────────────────────────────────
const SETTINGS_REF = doc(db, 'app', 'settings')

export async function getSettings(): Promise<AppSettings | null> {
  const snap = await getDoc(SETTINGS_REF)
  return snap.exists() ? (snap.data() as AppSettings) : null
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setDoc(SETTINGS_REF, settings)
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
  await updateDoc(SETTINGS_REF, partial as Record<string, unknown>)
}

// ── Activities ──────────────────────────────────────
const ACTIVITIES_COL = collection(db, 'activities')

export async function addActivityDoc(a: Activity): Promise<void> {
  await setDoc(doc(db, 'activities', a.id), a)
}

export async function updateActivityDoc(a: Activity): Promise<void> {
  await setDoc(doc(db, 'activities', a.id), a)
}

export async function deleteActivityDoc(id: string): Promise<void> {
  await deleteDoc(doc(db, 'activities', id))
}

/** アクティビティのリアルタイム購読 */
export function subscribeActivities(
  onChange: (activities: Activity[]) => void
): Unsubscribe {
  const q = query(ACTIVITIES_COL)
  return onSnapshot(
    q,
    snap => {
      const activities = snap.docs.map(d => d.data() as Activity)
      onChange(activities)
    },
    err => {
      console.error('[Firestore] subscribeActivities error:', err)
    }
  )
}

// ── Auth ────────────────────────────────────────────
export async function getAuthEntry(instructorId: string): Promise<AuthEntry | null> {
  const snap = await getDoc(doc(db, 'auth', instructorId))
  return snap.exists() ? (snap.data() as AuthEntry) : null
}

export async function saveAuthEntry(instructorId: string, entry: AuthEntry): Promise<void> {
  await setDoc(doc(db, 'auth', instructorId), entry)
}
