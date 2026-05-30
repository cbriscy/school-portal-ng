"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Geography", "Government", "Economics"]
const ASSESSMENTS = [
  { type: "CA1", max: 10, label: "1st CA (10%)" },
  { type: "CA2", max: 10, label: "2nd CA (10%)" },
  { type: "CA3", max: 10, label: "3rd CA (10%)" },
  { type: "Exam", max: 60, label: "Exam (60%)" }
]

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"students" | "scores">("students")
  const [students, setStudents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudent, setNewStudent] = useState({ reg_number: "", first_name: "", last_name: "", class_id: "", parent_email: "", parent_phone: "" })
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [term, setTerm] = useState("First")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const t = localStorage.getItem("teacher")
    if (!t) { router.push("/teacher/login"); return }
    setTeacher(JSON.parse(t))
    loadData()
  }, [])

  const loadData = async () => {
    const { data: classesData } = await supabase.from("classes").select("*")
    const { data: studentsData } = await supabase.from("students").select("*, classes(name)")
    setClasses(classesData || [])
    setStudents(studentsData || [])
  }

  const handleAddStudent = async () => {
    setLoading(true)
    const { error } = await supabase.from("students").insert(newStudent)
    if (!error) {
      setShowAddStudent(false)
      setNewStudent({ reg_number: "", first_name: "", last_name: "", class_id: "", parent_email: "", parent_phone: "" })
      loadData()
    }
    setLoading(false)
  }

  const handleScoreEntry = async (studentId: string, subject: string, type: string, score: number, term: string) => {
    // Find or create assessment
    let { data: assessment } = await supabase
      .from("assessments")
      .select("id")
      .eq("name", `${subject} ${type}`)
      .eq("term", term)
      .single()

    if (!assessment) {
      const max = type === "Exam" ? 60 : 10
      const { data: newA, error: createErr } = await supabase
        .from("assessments")
        .insert({ name: `${subject} ${type}`, type, max_score: max, term })
        .select("id")
        .single()
      if (createErr || !newA) return
      assessment = newA
    }

    // Upsert score - use ! to assert assessment is not null
    await supabase.from("scores").upsert({
      student_id: studentId,
      assessment_id: assessment!.id,
      score
    }, { onConflict: "student_id,assessment_id" })
  }

  const handleLogout = () => {
    localStorage.removeItem("teacher")
    router.push("/teacher/login")
  }

  if (!teacher) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>

  return (
    <div style={{ minHeight: "100vh", background: "#f7fafc" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", padding: "20px 30px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: "bold", margin: 0 }}>👨‍🏫 Teacher Dashboard</h1>
          <p style={{ margin: "4px 0 0", opacity: 0.9, fontSize: 14 }}>{teacher.full_name} • {teacher.subject_specialization}</p>
        </div>
        <button onClick={handleLogout} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, color: "white", cursor: "pointer", fontWeight: 600 }}>Logout</button>
      </div>

      {/* Tabs */}
      <div style={{ padding: "20px 30px", borderBottom: "2px solid #e2e8f0", background: "white" }}>
        <button onClick={() => setActiveTab("students")} style={{ padding: "10px 24px", marginRight: 12, background: activeTab === "students" ? "#3182ce" : "#e2e8f0", color: activeTab === "students" ? "white" : "#4a5568", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>👥 Students</button>
        <button onClick={() => setActiveTab("scores")} style={{ padding: "10px 24px", background: activeTab === "scores" ? "#3182ce" : "#e2e8f0", color: activeTab === "scores" ? "white" : "#4a5568", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>📊 Record Scores</button>
      </div>

      <div style={{ padding: 30 }}>
        {activeTab === "students" ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: "bold", margin: 0 }}>Student Management</h2>
              <button onClick={() => setShowAddStudent(!showAddStudent)} style={{ padding: "10px 20px", background: "#38a169", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Add Student</button>
            </div>

            {showAddStudent && (
              <div style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Add New Student</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  <input placeholder="Reg Number" value={newStudent.reg_number} onChange={e => setNewStudent({...newStudent, reg_number: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  <input placeholder="First Name" value={newStudent.first_name} onChange={e => setNewStudent({...newStudent, first_name: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  <input placeholder="Last Name" value={newStudent.last_name} onChange={e => setNewStudent({...newStudent, last_name: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  <select value={newStudent.class_id} onChange={e => setNewStudent({...newStudent, class_id: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input placeholder="Parent Email" value={newStudent.parent_email} onChange={e => setNewStudent({...newStudent, parent_email: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }} />
                  <input placeholder="Parent Phone" value={newStudent.parent_phone} onChange={e => setNewStudent({...newStudent, parent_phone: e.target.value})} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }} />
                </div>
                <div style={{ marginTop: 16 }}>
                  <button onClick={handleAddStudent} disabled={loading} style={{ padding: "10px 24px", background: "#38a169", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>{loading ? "Adding..." : "Save Student"}</button>
                </div>
              </div>
            )}

            <div style={{ background: "white", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f7fafc" }}>
                  <tr>
                    <th style={{ padding: 14, textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: 600 }}>Reg No</th>
                    <th style={{ padding: 14, textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: 14, textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: 600 }}>Class</th>
                    <th style={{ padding: 14, textAlign: "left", borderBottom: "2px solid #e2e8f0", fontWeight: 600 }}>Parent Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: 14 }}>{s.reg_number}</td>
                      <td style={{ padding: 14 }}>{s.first_name} {s.last_name}</td>
                      <td style={{ padding: 14 }}>{s.classes?.name || "N/A"}</td>
                      <td style={{ padding: 14 }}>{s.parent_email} • {s.parent_phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: "bold", margin: "0 0 24px" }}>Record Scores</h2>
            
            <div style={{ background: "white", padding: 24, borderRadius: 12, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  <option value="">Select Class</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  <option value="">Select Subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={term} onChange={e => setTerm(e.target.value)} style={{ padding: 10, border: "1px solid #e2e8f0", borderRadius: 6 }}>
                  {["First", "Second", "Third"].map(t => <option key={t} value={t}>{t} Term</option>)}
                </select>
              </div>

              {selectedClass && selectedSubject && (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#1e3a8a", color: "white" }}>
                      <tr>
                        <th style={{ padding: 12, textAlign: "left" }}>Student</th>
                        {ASSESSMENTS.map(a => <th key={a.type} style={{ padding: 12, textAlign: "center" }}>{a.label}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {students.filter(s => s.class_id === selectedClass).map(student => (
                        <tr key={student.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: 12 }}>{student.first_name} {student.last_name}</td>
                          {ASSESSMENTS.map(a => (
                            <td key={a.type} style={{ padding: 8, textAlign: "center" }}>
                              <input
                                type="number"
                                min="0"
                                max={a.max}
                                placeholder="0"
                                onChange={async (e) => {
                                  const score = parseInt(e.target.value) || 0
                                  if (score >= 0 && score <= a.max) {
                                    await handleScoreEntry(student.id, selectedSubject, a.type, score, term)
                                  }
                                }}
                                style={{ width: 60, padding: 6, border: "1px solid #cbd5e0", borderRadius: 4, textAlign: "center" }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
