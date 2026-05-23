"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function CheckResultPage() {
  const [reg, setReg] = useState("")
  const [pin, setPin] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const check = async () => {
    if (!reg.trim() || !pin.trim()) {
      setError("⚠️ Please enter both Registration Number and PIN")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    setShowSuccess(false)
    
    try {
      // 1. Validate PIN
      const { data: pinData, error: pinErr } = await supabase
        .from("result_pins")
        .select("student_id, is_used")
        .eq("pin", pin.toUpperCase().trim())
        .single()
        
      if (pinErr || !pinData || pinData.is_used) {
        setError("❌ Invalid or used PIN. Please verify and try again.")
        setLoading(false)
        return
      }

      // 2. Fetch student
      const { data: student, error: stuErr } = await supabase
        .from("students")
        .select("*, classes(name, level)")
        .eq("reg_number", reg.toUpperCase().trim())
        .single()
        
      if (stuErr || !student) {
        setError("❌ Student not found. Check your Registration Number.")
        setLoading(false)
        return
      }

      // 3. Fetch scores
      const { data: scores } = await supabase
        .from("scores")
        .select("score, assessments(type, name, max_score)")
        .eq("student_id", student.id)
        
      setResult({ student, scores })
      setShowSuccess(true)
      
      // Mark PIN used
      await supabase.from("result_pins").update({ is_used: true }).eq("id", pinData.id)
    } catch (err) {
      setError("❌ Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const resetForm = () => {
    setReg("")
    setPin("")
    setResult(null)
    setError("")
    setShowSuccess(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-8">
          
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">
              Check Result
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Enter your credentials to view your academic performance
            </p>
          </div>

          {/* Main Card */}
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
            
            {/* Card Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Student Portal</h2>
                    <p className="text-purple-100 text-sm">Secure Result Verification System</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-3xl">🎓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              
              {/* Input Form */}
              {!result && (
                <div className="space-y-6">
                  {/* Registration Number */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
                      Registration Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g., SS1/001 or JSS2/045"
                        value={reg}
                        onChange={(e) => setReg(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  {/* PIN Input */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-purple-600 transition-colors">
                      Result Checker PIN
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        placeholder="Enter your 10-digit scratch card PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">💡 PIN is case-insensitive and single-use</p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-2xl p-4 animate-shake">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Check Button */}
                  <button
                    onClick={check}
                    disabled={loading}
                    className="group relative w-full flex justify-center py-4 px-4 border-0 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-3">
                        <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Verifying Credentials...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <span>🔍</span>
                        <span>Check My Result</span>
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>

                  {/* Help Text */}
                  <div className="text-center space-y-2">
                    <p className="text-sm text-gray-500">
                      Don't have a PIN?{" "}
                      <button className="text-purple-600 hover:text-purple-700 font-semibold underline">
                        Purchase Scratch Card
                      </button>
                    </p>
                    <p className="text-xs text-gray-400">
                      🔒 Your data is encrypted and secure
                    </p>
                  </div>
                </div>
              )}

              {/* Success Animation */}
              {showSuccess && (
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Result Display */}
              {result && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Student Info Card */}
                  <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl p-6 border border-purple-200">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">
                          {result.student.first_name[0]}{result.student.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {result.student.first_name} {result.student.last_name}
                        </h3>
                        <p className="text-purple-600 font-medium">{result.student.reg_number}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                        <p className="text-xs text-gray-500 mb-1">Class</p>
                        <p className="font-bold text-gray-900">{result.student.classes?.name || "N/A"}</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-purple-100">
                        <p className="text-xs text-gray-500 mb-1">Level</p>
                        <p className="font-bold text-gray-900">{result.student.classes?.level || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Scores Section */}
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center mr-2">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                      Academic Performance
                    </h4>
                    
                    {result.scores && result.scores.length > 0 ? (
                      <div className="space-y-3">
                        {result.scores.map((score: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="group flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-lg">📚</span>
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{score.assessments?.name || "Assessment"}</p>
                                <p className="text-xs text-gray-500">{score.assessments?.type || "N/A"}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-right">
                                <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                  {score.score}
                                </p>
                                <p className="text-xs text-gray-500">/{score.assessments?.max_score || 100}</p>
                              </div>
                              <div className={`w-3 h-3 rounded-full ${
                                score.score >= 70 ? 'bg-green-500' :
                                score.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                        <span className="text-4xl mb-2 block">📊</span>
                        <p className="text-gray-500 font-medium">No scores recorded yet</p>
                        <p className="text-sm text-gray-400">Check back later or contact your teacher</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handlePrint}
                      className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Check Another</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 flex items-center justify-center space-x-1">
              <span>🔐</span>
              <span>Secured with 256-bit encryption</span>
            </p>
            <p className="text-xs text-gray-400">
              © 2026 Excellence International School • All rights reserved
            </p>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  )
}