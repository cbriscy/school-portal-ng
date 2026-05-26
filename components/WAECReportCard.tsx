import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Register fonts (optional - using default Times-Roman for compatibility)
// Font.register({ family: 'Times New Roman', src: 'path-to-font.ttf' });

interface Student {
  regNumber: string;
  firstName: string;
  lastName: string;
  className: string;
  session: string;
  term: string;
  schoolName: string;
  schoolAddress: string;
  moto: string;
  logoUrl?: string;
}

interface SubjectResult {
  subject: string;
  ca1: number;
  ca2: number;
  ca3: number;
  exam: number;
  total: number;
  grade: string;
  remark: string;
  position: number;
}

export interface ReportData {
  student: Student;
  results: SubjectResult[];
  totalSubjects: number;
  averageScore: number;
  classAverage: number;
  nextTermBegins: string;
  nextTermEnds: string;
  teacherRemark: string;
  principalRemark: string;
  attendance: {
    daysOpened: number;
    daysPresent: number;
    daysAbsent: number;
  };
}

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: "Times-Roman", fontSize: 10 },
  header: { textAlign: "center", marginBottom: 15, borderBottom: 2, borderColor: "#000", paddingBottom: 10 },
  schoolName: { fontSize: 18, fontWeight: "bold", marginBottom: 3, textTransform: "uppercase" },
  schoolAddress: { fontSize: 9, marginBottom: 2 },
  moto: { fontSize: 9, fontStyle: "italic", marginBottom: 5 },
  reportTitle: { fontSize: 14, fontWeight: "bold", textAlign: "center", marginBottom: 10, textDecoration: "underline" },
  studentInfo: { display: "flex", flexDirection: "row", flexWrap: "wrap", marginBottom: 15, gap: 10 },
  infoBox: { flex: 1, minWidth: "45%", border: 1, borderColor: "#000", padding: 5 },
  infoLabel: { fontSize: 8, fontWeight: "bold", marginBottom: 2 },
  infoValue: { fontSize: 10 },
  table: { marginBottom: 15, border: 1, borderColor: "#000" },
  tableHeader: { backgroundColor: "#f0f0f0", flexDirection: "row", borderBottom: 1, borderColor: "#000" },
  tableRow: { flexDirection: "row", borderBottom: 0.5, borderColor: "#ddd" },
  tableCell: { padding: 4, fontSize: 9, borderRight: 0.5, borderColor: "#ddd" },
  subjectCol: { flex: 2, textAlign: "left" as const },
  centerCol: { flex: 1, textAlign: "center" as const },
  smallCol: { flex: 0.8, textAlign: "center" as const },
  summary: { display: "flex", flexDirection: "row", gap: 10, marginBottom: 15 },
  summaryBox: { flex: 1, border: 1, borderColor: "#000", padding: 8 },
  summaryTitle: { fontSize: 10, fontWeight: "bold", marginBottom: 5, textDecoration: "underline" },
  remarks: { marginBottom: 15, border: 1, borderColor: "#000", padding: 8 },
  remarkRow: { marginBottom: 8 },
  remarkLabel: { fontSize: 9, fontWeight: "bold", marginBottom: 2 },
  remarkText: { fontSize: 9, minHeight: 20 },
  footer: { position: "absolute" as const, bottom: 30, left: 30, right: 30, display: "flex", flexDirection: "row", justifyContent: "space-between", borderTop: 1, borderColor: "#000", paddingTop: 10 },
  signatureBox: { textAlign: "center" as const, width: "40%" },
  signatureLine: { borderTop: 1, borderColor: "#000", marginTop: 20, paddingTop: 2, fontSize: 9 },
  gradingScale: { fontSize: 8, marginBottom: 10 },
  scaleTitle: { fontWeight: "bold", marginBottom: 3 },
  logo: { position: "absolute" as const, top: 25, left: 30, width: 45, height: 45 },
});

const GradingScale = () => (
  <View style={styles.gradingScale}>
    <Text style={styles.scaleTitle}>GRADING SYSTEM:</Text>
    <Text>70-100% = A1 (Excellent) | 65-69% = B2 (Very Good) | 60-64% = B3 (Good)</Text>
    <Text>55-59% = C4 (Credit) | 50-54% = C5 (Credit) | 45-49% = C6 (Credit)</Text>
    <Text>40-44% = D7 (Pass) | 0-39% = E8 (Fail)</Text>
  </View>
);

// ✅ EXPORT AS NAMED FUNCTION (not default, not JSX in file root)
export const WAECReportCard = ({ data }: { data: ReportData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {data.student.logoUrl && <Image src={data.student.logoUrl} style={styles.logo} />}
      
      <View style={styles.header}>
        <Text style={styles.schoolName}>{data.student.schoolName}</Text>
        <Text style={styles.schoolAddress}>{data.student.schoolAddress}</Text>
        <Text style={styles.moto}>Motto: {data.student.moto}</Text>
        <Text style={styles.reportTitle}>
          {data.student.term.toUpperCase()} TERM RESULT - {data.student.session}
        </Text>
      </View>

      <View style={styles.studentInfo}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>STUDENT'S NAME:</Text>
          <Text style={styles.infoValue}>{data.student.lastName} {data.student.firstName}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>REGISTRATION NUMBER:</Text>
          <Text style={styles.infoValue}>{data.student.regNumber}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>CLASS:</Text>
          <Text style={styles.infoValue}>{data.student.className}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ATTENDANCE:</Text>
          <Text style={styles.infoValue}>{data.attendance.daysPresent}/{data.attendance.daysOpened} days</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.subjectCol]}>SUBJECT</Text>
          <Text style={[styles.tableCell, styles.smallCol]}>CA1</Text>
          <Text style={[styles.tableCell, styles.smallCol]}>CA2</Text>
          <Text style={[styles.tableCell, styles.smallCol]}>CA3</Text>
          <Text style={[styles.tableCell, styles.smallCol]}>
cat > app/api/generate-pdf/route.ts << 'EOF'
import { NextRequest, NextResponse } from "next/server"
import { pdf } from "@react-pdf/renderer"
import { getSupabaseAdmin } from "@/lib/supabase"
import WAECReportCard, { type ReportData } from "@/components/WAECReportCard"

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
    const pdfData: ReportData = {
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

    // Generate PDF - @react-pdf/renderer handles the component internally
    const buffer = await pdf(<WAECReportCard data={pdfData} />).toBuffer()

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
