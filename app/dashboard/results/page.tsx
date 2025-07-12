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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Plus, ChevronDown, ChevronUp, FileCheck, FileX, AlertTriangle } from "lucide-react"

// Sample results data
const initialResults = [
  {
    id: 1,
    title: "Coral Reef Biodiversity Survey - Site A",
    description: "Field study measuring species diversity in coral reef ecosystem at Site A (tropical Pacific).",
    date: "2023-11-10",
    projectId: 1,
    relatedHypotheses: [1, 2],
    findings:
      "Observed 22% reduction in species diversity compared to 2018 baseline. Water temperature increased by 1.2°C over the same period.",
    conclusion:
      "Data supports hypothesis that rising temperatures correlate with biodiversity reduction, though at a lower rate than predicted.",
    status: "supports",
    confidence: "medium",
  },
  {
    id: 2,
    title: "Neural Network Model Performance - Initial Test",
    description: "First test of CNN model on cardiovascular imaging dataset.",
    date: "2023-10-05",
    projectId: 2,
    relatedHypotheses: [3],
    findings:
      "Model achieved 82% accuracy, compared to 71% for traditional diagnostic methods. False negative rate was 8%, which is still above target threshold.",
    conclusion:
      "Initial results are promising but require model refinement to reduce false negative rate before clinical validation.",
    status: "partially_supports",
    confidence: "low",
  },
  {
    id: 3,
    title: "Marine Species Migration Tracking",
    description: "Analysis of 5-year tracking data for key indicator species.",
    date: "2023-12-01",
    projectId: 1,
    relatedHypotheses: [2],
    findings:
      "Average northward migration of 38km observed across all tracked species. Some species showed no significant movement pattern.",
    conclusion:
      "Migration patterns support hypothesis direction but magnitude is less than predicted. Geographical barriers appear to be limiting factor for some species.",
    status: "partially_supports",
    confidence: "medium",
  },
]

export default function ResultsPage() {
  const [results, setResults] = useState(initialResults)
  const [newResult, setNewResult] = useState({
    title: "",
    description: "",
    projectId: "",
    findings: "",
    conclusion: "",
    status: "inconclusive",
    confidence: "low",
  })
  const [open, setOpen] = useState(false)
  const [expandedResults, setExpandedResults] = useState<number[]>([])

  const toggleExpand = (id: number) => {
    if (expandedResults.includes(id)) {
      setExpandedResults(expandedResults.filter((resultId) => resultId !== id))
    } else {
      setExpandedResults([...expandedResults, id])
    }
  }

  const handleCreateResult = () => {
    if (newResult.title.trim() === "") return

    const result = {
      id: results.length + 1,
      title: newResult.title,
      description: newResult.description,
      date: new Date().toISOString().split("T")[0],
      projectId: Number.parseInt(newResult.projectId) || 1,
      relatedHypotheses: [],
      findings: newResult.findings,
      conclusion: newResult.conclusion,
      status: newResult.status,
      confidence: newResult.confidence,
    }

    setResults([...results, result])
    setNewResult({
      title: "",
      description: "",
      projectId: "",
      findings: "",
      conclusion: "",
      status: "inconclusive",
      confidence: "low",
    })
    setOpen(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "supports":
        return <FileCheck className="h-4 w-4 text-green-500" />
      case "contradicts":
        return <FileX className="h-4 w-4 text-red-500" />
      case "partially_supports":
        return <FileCheck className="h-4 w-4 text-amber-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "supports":
        return "Supports Hypothesis"
      case "contradicts":
        return "Contradicts Hypothesis"
      case "partially_supports":
        return "Partially Supports"
      default:
        return "Inconclusive"
    }
  }

  const getConfidenceBadge = (confidence: string) => {
    const classes = {
      high: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    }

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${classes[confidence as keyof typeof classes]}`}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Confidence
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Results</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Research Result</DialogTitle>
              <DialogDescription>Document and evaluate your research findings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Result Title</Label>
                <Input
                  id="title"
                  value={newResult.title}
                  onChange={(e) => setNewResult({ ...newResult, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project">Research Project</Label>
                <Select onValueChange={(value) => setNewResult({ ...newResult, projectId: value })}>
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
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newResult.description}
                  onChange={(e) => setNewResult({ ...newResult, description: e.target.value })}
                  placeholder="Briefly describe this result or experiment"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="findings">Findings</Label>
                <Textarea
                  id="findings"
                  value={newResult.findings}
                  onChange={(e) => setNewResult({ ...newResult, findings: e.target.value })}
                  placeholder="Describe the data or findings in detail"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="conclusion">Conclusion</Label>
                <Textarea
                  id="conclusion"
                  value={newResult.conclusion}
                  onChange={(e) => setNewResult({ ...newResult, conclusion: e.target.value })}
                  placeholder="What conclusions can be drawn from these findings?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Hypothesis Status</Label>
                  <Select
                    defaultValue="inconclusive"
                    onValueChange={(value) => setNewResult({ ...newResult, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supports">Supports Hypothesis</SelectItem>
                      <SelectItem value="contradicts">Contradicts Hypothesis</SelectItem>
                      <SelectItem value="partially_supports">Partially Supports</SelectItem>
                      <SelectItem value="inconclusive">Inconclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confidence">Confidence Level</Label>
                  <Select
                    defaultValue="low"
                    onValueChange={(value) => setNewResult({ ...newResult, confidence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateResult}>Add Result</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{result.title}</CardTitle>
                  <CardDescription>
                    {result.date} • Project ID: {result.projectId}
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => toggleExpand(result.id)}>
                  {expandedResults.includes(result.id) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">{result.description}</p>

              {expandedResults.includes(result.id) && (
                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Findings:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.findings}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Conclusion:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{result.conclusion}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Related Hypotheses:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.relatedHypotheses.map((id) => (
                        <div key={id} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          Hypothesis #{id}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getStatusIcon(result.status)}
                  <span className="text-xs font-medium">{getStatusText(result.status)}</span>
                </div>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                {getConfidenceBadge(result.confidence)}
              </div>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
