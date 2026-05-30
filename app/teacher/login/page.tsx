"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../../lib/supabase"

export default function TeacherLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data: teacher, error } = await supabase
        .from("teachers")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password)
        .single()

      if (error || !teacher) {
        setError("Invalid email or password")
        setLoading(false)
        return
      }

      // Store teacher session
      localStorage.setItem("teacher", JSON.stringify(teacher))
      router.push("/teacher/dashboard")
    } catch {
      setError("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.3)", padding: 48, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>👨‍</div>
          <h1 style={{ fontSize: 26, fontWeight: "bold", color: "#1a202c", margin: "0 0 8px" }}>Teacher Portal</h1>
          <p style={{ fontSize: 14, color: "#718096", margin: 0 }}>Sign in to manage students & scores</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#4a5568", marginBottom: 8 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="teacher@school.com"
              required
              style={{ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 15, boxSizing: "border-box" }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#4a5568", marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "12px 14px", border: "2px solid #e2e8f0", borderRadius: 10, fontSize: 15, boxSizing: "border-box" }}
            />
          </div>

          {error && <div style={{ background: "#fed7d7", border: "1px solid #fc8181", color: "#c53030", padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: "bold", cursor: "pointer", opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#718096" }}>
            Demo: teacher@school.com / admin123
          </p>
        </form>
      </div>
    </div>
  )
}
