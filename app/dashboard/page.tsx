"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Plus, ArrowRight } from "lucide-react"
import Link from "next/link"

// Sample project data
const initialProjects = [
  {
    id: 1,
    title: "Climate Change Impact on Marine Ecosystems",
    description: "Investigating the effects of rising ocean temperatures on coral reef biodiversity.",
    lastUpdated: "2 days ago",
    progress: 65,
  },
  {
    id: 2,
    title: "Machine Learning for Medical Diagnosis",
    description: "Developing neural network models to improve early detection of cardiovascular diseases.",
    lastUpdated: "5 days ago",
    progress: 40,
  },
]

export default function DashboardPage() {
  const [projects, setProjects] = useState(initialProjects)
  const [newProject, setNewProject] = useState({ title: "", description: "" })
  const [open, setOpen] = useState(false)

  const handleCreateProject = () => {
    if (newProject.title.trim() === "") return

    const project = {
      id: projects.length + 1,
      title: newProject.title,
      description: newProject.description,
      lastUpdated: "Just now",
      progress: 0,
    }

    setProjects([...projects, project])
    setNewProject({ title: "", description: "" })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Research Project</DialogTitle>
              <DialogDescription>Add details about your new research project.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Briefly describe your research project"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>Create Project</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>Last updated: {project.lastUpdated}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{project.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/dashboard/project/${project.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Open Project
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
