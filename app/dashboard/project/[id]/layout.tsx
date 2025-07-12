"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { storage, type Project } from "@/lib/storage"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = () => {
      try {
        const savedData = storage.loadData()
        if (savedData) {
          const foundProject = savedData.projects.find(p => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
          }
        }
      } catch (err) {
        console.error("Error loading project:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">Project not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          {project.description && (
            <p className="text-gray-500 mt-1">{project.description}</p>
          )}
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-4 h-9">
            <TabsTrigger value="overview" asChild>
              <Link href={`/dashboard/project/${projectId}/overview`}>Overview</Link>
            </TabsTrigger>
            <TabsTrigger value="hypotheses" asChild>
              <Link href={`/dashboard/project/${projectId}/hypotheses`}>Hypotheses</Link>
            </TabsTrigger>
            <TabsTrigger value="readings" asChild>
              <Link href={`/dashboard/project/${projectId}/readings`}>Readings</Link>
            </TabsTrigger>
            <TabsTrigger value="results" asChild>
              <Link href={`/dashboard/project/${projectId}/results`}>Results</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {children}
    </div>
  )
} 