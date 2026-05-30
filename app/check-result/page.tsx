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
        if (!subjects[name]) subjects[name] = { ca1: 0, ca2: 0, ca3: 0, exam: 0 }
        if (type === "CA1") subjects[name].ca1 = s.score
        if (type === "CA2") subjects[name].ca2 = s.score
        if (type === "CA3") subjects[name].ca3 = s.score
        if (type === "Exam") subjects[name].exam = s.score
      })

      const tableData = Object.entries(subjects).map(([name, data]: [string, any]) => {
        const total = data.ca1 + data.ca2 + data.ca3 + data.exam
        // WAEC/NECO Grading System
        let grade = "F9", remark = "Fail"
        if (total >= 75) { grade = "A1"; remark = "Excellent" }
        else if (total >= 70) { grade = "B2"; remark = "Very Good" }
        else if (total >= 65) { grade = "B3"; remark = "Good" }
        else if (total >= 60) { grade = "C4"; remark = "Credit" }
        else if (total >= 55) { grade = "C5"; remark = "Credit" }
        else if (total >= 50) { grade = "C6"; remark = "Credit" }
        else if (total >= 45) { grade = "D7"; remark = "Pass" }
        else if (total >= 40) { grade = "E8"; remark = "Pass" }
        return { name, ...data, total, grade, remark }
      })
      setResult({ student, tableData })
    } catch { setError("Network error") } finally { setLoading(false) }
  }

  const css = (s: React.CSSProperties) => s

  if (!result) {
    return (
      <div style={css({ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "system-ui, sans-serif" })}>
        <div style={css({ background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: 40, width: "100%", maxWidth: 480 })}>
          <div style={css({ textAlign: "center", marginBottom: 30 })}>
            <div style={css({ fontSize: 56, marginBottom: 12 })}>🎓</div>
            <h1 style={css({ fontSize: 26, fontWeight: "bold", color: "#1a202c", margin: "0 0 8px" })}>Result Portal</h1>
            <p style={css({ fontSize: 14, color: "#718096", margin: 0 })}>Enter your details below</p>
          </div>
          <div>
            <label style={css({ display: "block", fontSize: 14, fontWeight: 600, color: "#4a5568", marginBottom: 8 })}>Registration Number</label>
            <input style={css({ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 16, marginBottom: 18, boxSizing: "border-box" })} placeholder="SS1/001" value={reg} onChange={e => setReg(e.target.value)} />
            <label style={css({ display: "block", fontSize: 14, fontWeight: 600, color: "#4a5568", marginBottom: 8 })}>Academic Term</label>
            <select style={css({ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 16, marginBottom: 18, boxSizing: "border-box", background: "white" })} value={term} onChange={e => setTerm(e.target.value as any)}>
              {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
            </select>
            {error && <div style={css({ background: "#fed7d7", border: "1px solid #fc8181", color: "#c53030", padding: 12, borderRadius: 8, marginBottom: 18, fontSize: 14 })}>{error}</div>}
            <button style={css({ width: "100%", padding: 14, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer" })} onClick={check} disabled={loading}>{loading ? "Loading..." : "Check Result"}</button>
          </div>
        </div>
      </div>
    )
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "#38a169"
    if (grade.startsWith("B")) return "#3182ce"
    if (grade.startsWith("C")) return "#d69e2e"
    if (grade.startsWith("D")) return "#dd6b20"
    return "#e53e3e"
  }

  return (
    <div style={css({ minHeight: "100vh", background: "#f7fafc", padding: "30px 15px", fontFamily: "system-ui, sans-serif" })}>
      <div style={css({ maxWidth: 900, margin: "0 auto", background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", borderRadius: 16 })}>
        
        {/* School Header */}
        <div style={css({ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", padding: "35px 28px", textAlign: "center" })}>
          <h1 style={css({ fontSize: 28, fontWeight: "bold", margin: "0 0 8px", letterSpacing: 0.5 })}>EXCELLENCE INTERNATIONAL SCHOOL</h1>
          <p style={css({ fontSize: 14, opacity: 0.95, margin: "0 0 16px" })}>Lagos, Nigeria • Knowledge & Discipline</p>
          <h2 style={css({ fontSize: 18, fontWeight: 600, margin: 0, borderTop: "2px solid rgba(255,255,255,0.25)", paddingTop: 16 })}>{term.toUpperCase()} TERM RESULT • 2025/2026</h2>
        </div>
        
        {/* Student Info */}
        <div style={css({ padding: "22px 28px", borderBottom: "3px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, fontSize: 15 })}>
          <div><strong style={css({ color: "#4a5568" })}>Name:</strong> {result.student.first_name} {result.student.last_name}</div>
          <div><strong style={css({ color: "#4a5568" })}>Reg No:</strong> {result.student.reg_number}</div>
          <div><strong style={css({ color: "#4a5568" })}>Class:</strong> {result.student.classes?.name || "N/A"}</div>
          <div><strong style={css({ color: "#4a5568" })}>Session:</strong> 2025/2026</div>
        </div>

        {/* Results Table */}
        <div style={css({ padding: "0 28px 28px" })}>
          <table style={css({ width: "100%", borderCollapse: "collapse", marginTop: 18 })}>
            <thead>
              <tr>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "left", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600, paddingLeft: 14 })}>SUBJECT</th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>CA1<br/><small>(10%)</small></th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>CA2<br/><small>(10%)</small></th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>CA3<br/><small>(10%)</small></th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>EXAM<br/><small>(60%)</small></th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>TOTAL<br/><small>(100%)</small></th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600 })}>GRADE</th>
                <th style={css({ background: "#1e3a8a", color: "white", padding: "12px 8px", textAlign: "left", border: "1px solid #1e3a8a", fontSize: 12, fontWeight: 600, paddingLeft: 14 })}>REMARK</th>
              </tr>
            </thead>
            <tbody>
              {result.tableData.map((row: any, i: number) => (
                <tr key={i} style={css({ background: i % 2 === 0 ? "#f8fafc" : "white" })}>
                  <td style={css({ padding: "11px 8px", textAlign: "left", border: "1px solid #cbd5e0", fontSize: 14, fontWeight: 600, paddingLeft: 14 })}>{row.name}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 14 })}>{row.ca1}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 14 })}>{row.ca2}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 14 })}>{row.ca3}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 14 })}>{row.exam}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 15, fontWeight: "bold" })}>{row.total}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: 16, fontWeight: "bold", color: getGradeColor(row.grade) })}>{row.grade}</td>
                  <td style={css({ padding: "11px 8px", textAlign: "left", border: "1px solid #cbd5e0", fontSize: 14, paddingLeft: 14 })}>{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div style={css({ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, padding: "22px 28px", marginTop: 16 })}>
            <div style={css({ border: "2px solid #e2e8f0", padding: 18, textAlign: "center", borderRadius: 10 })}>
              <div style={css({ fontSize: 12, color: "#718096", fontWeight: 600, marginBottom: 6 })}>TOTAL SUBJECTS</div>
              <div style={css({ fontSize: 26, fontWeight: "bold", color: "#3182ce" })}>{result.tableData.length}</div>
            </div>
            <div style={css({ border: "2px solid #e2e8f0", padding: 18, textAlign: "center", borderRadius: 10 })}>
              <div style={css({ fontSize: 12, color: "#718096", fontWeight: 600, marginBottom: 6 })}>AVERAGE SCORE</div>
              <div style={css({ fontSize: 26, fontWeight: "bold", color: "#3182ce" })}>{(result.tableData.reduce((a: number, r: any) => a + r.total, 0) / result.tableData.length || 0).toFixed(1)}%</div>
            </div>
            <div style={css({ border: "2px solid #e2e8f0", padding: 18, textAlign: "center", borderRadius: 10 })}>
              <div style={css({ fontSize: 12, color: "#718096", fontWeight: 600, marginBottom: 6 })}>POSITION</div>
              <div style={css({ fontSize: 26, fontWeight: "bold", color: "#3182ce" })}>1st</div>
            </div>
          </div>

          {/* Grading Key */}
          <div style={css({ marginTop: 24, padding: 20, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" })}>
            <h3 style={css({ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#4a5568" }}>GRADING SYSTEM (WAEC/NECO STANDARD)</h3>
            <div style={css({ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 13 })}>
              <div>A1 (75-100): Excellent</div>
              <div>B2 (70-74): Very Good</div>
              <div>B3 (65-69): Good</div>
              <div>C4 (60-64): Credit</div>
              <div>C5 (55-59): Credit</div>
              <div>C6 (50-54): Credit</div>
              <div>D7 (45-49): Pass</div>
              <div>E8 (40-44): Pass</div>
              <div colSpan={4}>F9 (0-39): Fail</div>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div style={css({ padding: "28px", borderTop: "2px solid #e2e8f0", display: "flex", justifyContent: "space-between" })}>
          <div style={css({ textAlign: "center", width: 180 })}><div style={css({ borderTop: "1px solid #4a5568", paddingTop: 6, marginTop: 45, fontSize: 14 })}>Class Teacher</div></div>
          <div style={css({ textAlign: "center", width: 180 })}><div style={css({ borderTop: "1px solid #4a5568", paddingTop: 6, marginTop: 45, fontSize: 14 })}>Principal</div></div>
        </div>

        {/* Actions */}
        <div style={css({ padding: "22px 28px", background: "#f8fafc", display: "flex", gap: 12, justifyContent: "center" })}>
          <button style={css({ padding: "10px 22px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#3182ce", color: "white" })} onClick={() => window.print()}>🖨️ Print Result</button>
          <button style={css({ padding: "10px 22px", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", background: "#718096", color: "white" })} onClick={() => setResult(null)}>🔄 New Search</button>
        </div>
      </div>
    </div>
  )
}
