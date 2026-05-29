import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { rows } = await req.json()
    const supabase = getSupabaseAdmin()
    let successCount = 0
    let errors: string[] = []

    for (const row of rows) {
      try {
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
              max_score: row.type === "Exam" ? 60 : 10,
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
            assessment_id: assessment!.id, // ! tells TypeScript "this is not null"
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
