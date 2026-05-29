"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

const TERMS = ["First", "Second", "Third"]

export default function CheckResultPage() {
  const [reg, setReg] = useState("")
  const [term, setTerm] = useState("First")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!reg.trim()) {
      setError("⚠️ Please enter a Registration Number")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    
    try {
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

      // Fetch scores WITH assessment details
      const { data: scores, error: scoreErr } = await supabase
        .from("scores")
        .select(`
          score,
          assessments (
            name,
            type,
            max_score,
            term
          )
        `)
        .eq("student_id", student.id)
        .eq("assessments.term", term)
        
      if (scoreErr) console.error("Score fetch error:", scoreErr)

      // Group scores by subject name for better display
      const groupedScores: any[] = []
      const subjectMap: Record<string, any> = {}
      
      scores?.forEach((s: any) => {
        const subjName = s.assessments?.name || "Unknown Subject"
        if (!subjectMap[subjName]) {
          subjectMap[subjName] = {
            subject: subjName,
            ca1: 0, ca2: 0, ca3: 0, exam: 0,
            total: 0, type: s.assessments?.type || "N/A"
          }
        }
        const type = s.assessments?.type
        if (type === "CA1") subjectMap[subjName].ca1 = s.score
        else if (type === "CA2") subjectMap[subjName].ca2 = s.score
        else if (type === "CA3") subjectMap[subjName].ca3 = s.score
        else if (type === "Exam") subjectMap[subjName].exam = s.score
      })
      
      Object.values(subjectMap).forEach((subj: any) => {
        subj.total = subj.ca1 + subj.ca2 + subj.ca3 + subj.exam
        groupedScores.push(subj)
      })

      setResult({ student, scores: groupedScores })
    } catch (err) {
      console.error("Check error:", err)
      setError("❌ Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getGrade = (total: number) => {
    if (total >= 70) return { grade: "A1", color: "bg-emerald-100 text-emerald-700", remark: "Excellent" }
    if (total >= 65) return { grade: "B2", color: "bg-blue-100 text-blue-700", remark: "Very Good" }
    if (total >= 60) return { grade: "B3", color: "bg-indigo-100 text-indigo-700", remark: "Good" }
    if (total >= 55) return { grade: "C4", color: "bg-yellow-100 text-yellow-700", remark: "Credit" }
    if (total >= 50) return { grade: "C5", color: "bg-orange-100 text-orange-700", remark: "Credit" }
    if (total >= 45) return { grade: "C6", color: "bg-amber-100 text-amber-700", remark: "Credit" }
    if (total >= 40) return { grade: "D7", color: "bg-red-100 text-red-700", remark: "Pass" }
    return { grade: "E8", color: "bg-red-200 text-red-800", remark: "Fail" }
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-100 py-12 px-4 print:bg-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
            Academic Result Portal
          </h1>
          <p className="text-gray-600 mt-2">Secure • Instant • Professional</p>
        </div>

        {!result ? (
          /* Input Form */
          <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
                <input
                  type="text"
                  placeholder="e.g., SS1/001"
                  value={reg}
                  onChange={(e) => setReg(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all text-lg bg-white"
                >
                  {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-pulse">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={check}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:transform-none text-lg"
              >
                {loading ? "🔄 Fetching..." : "🔍 View Result"}
              </button>
            </div>
            <p className="text-center text-xs text-gray-500">🔒 Data is securely fetched from school records</p>
          </div>
        ) : (
          /* Result Display */
          <div className="space-y-6 animate-fadeIn">
            {/* Student Info Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-indigo-100 p-6 print:shadow-none">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">{result.student.first_name[0]}{result.student.last_name[0]}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{result.student.first_name} {result.student.last_name}</h2>
                    <p className="text-indigo-600 font-medium">{result.student.reg_number} • {result.student.classes?.name || "N/A"}</p>
                  </div>
                </div>
                <div className="flex space-x-3 print:hidden">
                  <button onClick={handlePrint} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors flex items-center space-x-2">
                    <span>🖨️</span><span>Print</span>
                  </button>
                  <button onClick={() => setResult(null)} className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl font-medium transition-colors flex items-center space-x-2">
                    <span>🔄</span><span>New Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scores Table */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-indigo-100 overflow-hidden print:shadow-none">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                <h3 className="text-lg font-bold text-gray-800">{term} Term Academic Performance</h3>
              </div>
              
              {result.scores.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Subject</th>
                        <th className="px-6 py-3 font-semibold text-center">CA1</th>
                        <th className="px-6 py-3 font-semibold text-center">CA2</th>
                        <th className="px-6 py-3 font-semibold text-center">CA3</th>
                        <th className="px-6 py-3 font-semibold text-center">Exam</th>
                        <th className="px-6 py-3 font-semibold text-center">Total</th>
                        <th className="px-6 py-3 font-semibold text-center">Grade</th>
                        <th className="px-6 py-3 font-semibold">Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.scores.map((subj: any, i: number) => {
                        const g = getGrade(subj.total)
                        return (
                          <tr key={i} className="hover:bg-indigo-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{subj.subject}</td>
                            <td className="px-6 py-4 text-center">{subj.ca1}</td>
                            <td className="px-6 py-4 text-center">{subj.ca2}</td>
                            <td className="px-6 py-4 text-center">{subj.ca3}</td>
                            <td className="px-6 py-4 text-center">{subj.exam}</td>
                            <td className="px-6 py-4 text-center font-bold text-lg">{subj.total}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${g.color}`}>{g.grade}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{g.remark}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">
                  <span className="text-4xl block mb-2">📊</span>
                  No scores recorded for {term} Term yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 space-y-1 print:hidden">
              <p>📅 Result generated on {new Date().toLocaleDateString()}</p>
              <p>This is an official academic record. Do not alter.</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        @media print { body { background: white !important; } .print\\:hidden { display: none !important; } }
      `}</style>
    </div>
  )
}
