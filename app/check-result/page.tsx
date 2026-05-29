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
    } catch { setError("Network error") } finally { setLoading(false) }
  }

  const styles = {
    container: { minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    card: { background: "white", borderRadius: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: "40px", width: "100%", maxWidth: "500px" },
    header: { textAlign: "center", marginBottom: "30px" },
    icon: { fontSize: "64px", marginBottom: "15px" },
    title: { fontSize: "28px", fontWeight: "bold", color: "#1a202c", margin: "0 0 8px 0" },
    subtitle: { fontSize: "14px", color: "#718096", margin: 0 },
    input: { width: "100%", padding: "14px 16px", border: "2px solid #e2e8f0", borderRadius: "10px", fontSize: "16px", marginBottom: "20px", boxSizing: "border-box", transition: "border-color 0.3s" },
    label: { display: "block", fontSize: "14px", fontWeight: "600", color: "#4a5568", marginBottom: "8px" },
    button: { width: "100%", padding: "14px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer", transition: "transform 0.2s" },
    error: { background: "#fed7d7", border: "1px solid #fc8181", color: "#c53030", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" },
    resultCard: { maxWidth: "900px", margin: "0 auto", background: "white", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" },
    schoolHeader: { background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", padding: "40px 30px", textAlign: "center" },
    schoolName: { fontSize: "32px", fontWeight: "bold", margin: "0 0 10px 0", letterSpacing: "1px" },
    schoolInfo: { fontSize: "14px", opacity: 0.9, margin: "0 0 20px 0" },
    termTitle: { fontSize: "20px", fontWeight: "600", margin: 0, borderTop: "2px solid rgba(255,255,255,0.3)", paddingTop: "20px" },
    studentInfo: { padding: "25px 30px", borderBottom: "3px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", fontSize: "15px" },
    infoItem: { display: "flex" },
    infoLabel: { fontWeight: "600", color: "#4a5568", minWidth: "100px" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "0" },
    th: { background: "#1e3a8a", color: "white", padding: "14px 8px", textAlign: "center", border: "1px solid #1e3a8a", fontSize: "13px", fontWeight: "600" },
    td: { padding: "12px 8px", textAlign: "center", border: "1px solid #cbd5e0", fontSize: "14px" },
    subjectTd: { textAlign: "left", paddingLeft: "15px", fontWeight: "600" },
    summary: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "25px 30px", marginTop: "20px" },
    summaryBox: { border: "2px solid #e2e8f0", padding: "20px", textAlign: "center", borderRadius: "10px" },
    summaryLabel: { fontSize: "13px", color: "#718096", fontWeight: "600", marginBottom: "8px" },
    summaryValue: { fontSize: "28px", fontWeight: "bold", color: "#3182ce" },
    footer: { padding: "30px", borderTop: "2px solid #e2e8f0", display: "flex", justifyContent: "space-between" },
    signature: { textAlign: "center", width: "200px" },
    sigLine: { borderTop: "1px solid #4a5568", paddingTop: "8px", marginTop: "50px", fontSize: "14px" },
    actions: { padding: "25px 30px", background: "#f7fafc", display: "flex", gap: "15px", justifyContent: "center" },
    actionBtn: { padding: "12px 24px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }
  }

  if (!result) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.icon}>🎓</div>
            <h1 style={styles.title}>Result Portal</h1>
            <p style={styles.subtitle}>Enter your details below</p>
          </div>
          <div>
            <label style={styles.label}>Registration Number</label>
            <input style={styles.input} placeholder="SS1/001" value={reg} onChange={e => setReg(e.target.value)} />
            <label style={styles.label}>Academic Term</label>
            <select style={styles.input} value={term} onChange={e => setTerm(e.target.value)}>
              {TERMS.map(t => <option key={t} value={t}>{t} Term</option>)}
            </select>
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.button} onClick={check} disabled={loading}>{loading ? "Loading..." : "Check Result"}</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc", padding: "30px 15px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <div style={styles.resultCard}>
        <div style={styles.schoolHeader}>
          <h1 style={styles.schoolName}>EXCELLENCE INTERNATIONAL SCHOOL</h1>
          <p style={styles.schoolInfo}>Lagos, Nigeria • Motto: Knowledge & Discipline</p>
          <h2 style={styles.termTitle}>{term.toUpperCase()} TERM RESULT • 2025/2026 SESSION</h2>
        </div>
        
        <div style={styles.studentInfo}>
          <div style={styles.infoItem}><span style={styles.infoLabel}>Name:</span> <span>{result.student.first_name} {result.student.last_name}</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>Reg No:</span> <span>{result.student.reg_number}</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>Class:</span> <span>{result.student.classes?.name || "N/A"}</span></div>
          <div style={styles.infoItem}><span style={styles.infoLabel}>Session:</span> <span>2025/2026</span></div>
        </div>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{...styles.th, textAlign: "left", paddingLeft: "15px"}}>SUBJECT</th>
              <th style={styles.th}>CA1</th>
              <th style={styles.th}>CA2</th>
              <th style={styles.th}>CA3</th>
              <th style={styles.th}>EXAM</th>
              <th style={styles.th}>TOTAL</th>
              <th style={styles.th}>GRADE</th>
              <th style={{...styles.th, textAlign: "left", paddingLeft: "15px"}}>REMARK</th>
            </tr>
          </thead>
          <tbody>
            {result.tableData.map((row: any, i: number) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#f7fafc" : "white" }}>
                <td style={{...styles.td, ...styles.subjectTd}}>{row.name}</td>
                <td style={styles.td}>{row.ca1}</td>
                <td style={styles.td}>{row.ca2}</td>
                <td style={styles.td}>{row.ca3}</td>
                <td style={styles.td}>{row.exam}</td>
                <td style={{...styles.td, fontWeight: "bold", fontSize: "15px"}}>{row.total}</td>
                <td style={{...styles.td, fontWeight: "bold"}}>{row.grade}</td>
                <td style={{...styles.td, textAlign: "left", paddingLeft: "15px"}}>{row.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={styles.summary}>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>TOTAL SUBJECTS</div>
            <div style={styles.summaryValue}>{result.tableData.length}</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>AVERAGE SCORE</div>
            <div style={styles.summaryValue}>{(result.tableData.reduce((a: number, r: any) => a + r.total, 0) / result.tableData.length || 0).toFixed(1)}%</div>
          </div>
          <div style={styles.summaryBox}>
            <div style={styles.summaryLabel}>OVERALL POSITION</div>
            <div style={styles.summaryValue}>1st</div>
          </div>
        </div>

        <div style={styles.footer}>
          <div style={styles.signature}><div style={styles.sigLine}>Class Teacher</div></div>
          <div style={styles.signature}><div style={styles.sigLine}>Principal</div></div>
        </div>

        <div style={styles.actions}>
          <button style={{...styles.actionBtn, background: "#3182ce", color: "white"}} onClick={() => window.print()}>🖨️ Print Result</button>
          <button style={{...styles.actionBtn, background: "#718096", color: "white"}} onClick={() => setResult(null)}>🔄 New Search</button>
        </div>
      </div>
    </div>
  )
}
