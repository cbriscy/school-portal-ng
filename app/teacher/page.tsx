"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TeacherRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.push("/teacher/login")
  }, [])
  return <div style={{ padding: 40, textAlign: "center" }}>Redirecting to login...</div>
}
