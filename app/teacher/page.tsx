"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function TeacherDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setMessage("")
    
    try {
      const text = await file.text()
      const rows = text.split("\n").slice(1) // Remove header
      
      const scores = rows
        .map(row => {
          const [reg, subject, type, score] = row.split(",")
          if (!reg || !subject || !score) return null
          return {
            reg_number: reg.trim().toUpperCase(),
            assessment_name: subject.trim(),
            assessment_type: type.trim(), // CA1, CA2, Exam
            score: parseFloat(score)
          }
        })
        .filter(Boolean)

      // Note: This is a simplified upload. In production, you'd map reg_number -> student_id
      // and assessment_name -> assessment_id. For now, this is a demo.
      
      setMessage(`✅ Successfully processed ${scores.length} records from CSV!`)
      setMessageType("success")
    } catch (err) {
      setMessage("❌ Error parsing file. Check format.")
      setMessageType("error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
          👩‍🏫 Teacher Dashboard
        </h1>

        {/* Upload Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Scores via CSV</h2>
          
          <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              className="hidden" 
              id="csv-upload" 
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-lg font-semibold text-gray-700">
                {file ? file.name : "Click to select CSV file"}
              </p>
              <p className="text-sm text-gray-500">
                Format: reg_number, subject_name, type(CA1/CA2/Exam), score
              </p>
            </label>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "🚀 Upload Scores"}
          </button>
        </div>
      </div>
    </div>
  )
}
