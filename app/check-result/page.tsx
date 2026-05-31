"use client"
import { useState, useEffect } from "react"
import { supabase } from "../../lib/supabase"

const TERMS = ["First", "Second", "Third"] as const

// Helper to get grade style based on WAEC standards
const getGradeStyle = (grade: string) => {
  switch (grade) {
    case "A1": return "bg-green-100 text-green-800 border-green-300"
    case "B2": 
    case "B3": return "bg-blue-100 text-blue-800 border-blue-300"
    case "C4": 
    case "C5": 
    case "C6": return "bg-yellow-100 text-yellow-800 border-yellow-300"
    case "D7": 
    case "E8": return "bg-orange-100 text-orange-800 border-orange-300"
    default: return "bg-red-100 text-red-800 border-red-300"
  }
}

export default function CheckResultPage() {
  const [reg, setReg] = useState("")
  const [term, setTerm] = useState<(typeof TERMS)[number]>("First")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!reg.trim()) { setError("Please enter Registration Number"); return }
    setLoading(true); setError(""); setResult(null)
    
    try {
      // 1. Fetch Student
      const { data: student, error: stuErr } = await supabase
        .from("students").select("*, classes(name)")
        .eq("reg_number", reg.toUpperCase().trim()).single()
      
      if (stuErr || !student) { setError("Student not found"); setLoading(false); return }

      // 2. Fetch Scores
      const { data: scores } = await supabase
        .from("scores").select("score, assessments(name, type)")
        .eq("student_id", student.id).eq("assessments.term", term)

      // 3. Process Data (Group by Subject)
      const subjects: Record<string, any> = {}
      scores?.forEach((s: any) => {
        const name = s.assessments?.name?.split(" ")[0] || "Subject"
        const type = s.assessments?.type
        if (!subjects[name]) subjects[name] = { ca1: 0, ca2: 0, exam: 0 }
        if (type === "CA1") subjects[name].ca1 = s.score
        if (type === "CA2") subjects[name].ca2 = s.score
        if (type === "Exam") subjects[name].exam = s.score
      })

      const tableData = Object.entries(subjects).map(([name, data]: [string, any]) => {
        const total = data.ca1 + data.ca2 + data.exam
        let grade = "F9", remark = "Fail"
        if (total >= 75) { grade = "A1"; remark = "Excellent" }
        else if (total >= 70) { grade = "B2"; remark = "Very Good" }
        else if (total >= 65) { grade = "B3"; remark = "Good" }
        else if (total >= 60) { grade = "C4"; remark = "Credit" }
        else if (total >= 55) { grade = "C5"; remark = "Credit" }
        else if (total >= 50) { grade = "C6"; remark = "Credit" }
        else if (total >= 45) { grade = "D7"; remark = "Pass" }
        else if (total >= 40) { grade = "E8"; remark = "Pass" }
        return { name, ...data, total, grade, remark, style: getGradeStyle(grade) }
      })

      const totalScore = tableData.reduce((sum: number, r: any) => sum + r.total, 0)
      const average = tableData.length ? (totalScore / tableData.length).toFixed(1) : "0.0"

      setResult({ student, tableData, totalScore, average })
    } catch { setError("Network error") } finally { setLoading(false) }
  }

  // Login View
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎓</div>
            <h1 className="text-2xl font-bold text-gray-900">Result Portal</h1>
            <p className="text-gray-500 mt-2">Enter your details to view your academic report</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
              <input
                type="text"
                placeholder="e.g. SS1/001"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all outline-none bg-white"
              >
                {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
              </select>
            </div>
            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm">{error}</div>}
            <button
              onClick={check}
              disabled={loading}
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Loading..." : "🔍 Check Result"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Result View (Matches your HTML Template)
  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      
      {/* Print Button */}
      <div className="max-w-4xl mx-auto flex justify-end mb-4 no-print">
        <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-lg shadow transition-colors">
          🖨️ Print Result
        </button>
      </div>

      {/* Result Card */}
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">

        {/* Header */}
        <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-8 sm:px-10 print:bg-blue-900">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-3xl mb-4">🏫</div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Excellence International School</h1>
            <p className="text-blue-200 text-sm italic mt-1">Knowledge • Discipline • Excellence</p>
            <div className="mt-4 text-sm text-blue-100 space-y-1">
              <p>📍 12, Adeola Odeku Street, Victoria Island, Lagos</p>
              <p>📞 +234 812 345 6789 &nbsp;|&nbsp; ✉️ info@excellenceinternational.edu.ng</p>
            </div>
          </div>
        </header>

        {/* Student Info */}
        <section className="px-6 py-6 sm:px-10 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center text-4xl">👤</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full text-sm sm:text-base">
              <div><span className="font-semibold text-gray-600">Name:</span><p className="text-gray-800">{result.student.first_name} {result.student.last_name}</p></div>
              <div><span className="font-semibold text-gray-600">Admission No:</span><p className="text-gray-800">{result.student.reg_number}</p></div>
              <div><span className="font-semibold text-gray-600">Class:</span><p className="text-gray-800">{result.student.classes?.name || "N/A"}</p></div>
              <div><span className="font-semibold text-gray-600">Session:</span><p className="text-gray-800">2025/2026</p></div>
              <div><span className="font-semibold text-gray-600">Term:</span><p className="text-gray-800">{term} Term</p></div>
              <div><span className="font-semibold text-gray-600">Age:</span><p className="text-gray-800">14-16 yrs</p></div>
            </div>
          </div>
        </section>

        {/* Result Table */}
        <section className="px-4 sm:px-10 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Academic Performance</h2>
          <div className="border border-gray-200 rounded-lg shadow-sm print:shadow-none overflow-x-auto">
            <table className="w-full text-[10px] sm:text-xs lg:text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left font-semibold text-gray-600">Subject</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">CA1</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">CA2</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">Exam</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">Total</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">Grade</th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-600">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.tableData.map((row: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="text-center text-gray-700">{row.ca1}</td>
                    <td className="text-center text-gray-700">{row.ca2}</td>
                    <td className="text-center text-gray-700">{row.exam}</td>
                    <td className="text-center font-bold text-gray-900">{row.total}</td>
                    <td className="text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${row.style}`}>
                        {row.grade}
                      </span>
                    </td>
                    <td className="text-center text-gray-600">{row.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <section className="px-4 sm:px-10 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-600 uppercase font-bold">Total Subjects</p>
              <p className="text-2xl font-bold text-blue-900">{result.tableData.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-600 uppercase font-bold">Total Score</p>
              <p className="text-2xl font-bold text-blue-900">{result.totalScore}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-600 uppercase font-bold">Average</p>
              <p className="text-2xl font-bold text-blue-900">{result.average}%</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
              <p className="text-xs text-blue-600 uppercase font-bold">Position</p>
              <p className="text-2xl font-bold text-blue-900">1st</p>
            </div>
          </div>
        </section>

        {/* Grading Key */}
        <section className="px-4 sm:px-10 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
            <span className="font-bold">GRADING SYSTEM:</span> A1 (75-100) Excellent • B2 (70-74) Very Good • B3 (65-69) Good • C4-C6 (50-64) Credit • D7-E8 (40-49) Pass • F9 (0-39) Fail
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-10 py-6 border-t border-gray-200 bg-gray-50 print:bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <p className="text-xs text-gray-600">Verification Code: <span className="font-mono font-bold">EIS-{new Date().getFullYear()}-{result.student.reg_number}</span></p>
              <p className="text-[10px] text-gray-400 mt-1">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-[10px] text-gray-400 bg-white">Stamp</div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">QR</div>
                <span className="text-[10px] text-gray-500 mt-1">Scan to verify</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
