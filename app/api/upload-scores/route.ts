import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getSupabaseAdmin } from "@/lib/supabase"

const RowSchema = z.object({
  reg_number: z.string().min(1),
  subject: z.string().min(1),
  type: z.enum(["CA1", "CA2", "CA3", "Exam"]),
  term: z.enum(["First", "Second", "Third"]),
  score: z.coerce.number().min(0).max(100),
})

const maxForType = (type: string) => (type === "Exam" ? 60 : 10)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = z.array(RowSchema).min(1).safeParse(body?.rows)
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid payload: 'rows' must be a non-empty array of { reg_number, subject, type, term, score }",
          issues: parsed.error.issues.slice(0, 10),
        },
        { status: 400 }
      )
    }
    const rows = parsed.data
    const supabase = getSupabaseAdmin()
    let successCount = 0
    const errors: string[] = []

    for (const row of rows) {
      try {
        // 0. Reject scores above the assessment maximum for this type
        if (row.score > maxForType(row.type)) {
          errors.push(`${row.reg_number}: ${row.subject} ${row.type} score ${row.score} exceeds max ${maxForType(row.type)}`)
          continue
        }

        // 1. Find student
        const { data: student } = await supabase
          .from("students")
          .select("id")
          .eq("reg_number", row.reg_number)
          .single()
          
        if (!student) {
          errors.push(`${row.reg_number} not found`)
          continue
        }

        // 2. Find or create assessment
        let { data: assessment } = await supabase
          .from("assessments")
          .select("id")
          .eq("name", `${row.subject} ${row.type}`)
          .eq("term", row.term)
          .single()

        if (!assessment) {
          const { data: newA, error: createErr } = await supabase
            .from("assessments")
            .insert({
              name: `${row.subject} ${row.type}`,
              type: row.type,
              max_score: maxForType(row.type),
              term: row.term
            })
            .select("id")
            .single()
            
          if (createErr || !newA) throw createErr || new Error("Failed to create assessment")
          assessment = newA
        }

        // 3. Insert or update score (assessment is now guaranteed)
        const { error: scoreErr } = await supabase
          .from("scores")
          .upsert({
            student_id: student.id,
            assessment_id: assessment!.id,
            score: row.score
          }, { onConflict: "student_id,assessment_id" })
          
        if (scoreErr) throw scoreErr
        successCount++
        
      } catch (err: any) {
        errors.push(`${row.reg_number}: ${err.message}`)
      }
    }

    return NextResponse.json({ success: true, uploaded: successCount, errors })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
