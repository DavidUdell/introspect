"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Trash2, Check, X } from "lucide-react"
import Link from "next/link"
import { storage, type Project, type Hypothesis } from "@/lib/storage"

export default function ProjectHypothesesPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [newHypothesis, setNewHypothesis] = useState({
    statement: "",
    assumptions: "",
    status: "active",
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = storage.loadData()
        if (savedData) {
          const foundProject = savedData.projects.find(p => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
            setHypotheses(savedData.hypotheses.filter(h => h.projectId === projectId))
          }
        }
      } catch (err) {
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectId])

  const handleCreateHypothesis = () => {
    if (newHypothesis.statement.trim() === "") return

    const hypothesis: Hypothesis = {
      id: Math.max(...hypotheses.map(h => h.id), 0) + 1,
      projectId: projectId,
      statement: newHypothesis.statement,
      assumptions: newHypothesis.assumptions.split("\n").filter((a) => a.trim() !== ""),
      status: newHypothesis.status as "draft" | "active" | "testing" | "confirmed" | "rejected",
      createdAt: new Date().toISOString().split("T")[0],
    }

    const updatedHypotheses = [...hypotheses, hypothesis]
    setHypotheses(updatedHypotheses)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      storage.saveData({
        ...savedData,
        hypotheses: [...savedData.hypotheses, hypothesis]
      })
    }
    
    setNewHypothesis({ statement: "", assumptions: "", status: "active" })
    setOpen(false)
  }

  const handleEditHypothesis = (hypothesis: Hypothesis) => {
    setEditingHypothesis(hypothesis)
    setEditOpen(true)
  }

  const handleUpdateHypothesis = () => {
    if (!editingHypothesis) return

    const updatedHypothesis = {
      ...editingHypothesis,
      statement: editingHypothesis.statement,
      assumptions: editingHypothesis.assumptions,
      status: editingHypothesis.status,
    }

    const updatedHypotheses = hypotheses.map(h => 
      h.id === editingHypothesis.id ? updatedHypothesis : h
    )
    setHypotheses(updatedHypotheses)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      const allHypotheses = savedData.hypotheses.map(h => 
        h.id === editingHypothesis.id ? updatedHypothesis : h
      )
      storage.saveData({
        ...savedData,
        hypotheses: allHypotheses
      })
    }
    
    setEditingHypothesis(null)
    setEditOpen(false)
  }

  const handleDeleteHypothesis = (id: number) => {
    const updatedHypotheses = hypotheses.filter(h => h.id !== id)
    setHypotheses(updatedHypotheses)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      const allHypotheses = savedData.hypotheses.filter(h => h.id !== id)
      storage.saveData({
        ...savedData,
        hypotheses: allHypotheses
      })
    }
  }

  const handleStatusChange = (hypothesisId: number, newStatus: "confirmed" | "rejected") => {
    const updatedHypotheses = hypotheses.map(h => 
      h.id === hypothesisId ? { ...h, status: newStatus } : h
    )
    setHypotheses(updatedHypotheses)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      const allHypotheses = savedData.hypotheses.map(h => 
        h.id === hypothesisId ? { ...h, status: newStatus } : h
      )
      storage.saveData({
        ...savedData,
        hypotheses: allHypotheses
      })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">Project not found</p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hypotheses</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Hypothesis
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Hypothesis</DialogTitle>
              <DialogDescription>Define your research hypothesis and key assumptions.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="statement">Hypothesis Statement</Label>
                <Textarea
                  id="statement"
                  value={newHypothesis.statement}
                  onChange={(e) => setNewHypothesis({ ...newHypothesis, statement: e.target.value })}
                  placeholder="State your hypothesis clearly and specifically"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="assumptions">Key Assumptions</Label>
                <Textarea
                  id="assumptions"
                  value={newHypothesis.assumptions}
                  onChange={(e) => setNewHypothesis({ ...newHypothesis, assumptions: e.target.value })}
                  placeholder="List each assumption on a new line"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Enter each assumption on a new line</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue="active"
                  onValueChange={(value: string) => setNewHypothesis({ ...newHypothesis, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateHypothesis}>Create Hypothesis</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {hypotheses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">No hypotheses yet. Create your first hypothesis to get started!</p>
          </div>
        ) : (
          hypotheses.map((hypothesis) => (
            <Card key={hypothesis.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{hypothesis.statement}</CardTitle>
                    <CardDescription>
                      Created: {hypothesis.createdAt}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditHypothesis(hypothesis)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteHypothesis(hypothesis.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Assumptions:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {hypothesis.assumptions.map((assumption, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Status:</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      hypothesis.status === "active"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : hypothesis.status === "testing"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                          : hypothesis.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : hypothesis.status === "rejected"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {hypothesis.status.charAt(0).toUpperCase() + hypothesis.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                    onClick={() => handleStatusChange(hypothesis.id, "confirmed")}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => handleStatusChange(hypothesis.id, "rejected")}
                  >
                    <X className="mr-1 h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Edit Hypothesis Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hypothesis</DialogTitle>
            <DialogDescription>Update your research hypothesis and key assumptions.</DialogDescription>
          </DialogHeader>
          {editingHypothesis && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-statement">Hypothesis Statement</Label>
                <Textarea
                  id="edit-statement"
                  value={editingHypothesis.statement}
                  onChange={(e) => setEditingHypothesis({ ...editingHypothesis, statement: e.target.value })}
                  placeholder="State your hypothesis clearly and specifically"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-assumptions">Key Assumptions</Label>
                <Textarea
                  id="edit-assumptions"
                  value={editingHypothesis.assumptions.join("\n")}
                  onChange={(e) => setEditingHypothesis({ 
                    ...editingHypothesis, 
                    assumptions: e.target.value.split("\n").filter((a) => a.trim() !== "")
                  })}
                  placeholder="List each assumption on a new line"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Enter each assumption on a new line</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingHypothesis.status}
                  onValueChange={(value: string) => setEditingHypothesis({ 
                    ...editingHypothesis, 
                    status: value as "draft" | "active" | "testing" | "confirmed" | "rejected"
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateHypothesis}>Update Hypothesis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 