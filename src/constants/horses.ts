import type { Horse } from '../types'

export const INITIAL_HORSES: Horse[] = [
  { id: 'karasu', name: 'カラス', breed: 'アパルーサ', gender: '騙馬', birthYear: 2003, coatColor: '青' },
  { id: 'step', name: 'ステップ', breed: 'クォーターホース', gender: '騙馬', birthYear: 2015, coatColor: '栗' },
  { id: 'juju', name: 'ジュジュ', breed: 'KWPN', gender: '騙馬', birthYear: 2014, coatColor: '鹿毛', note: '大型・母馬' },
  { id: 'odile', name: 'オディール', breed: 'アパルーサM', gender: '牝馬', birthYear: 2003, coatColor: '青' },
  { id: 'lala', name: 'ララ', breed: '日本乗系種', gender: '牝馬', birthYear: 2016, coatColor: '栗', note: '母馬' },
  { id: 'merumo', name: 'メルモ', breed: '輓交種', gender: '牝馬', birthYear: 2017, coatColor: '青' },
  { id: 'roasso', name: 'ロアッソ', breed: '半血種', gender: '騙馬', birthYear: 2009, coatColor: 'ベイ' },
  { id: 'dark', name: 'ダーク', breed: 'アパルーサ', gender: '騙馬', birthYear: 2005, coatColor: '栃栗' },
  { id: 'mirai', name: 'ミライ', breed: '温血馬', gender: '騙馬', birthYear: 1999, coatColor: '芦' },
  { id: 'haya', name: '刃（じん）', breed: 'KWPN', gender: '騙馬', birthYear: 2022, note: 'ジュジュの子' },
  { id: 'shun', name: '駿（しゅん）', breed: 'クォーターホース', gender: '騙馬', coatColor: '茶', note: 'ララの子' },
  { id: 'masagoro', name: 'マサゴロウ', breed: '日本乗系種', gender: '騙馬', birthYear: 2008, coatColor: '鹿', note: '流鏑馬訓練中' },
  { id: 'gutaus', name: 'グートアウス', breed: 'サラブレッド', gender: '騙馬', note: '流鏑馬訓練中' },
  { id: 'restore', name: 'レストア', breed: 'サラブレッド', gender: '騙馬', note: '外乗で活躍' },
  // ポニー系（終盤）
  { id: 'yume', name: 'ユメ', breed: 'ポニー（ペイント）', gender: '牝馬' },
  { id: 'maruko', name: 'マルコ', breed: 'ポニー', gender: '騙馬', birthYear: 2010 },
  { id: 'potato', name: 'ポテト', breed: 'ポニー', gender: '騙馬' },
]
