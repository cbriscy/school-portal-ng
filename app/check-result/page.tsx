"use client"
import { useState } from "react"
import { supabase } from "../../lib/supabase"

export default function CheckResultPage() {
  const [reg, setReg] = useState("")
  const [pin, setPin] = useState("")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!reg.trim() || !pin.trim()) {
      setError("⚠️ Please enter both fields")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)
    
    try {
      // 1. Validate PIN - Note: 'id' is now included in select
      const { data: pinData, error: pinErr } = await supabase
        .from("result_pins")
        .select("id, student_id, is_used") 
        .eq("pin", pin.toUpperCase().trim())
        .single()
        
      if (pinErr || !pinData || pinData.is_used) {
        setError("❌ Invalid or used PIN")
        setLoading(false)
        return
      }

      // 2. Fetch student
      const { data: student, error: stuErr } = await supabase
        .from("students")
        .select("*, classes(name, level)")
        .eq("reg_number", reg.toUpperCase().trim())
        .single()
        
      if (stuErr || !student) {
        setError("❌ Student not found")
        setLoading(false)
        return
      }

      // 3. Fetch scores
      const { data: scores } = await supabase
        .from("scores")
        .select("score, assessments(type, name)")
        .eq("student_id", student.id)
        
      setResult({ student, scores })
      
      // Mark PIN used
      await supabase.from("result_pins").update({ is_used: true }).eq("id", pinData.id)
    } catch (err) {
      setError("❌ Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent text-center mb-6">
             Check Result
          </h1>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Reg Number (e.g. SS1/001)"
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
            />
            <input
              type="password"
              placeholder="PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
            />

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={check}
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? "Checking..." : "🔍 Check Result"}
            </button>
          </div>

          {result && (
            <div className="mt-6 p-6 bg-green-50 rounded-xl border border-green-200">
              <h3 className="text-xl font-bold text-gray-900">
                {result.student.first_name} {result.student.last_name}
              </h3>
              <p className="text-sm text-gray-600 mt-2">Class: {result.student.classes?.name || "N/A"}</p>
              <p className="text-sm text-gray-600">Scores: {result.scores?.length || 0} subjects</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
