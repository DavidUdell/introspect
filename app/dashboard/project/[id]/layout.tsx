"use client"

import type React from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { storage, type Project } from "@/lib/storage"

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const params = useParams()
  const pathname = usePathname()
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

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    if (pathname.includes('/overview')) return 'overview'
    if (pathname.includes('/hypotheses')) return 'hypotheses'
    if (pathname.includes('/readings')) return 'readings'
    if (pathname.includes('/results')) return 'results'
    return 'overview'
  }

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
        
        {/* Navigation with Overview separated */}
        <div className="flex items-center space-x-2">
          {/* Overview tab - positioned on the left */}
          <Tabs value={getActiveTab()} className="w-auto">
            <TabsList className="h-10 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger 
                value="overview" 
                asChild
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
              >
                <Link href={`/dashboard/project/${projectId}/overview`}>Overview</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Main navigation tabs - positioned adjacent to Overview */}
          <Tabs value={getActiveTab()} className="w-auto">
            <TabsList className="h-10">
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
      </div>
      {children}
    </div>
  )
} 