// app/api/results/generate-pdf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { pdf } from "@react-pdf/renderer"
import { WAECReportCard } from "@/components/WAECReportCard"
import { supabaseAdmin } from "@/lib/supabase"
import { z } from "zod" // Optional but recommended for validation

// Schema for request validation
const requestSchema = z.object({
  studentId: z.string().uuid().or(z.string().regex(/^[A-Z0-9\/\-_]+$/i)),
})

export async function POST(req: NextRequest) {
  try {
    // 🔐 1. Authenticate request (adjust based on your auth strategy)
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Optional: Verify token with Supabase Auth
    // const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(
    //   authHeader.replace("Bearer ", "")
    // )
    // if (authErr || !user) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    // ✅ 2. Validate input
    const body = await req.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    
    const validated = requestSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid studentId format", details: validated.error.flatten() },
        { status: 400 }
      )
    }
    const { studentId } = validated.data

    // 📥 3. Fetch real student data (replace mockData)
    const { data: student, error: stuErr } = await supabaseAdmin
      .from("students")
      .select(`
        *,
        scores (
          score,
          assessments (
            type,
            name,
            subjects ( name )
          )
        ),
        class ( name )
      `)
      .eq("id", studentId)
      .single()

    if (stuErr || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // 📄 4. Generate PDF - Convert Buffer to ArrayBuffer for Supabase compatibility
    const doc = <WAECReportCard data={student} />
    const buffer = await pdf(doc).toBuffer()
    
    // ✅ Convert Node Buffer → ArrayBuffer (critical for Edge/Serverless)
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    )

    // 🗂️ 5. Sanitize filename & upload to Supabase Storage
    const safeFilename = `${studentId.replace(/[\/\\]/g, "_")}_result.pdf`
    const bucket = "result-pdfs"
    
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(bucket)
      .upload(safeFilename, arrayBuffer, {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "3600",
      })
      
    if (uploadErr) {
      console.error("Upload error:", uploadErr)
      return NextResponse.json(
        { error: "Failed to store PDF", details: uploadErr.message },
        { status: 500 }
      )
    }

    // 🔗 6. Create signed URL (1 hour expiry)
    const { data: { signedUrl }, error: urlErr } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(safeFilename, 3600)

    if (urlErr) {
      return NextResponse.json(
        { error: "Failed to generate download link" },
        { status: 500 }
      )
    }

    // ✅ 7. Return success response
    return NextResponse.json(
      { 
        success: true, 
        downloadUrl: signedUrl,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
      },
      { 
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store", // Prevent caching sensitive URLs
        }
      }
    )

  } catch (err: any) {
    console.error("PDF generation error:", err)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined
      },
      { status: 500 }
    )
  }
}