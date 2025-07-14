"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BrainCircuit, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { storage, type Project } from "@/lib/storage"

export default function OnboardingFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const router = useRouter()

  const handleComplete = () => {
    // Create a simple project
    const newProject: Project = {
      id: 1, // Will be overridden by storage system
      title: projectName || "My Research Project",
      description: projectDescription || "Research project created during onboarding",
      lastUpdated: "Just now",
      progress: 0,
      createdAt: new Date().toISOString(),
    }

    // Save to storage
    const existingData = storage.loadData()
    
    // Get the next available project ID
    const nextProjectId = existingData ? Math.max(...existingData.projects.map(p => p.id), 0) + 1 : 1
    
    // Update the project with the correct ID
    const projectWithCorrectId = {
      ...newProject,
      id: nextProjectId,
    }
    
    const updatedData = {
      ...existingData,
      projects: existingData ? [...existingData.projects, projectWithCorrectId] : [projectWithCorrectId],
      hypotheses: existingData?.hypotheses || [],
      readings: existingData?.readings || [],
      results: existingData?.results || [],
    }
    
    storage.saveData(updatedData)

    onClose()
    router.push("/dashboard")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
            Welcome to Introspect
          </DialogTitle>
          <DialogDescription>
            Let's create your first research project to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Research Project</CardTitle>
              <CardDescription>
                Give your research project a name and description. You can add hypotheses, readings, and results later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Climate Change Impact Study"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Briefly describe what you're researching..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700">
              Create Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
