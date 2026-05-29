export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">🎉 School Portal is LIVE!</h1>
        <p className="text-gray-600 mb-6">Your result checker is ready.</p>
        <a href="/check-result" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">
          Go to Check Result →
        </a>
      </div>
    </div>
  )
}
