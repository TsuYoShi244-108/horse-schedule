export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🐴</div>
        <div className="text-amber-800 font-medium">読み込み中…</div>
        <div className="mt-2 w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}
