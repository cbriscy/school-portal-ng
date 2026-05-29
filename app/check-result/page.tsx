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
      setError("Please enter Registration Number")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    
    try {
      const { data: student, error: stuErr } = await supabase
        .from("students")
        .select("*, classes(name)")
        .eq("reg_number", reg.toUpperCase().trim())
        .single()
        
      if (stuErr || !student) {
        setError("Student not found")
        setLoading(false)
        return
      }

      const { data: scores } = await supabase
        .from("scores")
        .select("score, assessments(name, type)")
        .eq("student_id", student.id)
        .eq("assessments.term", term)

      // Group by subject
      const subjects: any = {}
      scores?.forEach((s: any) => {
        const name = s.assessments?.name?.split(" ")[0] || "Subject"
        const type = s.assessments?.type
        if (!subjects[name]) subjects[name] = { ca1: 0, ca2: 0, ca3: 0, exam: 0 }
        if (type === "CA1") subjects[name].ca1 = s.score
        if (type === "CA2") subjects[name].ca2 = s.score
        if (type === "CA3") subjects[name].ca3 = s.score
        if (type === "Exam") subjects[name].exam = s.score
      })

      const tableData = Object.entries(subjects).map(([name, data]: [string, any]) => {
        const total = data.ca1 + data.ca2 + data.ca3 + data.exam
        let grade = "E8", remark = "Fail"
        if (total >= 70) { grade = "A1"; remark = "Excellent" }
        else if (total >= 65) { grade = "B2"; remark = "Very Good" }
        else if (total >= 60) { grade = "B3"; remark = "Good" }
        else if (total >= 55) { grade = "C4"; remark = "Credit" }
        else if (total >= 50) { grade = "C5"; remark = "Credit" }
        else if (total >= 45) { grade = "C6"; remark = "Credit" }
        else if (total >= 40) { grade = "D7"; remark = "Pass" }
        return { name, ...data, total, grade, remark }
      })

      setResult({ student, tableData })
    } catch {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎓</div>
            <h1 className="text-2xl font-bold text-gray-800">Result Portal</h1>
            <p className="text-gray-600 text-sm mt-1">Enter your details below</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reg Number</label>
              <input
                type="text"
                placeholder="SS1/001"
                value={reg}
                onChange={(e) => setReg(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none bg-white"
              >
                {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
              </select>
            </div>

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}

            <button
              onClick={check}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Loading..." : "Check Result"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-xl print:shadow-none">
        
        {/* School Header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-800 text-white p-8 text-center print:bg-blue-900">
          <h1 className="text-3xl font-bold mb-2">EXCELLENCE INTERNATIONAL SCHOOL</h1>
          <p className="text-blue-200">Lagos, Nigeria • Knowledge & Discipline</p>
          <h2 className="text-xl mt-4 font-semibold">{term.toUpperCase()} TERM RESULT • 2025/2026 SESSION</h2>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b-2 border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold">Name:</span> {result.student.first_name} {result.student.last_name}</div>
            <div><span className="font-semibold">Reg No:</span> {result.student.reg_number}</div>
            <div><span className="font-semibold">Class:</span> {result.student.classes?.name || "N/A"}</div>
            <div><span className="font-semibold">Session:</span> 2025/2026</div>
          </div>
        </div>

        {/* Results Table */}
        <div className="p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="border border-gray-700 px-4 py-3 text-left">SUBJECT</th>
                <th className="border border-gray-700 px-4 py-3 text-center">CA1</th>
                <th className="border border-gray-700 px-4 py-3 text-center">CA2</th>
                <th className="border border-gray-700 px-4 py-3 text-center">CA3</th>
                <th className="border border-gray-700 px-4 py-3 text-center">EXAM</th>
                <th className="border border-gray-700 px-4 py-3 text-center">TOTAL</th>
                <th className="border border-gray-700 px-4 py-3 text-center">GRADE</th>
                <th className="border border-gray-700 px-4 py-3 text-left">REMARK</th>
              </tr>
            </thead>
            <tbody>
              {result.tableData.map((row: any, i: number) => (
                <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                  <td className="border border-gray-300 px-4 py-3 font-medium">{row.name}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{row.ca1}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{row.ca2}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{row.ca3}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{row.exam}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold">{row.total}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold">{row.grade}</td>
                  <td className="border border-gray-300 px-4 py-3">{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
            <div className="border-2 border-gray-300 p-3">
              <div className="font-semibold text-gray-700">Total Subjects</div>
              <div className="text-2xl font-bold text-blue-600">{result.tableData.length}</div>
            </div>
            <div className="border-2 border-gray-300 p-3">
              <div className="font-semibold text-gray-700">Average Score</div>
              <div className="text-2xl font-bold text-blue-600">
                {result.tableData.reduce((a: number, r: any) => a + r.total, 0) / result.tableData.length || 0}%
              </div>
            </div>
            <div className="border-2 border-gray-300 p-3">
              <div className="font-semibold text-gray-700">Overall Position</div>
              <div className="text-2xl font-bold text-blue-600">1st</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 p-6 flex justify-between print:mt-8">
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-12 w-48">Class Teacher</div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-12 w-48">Principal</div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50 flex justify-center space-x-4 print:hidden">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
            🖨️ Print Result
          </button>
          <button onClick={() => setResult(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium">
            🔄 New Search
          </button>
        </div>
      </div>
    </div>
  )
}
