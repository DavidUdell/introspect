"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id

  useEffect(() => {
    // Redirect to the project overview page
    router.replace(`/dashboard/project/${projectId}/overview`)
  }, [projectId, router])

  return (
    <div className="flex items-center justify-center h-64">
      <p>Redirecting to project overview...</p>
    </div>
  )
} 