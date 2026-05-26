import { NextRequest, NextResponse } from "next/server"
import { pdf } from "@react-pdf/renderer"
import { getSupabaseAdmin } from "@/lib/supabase"
import { WAECReportCard } from "@/components/WAECReportCard"

export async function POST(req: NextRequest) {
  try {
    const { studentId, termId } = await req.json()
    
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    // Fetch student
    const { data: student, error: stuErr } = await supabase
      .from("students")
      .select("*, classes(name, level)")
      .eq("id", studentId)
      .single()
      
    if (stuErr || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch scores
    const { data: scores } = await supabase
      .from("scores")
      .select("score, assessments(type, name, max_score)")
      .eq("student_id", studentId)

    // Transform scores for PDF
    const resultsBySubject: Record<string, any> = {}
    scores?.forEach((s: any) => {
      const name = s.assessments?.name || "Subject"
      if (!resultsBySubject[name]) {
        resultsBySubject[name] = { ca1: 0, ca2: 0, ca3: 0, exam: 0, subject: name }
      }
      const type = s.assessments?.type
      if (type === "CA1") resultsBySubject[name].ca1 = s.score
      else if (type === "CA2") resultsBySubject[name].ca2 = s.score
      else if (type === "CA3") resultsBySubject[name].ca3 = s.score
      else if (type === "Exam") resultsBySubject[name].exam = s.score
    })

    const results = Object.values(resultsBySubject).map((subj: any) => {
      const total = Math.round(subj.ca1 + subj.ca2 + subj.ca3 + subj.exam)
      const grade = total >= 70 ? "A1" : total >= 65 ? "B2" : total >= 60 ? "B3" : total >= 55 ? "C4" : total >= 50 ? "C5" : total >= 45 ? "C6" : total >= 40 ? "D7" : "E8"
      return { ...subj, total, grade, remark: grade === "E8" ? "Fail" : "Pass", position: 1 }
    })

    // Prepare PDF data
    const pdfData = {
      student: {
        regNumber: student.reg_number,
        firstName: student.first_name,
        lastName: student.last_name,
        className: student.classes?.name || "N/A",
        session: "2025/2026",
        term: "First",
        schoolName: "Excellence International School",
        schoolAddress: "Lagos, Nigeria",
        moto: "Knowledge & Discipline",
        logoUrl: process.env.NEXT_PUBLIC_SCHOOL_LOGO,
      },
      results,
      totalSubjects: results.length,
      averageScore: results.reduce((a: any, r: any) => a + r.total, 0) / results.length || 0,
      classAverage: 62.5,
      nextTermBegins: "Jan 8, 2026",
      nextTermEnds: "Apr 15, 2026",
      teacherRemark: "Keep working hard!",
      principalRemark: "Excellent performance.",
      attendance: { daysOpened: 90, daysPresent: 88, daysAbsent: 2 },
    }

    // Generate PDF using @react-pdf/renderer (JSX is supported via babel transform)
    const element = WAECReportCard({ data: pdfData })
    const buffer = await pdf(element).toBuffer()

    // Upload to Supabase Storage
    const filename = `${student.reg_number}_result.pdf`
    const { error: uploadErr } = await supabase.storage
      .from("result-pdfs")
      .upload(filename, buffer, { contentType: "application/pdf", upsert: true })
      
    if (uploadErr) throw uploadErr

    // Create signed URL (1 hour)
    const { data: { signedUrl } } = await supabase.storage
      .from("result-pdfs")
      .createSignedUrl(filename, 3600)

    return NextResponse.json({ success: true, downloadUrl: signedUrl })
  } catch (err: any) {
    console.error("PDF generation error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
