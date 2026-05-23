import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { assessmentId, scores } = await req.json()
    
    if (!assessmentId || !Array.isArray(scores)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    
    const inserts = scores.map((s: any) => ({
      student_id: s.studentId,
      assessment_id: assessmentId,
      score: parseFloat(s.score)
    }))

    const { error } = await supabase.from("scores").insert(inserts)
    if (error) throw error
    
    return NextResponse.json({ success: true, count: inserts.length })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
