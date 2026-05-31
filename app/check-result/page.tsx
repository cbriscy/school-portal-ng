"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

const TERMS = ["First", "Second", "Third"] as const

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
      const { data: student, error: stuErr } = await supabase
        .from("students").select("*, classes(name)")
        .eq("reg_number", reg.toUpperCase().trim()).single()
      
      if (stuErr || !student) { setError("Student not found"); setLoading(false); return }

      const { data: scores } = await supabase
        .from("scores").select("score, assessments(name, type)")
        .eq("student_id", student.id).eq("assessments.term", term)

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
        let grade = "F9", remark = "Fail", gradeColor = "bg-red-100 text-red-700 border-red-300"
        if (total >= 75) { grade = "A1"; remark = "Excellent"; gradeColor = "bg-green-100 text-green-700 border-green-300" }
        else if (total >= 70) { grade = "B2"; remark = "Very Good"; gradeColor = "bg-blue-100 text-blue-700 border-blue-300" }
        else if (total >= 65) { grade = "B3"; remark = "Good"; gradeColor = "bg-blue-100 text-blue-700 border-blue-300" }
        else if (total >= 60) { grade = "C4"; remark = "Credit"; gradeColor = "bg-yellow-100 text-yellow-700 border-yellow-300" }
        else if (total >= 55) { grade = "C5"; remark = "Credit"; gradeColor = "bg-yellow-100 text-yellow-700 border-yellow-300" }
        else if (total >= 50) { grade = "C6"; remark = "Credit"; gradeColor = "bg-yellow-100 text-yellow-700 border-yellow-300" }
        else if (total >= 45) { grade = "D7"; remark = "Pass"; gradeColor = "bg-orange-100 text-orange-700 border-orange-300" }
        else if (total >= 40) { grade = "E8"; remark = "Pass"; gradeColor = "bg-orange-100 text-orange-700 border-orange-300" }
        return { name, ...data, total, grade, remark, gradeColor }
      })

      const totalScore = tableData.reduce((sum: number, r: any) => sum + r.total, 0)
      const average = tableData.length ? (totalScore / tableData.length).toFixed(1) : "0"

      setResult({ student, tableData, totalScore, average })
    } catch { setError("Network error") } finally { setLoading(false) }
  }

  const css = (s: React.CSSProperties) => s

  if (!result) {
    return (
      <div style={css({ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif" })}>
        <div style={css({ background: "white", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: 40, width: "100%", maxWidth: 450 })}>
          <div style={css({ textAlign: "center", marginBottom: 28 })}>
            <div style={css({ fontSize: 64, marginBottom: 12 })}>🎓</div>
            <h1 style={css({ fontSize: 26, fontWeight: "bold", color: "#1e3a8a", margin: "0 0 8px" })}>Result Portal</h1>
            <p style={css({ fontSize: 14, color: "#64748b", margin: 0 })}>Enter your details to view result</p>
          </div>
          <div>
            <label style={css({ display: "block", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6 })}>Registration Number</label>
            <input style={css({ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 15, marginBottom: 16, boxSizing: "border-box" })} placeholder="SS1/001" value={reg} onChange={e => setReg(e.target.value)} />
            <label style={css({ display: "block", fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 6 })}>Academic Term</label>
            <select style={css({ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 15, marginBottom: 20, boxSizing: "border-box", background: "white" })} value={term} onChange={e => setTerm(e.target.value as any)}>
              {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
            </select>
            {error && <div style={css({ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: 12, borderRadius: 8, marginBottom: 18, fontSize: 14 })}>{error}</div>}
            <button style={css({ width: "100%", padding: 14, background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" })} onClick={check} disabled={loading}>{loading ? "Loading..." : "🔍 Check Result"}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={css({ minHeight: "100vh", background: "#f8fafc", padding: "24px 12px", fontFamily: "system-ui, sans-serif" })}>
      <div style={css({ maxWidth: 900, margin: "0 auto", background: "white", borderRadius: 16, boxShadow: "0 10px 40px rgba(0,0,0,0.15)" })}>
        
        {/* Header */}
        <header style={css({ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", padding: "32px 24px", textAlign: "center" })}>
          <div style={css({ width: 80, height: 80, background: "white", borderRadius: "50%", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, border: "3px solid rgba(255,255,255,0.3)" })}>🏫</div>
          <h1 style={css({ fontSize: 26, fontWeight: "bold", margin: "0 0 8px", letterSpacing: 0.5 })}>Excellence International School</h1>
          <p style={css({ fontSize: 14, opacity: 0.95, margin: "0 0 4px", fontStyle: "italic" })}>Knowledge • Discipline • Excellence</p>
          <p style={css({ fontSize: 13, opacity: 0.9, margin: "8px 0 0" })}>📍 12, Adeola Odeku Street, Victoria Island, Lagos</p>
          <p style={css({ fontSize: 13, opacity: 0.9, margin: "4px 0 0" })}>📞 +234 812 345 6789 &nbsp;|&nbsp; ✉️ info@excellenceinternational.edu.ng</p>
        </header>

        {/* Student Info */}
        <section style={css({ padding: "24px", borderBottom: "2px solid #e2e8f0" })}>
          <div style={css({ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" })}>
            <div style={css({ width: 112, height: 112, background: "#e2e8f0", borderRadius: 12, border: "2px solid #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 })}>👤</div>
            <div style={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px 24px", flex: 1, fontSize: 14 })}>
              <div><span style={css({ fontWeight: 600, color: "#64748b" })}>Name:</span><p style={css({ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 })}>{result.student.first_name} {result.student.last_name}</p></div>
              <div><span style={css({ fontWeight: 600, color: "#64748b" })}>Admission No:</span><p style={css({ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 })}>{result.student.reg_number}</p></div>
              <div><span style={css({ fontWeight: 600, color: "#64748b" })}>Class:</span><p style={css({ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 })}>{result.student.classes?.name || "N/A"}</p></div>
              <div><span style={css({ fontWeight: 600, color: "#64748b" })}>Session:</span><p style={css({ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 })}>2025/2026</p></div>
              <div><span style={css({ fontWeight: 600, color: "#64748b" })}>Term:</span><p style={css({ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 })}>{term} Term</p></div>
            </div>
          </div>
        </section>

        {/* Result Table */}
        <section style={css({ padding: "24px" })}>
          <h2 style={css({ fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 16, margin: "0 0 16px" })}>Academic Performance</h2>
          <div style={css({ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" })}>
            <table style={css({ width: "100%", borderCollapse: "collapse", fontSize: 13 })}>
              <thead>
                <tr style={css({ background: "#f8fafc" })}>
                  <th style={css({ padding: "12px 10", textAlign: "left", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>Subject</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>CA1</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>CA2</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>Exam</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>Total</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>Grade</th>
                  <th style={css({ padding: "12px 8", textAlign: "center", fontWeight: 600, color: "#475569", borderBottom: "2px solid #e2e8f0" })}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {result.tableData.map((row: any, i: number) => (
                  <tr key={i} style={css({ background: i % 2 === 0 ? "white" : "#f8fafc" })}>
                    <td style={css({ padding: "10px 10", fontWeight: 600, color: "#1e293b", borderBottom: "1px solid #f1f5f9" })}>{row.name}</td>
                    <td style={css({ padding: "10px 8", textAlign: "center", borderBottom: "1px solid #f1f5f9" })}>{row.ca1}</td>
                    <td style={css({ padding: "10px 8", textAlign: "center", borderBottom: "1px solid #f1f5f9" })}>{row.ca2}</td>
                    <td style={css({ padding: "10px 8", textAlign: "center", borderBottom: "1px solid #f1f5f9" })}>{row.exam}</td>
                    <td style={css({ padding: "10px 8", textAlign: "center", fontWeight: 600, borderBottom: "1px solid #f1f5f9" })}>{row.total}</td>
                    <td style={css({ padding: "10px 8", textAlign: "center", borderBottom: "1px solid #f1f5f9" })}>
                      <span style={css({ display: "inline-block", padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: "bold", background: row.gradeColor.split(" ")[0], color: row.gradeColor.split(" ")[1], border: `1px solid ${row.gradeColor.split(" ")[2]}` })}>{row.grade}</span>
                    </td>
                    <td style={css({ padding: "10px 8", textAlign: "center", borderBottom: "1px solid #f1f5f9", color: "#475569" })}>{row.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary */}
        <section style={css({ padding: "24px" })}>
          <div style={css({ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 })}>
            <div style={css({ background: "#eff6ff", padding: 16, borderRadius: 10, border: "1px solid #dbeafe" })}>
              <p style={css({ fontSize: 11, color: "#1d4ed8", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase" })}>Total Subjects</p>
              <p style={css({ fontSize: 22, fontWeight: "bold", color: "#1e40af", margin: 0 })}>{result.tableData.length}</p>
            </div>
            <div style={css({ background: "#eff6ff", padding: 16, borderRadius: 10, border: "1px solid #dbeafe" })}>
              <p style={css({ fontSize: 11, color: "#1d4ed8", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase" })}>Total Score</p>
              <p style={css({ fontSize: 22, fontWeight: "bold", color: "#1e40af", margin: 0 })}>{result.totalScore}</p>
            </div>
            <div style={css({ background: "#eff6ff", padding: 16, borderRadius: 10, border: "1px solid #dbeafe" })}>
              <p style={css({ fontSize: 11, color: "#1d4ed8", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase" })}>Average</p>
              <p style={css({ fontSize: 22, fontWeight: "bold", color: "#1e40af", margin: 0 })}>{result.average}%</p>
            </div>
            <div style={css({ background: "#eff6ff", padding: 16, borderRadius: 10, border: "1px solid #dbeafe" })}>
              <p style={css({ fontSize: 11, color: "#1d4ed8", fontWeight: 600, margin: "0 0 6px", textTransform: "uppercase" })}>Position</p>
              <p style={css({ fontSize: 22, fontWeight: "bold", color: "#1e40af", margin: 0 })}>1st</p>
            </div>
          </div>
        </section>

        {/* Grading Key */}
        <section style={css({ padding: "20px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" })}>
          <h3 style={css({ fontSize: 13, fontWeight: 600, color: "#475569", margin: "0 0 10px" })}>GRADING SYSTEM (WAEC/NECO)</h3>
          <div style={css({ fontSize: 12, color: "#64748b", lineHeight: 1.8 })}>
            A1 (75-100) Excellent • B2 (70-74) Very Good • B3 (65-69) Good • C4-C6 (50-64) Credit • D7-E8 (40-49) Pass • F9 (0-39) Fail
          </div>
        </section>

        {/* Footer */}
        <footer style={css({ padding: "20px 24px", borderTop: "2px solid #e2e8f0", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" })}>
          <div>
            <p style={css({ fontSize: 12, color: "#64748b", margin: "0 0 4px" })}>Verification Code: <span style={css({ fontFamily: "monospace", fontWeight: "bold" })}>EIS-2025-{result.student.reg_number}</span></p>
            <p style={css({ fontSize: 11, color: "#94a3b8", margin: 0 })}>Generated: {new Date().toLocaleDateString()}</p>
          </div>
          <button onClick={() => window.print()} style={css({ padding: "10px 20px", background: "#1e3a8a", color: "white", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" })}>🖨️ Print Result</button>
        </footer>
      </div>
    </div>
  )
}
