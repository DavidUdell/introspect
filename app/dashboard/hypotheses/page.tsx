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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Plus, Edit, Trash2, Check, X } from "lucide-react"

// Sample hypothesis data
const initialHypotheses = [
  {
    id: 1,
    projectId: 1,
    statement:
      "Rising ocean temperatures above 2°C will cause a 30% reduction in coral reef biodiversity within 5 years.",
    assumptions: [
      "Current rate of temperature increase remains constant",
      "No significant adaptation mechanisms emerge in coral species",
    ],
    status: "active",
    createdAt: "2023-10-15",
  },
  {
    id: 2,
    projectId: 1,
    statement: "Marine species migration patterns will shift northward by at least 50km in response to warming waters.",
    assumptions: ["No geographical barriers prevent migration", "Food sources are available in new habitats"],
    status: "active",
    createdAt: "2023-11-02",
  },
  {
    id: 3,
    projectId: 2,
    statement:
      "Neural networks can detect early cardiovascular disease markers with 15% higher accuracy than traditional methods.",
    assumptions: [
      "Sufficient quality training data is available",
      "Model can be optimized for low false negative rate",
    ],
    status: "testing",
    createdAt: "2023-09-28",
  },
]

export default function HypothesesPage() {
  const [hypotheses, setHypotheses] = useState(initialHypotheses)
  const [newHypothesis, setNewHypothesis] = useState({
    projectId: "",
    statement: "",
    assumptions: "",
    status: "active",
  })
  const [open, setOpen] = useState(false)

  const handleCreateHypothesis = () => {
    if (newHypothesis.statement.trim() === "") return

    const hypothesis = {
      id: hypotheses.length + 1,
      projectId: Number.parseInt(newHypothesis.projectId) || 1,
      statement: newHypothesis.statement,
      assumptions: newHypothesis.assumptions.split("\n").filter((a) => a.trim() !== ""),
      status: newHypothesis.status,
      createdAt: new Date().toISOString().split("T")[0],
    }

    setHypotheses([...hypotheses, hypothesis])
    setNewHypothesis({ projectId: "", statement: "", assumptions: "", status: "active" })
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Hypotheses</h1>
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
                <Label htmlFor="project">Research Project</Label>
                <Select onValueChange={(value) => setNewHypothesis({ ...newHypothesis, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Climate Change Impact on Marine Ecosystems</SelectItem>
                    <SelectItem value="2">Machine Learning for Medical Diagnosis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                  onValueChange={(value) => setNewHypothesis({ ...newHypothesis, status: value })}
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
        {hypotheses.map((hypothesis) => (
          <Card key={hypothesis.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{hypothesis.statement}</CardTitle>
                  <CardDescription>
                    Created: {hypothesis.createdAt} • Project ID: {hypothesis.projectId}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
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
                >
                  <Check className="mr-1 h-3 w-3" />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
