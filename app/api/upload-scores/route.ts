import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  const { assessmentId, scores } = await req.json()
  
  const inserts = scores.map((s: any) => ({
    student_id: s.studentId,
    assessment_id: assessmentId,
    score: parseFloat(s.score)
  }))

  const { error } = await supabaseAdmin.from("scores").insert(inserts)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  
  return NextResponse.json({ success: true, count: inserts.length })
}