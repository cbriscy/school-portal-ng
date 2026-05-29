"use client"
import { useState } from "react"

const TERMS = ["First", "Second", "Third"]

export default function TeacherDashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [term, setTerm] = useState("First")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setMessage("")
    
    try {
      const text = await file.text()
      const rows = text.split("\n").slice(1)
      
      const data = rows
        .map(r => {
          const [reg, subject, type, score] = r.split(",")
          if (!reg || !subject || !score) return null
          return { reg_number: reg.trim().toUpperCase(), subject: subject.trim(), type: type.trim(), score: parseFloat(score), term }
        })
        .filter(Boolean)

      const res = await fetch("/api/upload-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data })
      })

      const json = await res.json()
      if (json.success) {
        setMessage(`✅ Uploaded ${json.uploaded} scores to ${term} Term!`)
        if (json.errors?.length) setMessage(m => m + `\n️ ${json.errors.length} skipped`)
        setMessageType("success")
      } else {
        setMessage(`❌ ${json.error}`)
        setMessageType("error")
      }
    } catch {
      setMessage("❌ Upload failed. Check file format.")
      setMessageType("error")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              👩‍🏫 Teacher Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage classes, upload scores, track progress</p>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
            <span className="text-sm font-medium text-gray-700">Term:</span>
            <select value={term} onChange={e => setTerm(e.target.value)} className="bg-transparent font-semibold text-indigo-600 focus:outline-none">
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["Total Students", "Classes", "Assessments", "Uploads"].map((label, i) => (
            <div key={label} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{i === 0 ? "42" : i === 1 ? "6" : i === 2 ? "18" : "12"}</p>
            </div>
          ))}
        </div>

        {/* Upload Zone */}
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 text-indigo-600">📤</span>
            Bulk Score Upload
          </h2>

          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-indigo-400 bg-indigo-50/50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50') }}
            onDragLeave={e => { e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50') }}
            onDrop={e => { e.preventDefault(); if(e.dataTransfer.files[0]) { setFile(e.dataTransfer.files[0]) } }}
          >
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
            <label htmlFor="csv-upload" className="cursor-pointer block">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-lg font-semibold text-gray-700">{file ? file.name : "Drag & drop CSV or click to browse"}</p>
              <p className="text-sm text-gray-500 mt-2">Format: reg_number, subject, type(CA1/CA2/Exam), score</p>
            </label>
          </div>

          {message && (
            <div className={`mt-4 p-4 rounded-xl whitespace-pre-line text-sm font-medium ${messageType === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:transform-none text-lg"
          >
            {uploading ? "Uploading & Processing..." : `🚀 Upload to ${term} Term`}
          </button>
        </div>
      </div>
    </div>
  )
}
