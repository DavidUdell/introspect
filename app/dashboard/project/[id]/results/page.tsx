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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, ChevronDown, ChevronUp, FileCheck, FileX, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { storage, type Project, type Result } from "@/lib/storage"

export default function ProjectResultsPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [newResult, setNewResult] = useState({
    title: "",
    description: "",
    findings: "",
    conclusion: "",
    status: "inconclusive",
    confidence: "low",
    relatedHypotheses: [],
  })
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [expandedResults, setExpandedResults] = useState<number[]>([])
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = storage.loadData()
        if (savedData) {
          const foundProject = savedData.projects.find(p => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
            setResults(savedData.results.filter(r => r.projectId === projectId))
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

  const toggleExpand = (id: number) => {
    setExpandedResults(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  const handleCreateResult = () => {
    if (newResult.title.trim() === "") return

    const result: Result = {
      id: Math.max(...results.map(r => r.id), 0) + 1,
      projectId: projectId,
      title: newResult.title,
      description: newResult.description,
      findings: newResult.findings,
      conclusion: newResult.conclusion,
      status: newResult.status as "supports" | "contradicts" | "partially_supports" | "inconclusive",
      confidence: newResult.confidence as "high" | "medium" | "low",
      relatedHypotheses: newResult.relatedHypotheses,
      date: new Date().toISOString().split("T")[0],
    }

    const updatedResults = [...results, result]
    setResults(updatedResults)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      storage.saveData({
        ...savedData,
        results: [...savedData.results, result]
      })
    }
    
    setNewResult({
      title: "",
      description: "",
      findings: "",
      conclusion: "",
      status: "inconclusive",
      confidence: "low",
      relatedHypotheses: [],
    })
    setOpen(false)
  }

  const handleViewDetails = (result: Result) => {
    setSelectedResult(result)
    setDetailsOpen(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "supports":
        return <FileCheck className="h-4 w-4 text-green-500" />
      case "contradicts":
        return <FileX className="h-4 w-4 text-red-500" />
      case "partially_supports":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "supports":
        return "Supports"
      case "contradicts":
        return "Contradicts"
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
          <h1 className="text-2xl font-bold">Results</h1>
        </div>
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
                    onValueChange={(value: string) => setNewResult({ ...newResult, status: value })}
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
                    onValueChange={(value: string) => setNewResult({ ...newResult, confidence: value })}
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
        {results.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500">No results yet. Add your first result to get started!</p>
          </div>
        ) : (
          results.map((result) => (
            <Card key={result.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                    <CardDescription>
                      {result.date}
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
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(result)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Result Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedResult?.title}</DialogTitle>
            <DialogDescription>
              {selectedResult?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedResult && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedResult.description}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Findings:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedResult.findings}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Conclusion:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedResult.conclusion}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Hypothesis Status:</h4>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedResult.status)}
                    <span className="text-sm">{getStatusText(selectedResult.status)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Confidence Level:</h4>
                  {getConfidenceBadge(selectedResult.confidence)}
                </div>
              </div>
              
              {selectedResult.relatedHypotheses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Related Hypotheses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.relatedHypotheses.map((id) => (
                      <div key={id} className="text-xs bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                        Hypothesis #{id}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 