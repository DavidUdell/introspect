"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Lightbulb,
  BookOpen,
  Beaker,
  BrainCircuit,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Network,
} from "lucide-react"
import { useRouter } from "next/navigation"

interface Hypothesis {
  id: number
  statement: string
  assumptions: string[]
  status: string
}

interface Reading {
  id: number
  title: string
  authors: string
  source: string
  year: number
  type: string
  notes: string
  tags: string[]
}

interface Result {
  id: number
  title: string
  type: "empirical" | "theoretical"
  findings: string
  conclusion: string
  status: string
  confidence: string
}

export default function OnboardingFlow({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [readings, setReadings] = useState<Reading[]>([])
  const [results, setResults] = useState<Result[]>([])
  const router = useRouter()

  // Form states
  const [hypothesisForm, setHypothesisForm] = useState({
    statement: "",
    assumptions: "",
    status: "active",
  })

  const [readingForm, setReadingForm] = useState({
    title: "",
    authors: "",
    source: "",
    year: new Date().getFullYear().toString(),
    type: "journal",
    notes: "",
    tags: "",
  })

  const [resultForm, setResultForm] = useState({
    title: "",
    type: "empirical" as "empirical" | "theoretical",
    findings: "",
    conclusion: "",
    status: "supports",
    confidence: "medium",
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const addHypothesis = () => {
    if (hypothesisForm.statement.trim() === "") return

    const newHypothesis: Hypothesis = {
      id: hypotheses.length + 1,
      statement: hypothesisForm.statement,
      assumptions: hypothesisForm.assumptions.split("\n").filter((a) => a.trim() !== ""),
      status: hypothesisForm.status,
    }

    setHypotheses([...hypotheses, newHypothesis])
    setHypothesisForm({ statement: "", assumptions: "", status: "active" })
  }

  const addReading = () => {
    if (readingForm.title.trim() === "") return

    const newReading: Reading = {
      id: readings.length + 1,
      title: readingForm.title,
      authors: readingForm.authors,
      source: readingForm.source,
      year: Number.parseInt(readingForm.year),
      type: readingForm.type,
      notes: readingForm.notes,
      tags: readingForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
    }

    setReadings([...readings, newReading])
    setReadingForm({
      title: "",
      authors: "",
      source: "",
      year: new Date().getFullYear().toString(),
      type: "journal",
      notes: "",
      tags: "",
    })
  }

  const addResult = () => {
    if (resultForm.title.trim() === "") return

    const newResult: Result = {
      id: results.length + 1,
      title: resultForm.title,
      type: resultForm.type,
      findings: resultForm.findings,
      conclusion: resultForm.conclusion,
      status: resultForm.status,
      confidence: resultForm.confidence,
    }

    setResults([...results, newResult])
    setResultForm({
      title: "",
      type: "empirical",
      findings: "",
      conclusion: "",
      status: "supports",
      confidence: "medium",
    })
  }

  const removeHypothesis = (id: number) => {
    setHypotheses(hypotheses.filter((h) => h.id !== id))
  }

  const removeReading = (id: number) => {
    setReadings(readings.filter((r) => r.id !== id))
  }

  const removeResult = (id: number) => {
    setResults(results.filter((r) => r.id !== id))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Save data to localStorage or send to backend
    localStorage.setItem(
      "introspect-onboarding-data",
      JSON.stringify({
        hypotheses,
        readings,
        results,
        completed: true,
      }),
    )

    onClose()
    router.push("/dashboard")
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return hypotheses.length > 0
      case 2:
        return readings.length > 0
      case 3:
        return true // Results are optional
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-purple-600" />
            Welcome to Introspect
          </DialogTitle>
          <DialogDescription>
            Let's set up your research systematically. Step {currentStep} of {totalSteps}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={progress} className="w-full" />

          {/* Step 1: Hypotheses */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Define Your Research Hypotheses</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Start by documenting your key research hypotheses and assumptions
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Hypothesis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hypothesis-statement">Hypothesis Statement</Label>
                    <Textarea
                      id="hypothesis-statement"
                      value={hypothesisForm.statement}
                      onChange={(e) => setHypothesisForm({ ...hypothesisForm, statement: e.target.value })}
                      placeholder="State your hypothesis clearly and specifically"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hypothesis-assumptions">Key Assumptions</Label>
                    <Textarea
                      id="hypothesis-assumptions"
                      value={hypothesisForm.assumptions}
                      onChange={(e) => setHypothesisForm({ ...hypothesisForm, assumptions: e.target.value })}
                      placeholder="List each assumption on a new line"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="hypothesis-status">Status</Label>
                    <Select
                      value={hypothesisForm.status}
                      onValueChange={(value) => setHypothesisForm({ ...hypothesisForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addHypothesis} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Hypothesis
                  </Button>
                </CardContent>
              </Card>

              {hypotheses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Your Hypotheses ({hypotheses.length})</h3>
                  {hypotheses.map((hypothesis) => (
                    <Card key={hypothesis.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium mb-2">{hypothesis.statement}</p>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <strong>Assumptions:</strong>
                              <ul className="list-disc pl-5 mt-1">
                                {hypothesis.assumptions.map((assumption, idx) => (
                                  <li key={idx}>{assumption}</li>
                                ))}
                              </ul>
                            </div>
                            <Badge variant="outline" className="mt-2">
                              {hypothesis.status}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHypothesis(hypothesis.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Readings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Document Your Readings</h2>
                <p className="text-gray-600 dark:text-gray-400">Add key sources and capture your thoughts about them</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Reading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="reading-title">Title</Label>
                      <Input
                        id="reading-title"
                        value={readingForm.title}
                        onChange={(e) => setReadingForm({ ...readingForm, title: e.target.value })}
                        placeholder="Paper or book title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reading-authors">Authors</Label>
                      <Input
                        id="reading-authors"
                        value={readingForm.authors}
                        onChange={(e) => setReadingForm({ ...readingForm, authors: e.target.value })}
                        placeholder="Author names"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="reading-source">Source</Label>
                      <Input
                        id="reading-source"
                        value={readingForm.source}
                        onChange={(e) => setReadingForm({ ...readingForm, source: e.target.value })}
                        placeholder="Journal or URL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reading-year">Year</Label>
                      <Input
                        id="reading-year"
                        type="number"
                        value={readingForm.year}
                        onChange={(e) => setReadingForm({ ...readingForm, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reading-type">Type</Label>
                      <Select
                        value={readingForm.type}
                        onValueChange={(value) => setReadingForm({ ...readingForm, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="journal">Journal Article</SelectItem>
                          <SelectItem value="book">Book</SelectItem>
                          <SelectItem value="conference">Conference Paper</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="reading-notes">Key Thoughts & Notes</Label>
                    <Textarea
                      id="reading-notes"
                      value={readingForm.notes}
                      onChange={(e) => setReadingForm({ ...readingForm, notes: e.target.value })}
                      placeholder="What are the key insights? How does this relate to your research?"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reading-tags">Tags</Label>
                    <Input
                      id="reading-tags"
                      value={readingForm.tags}
                      onChange={(e) => setReadingForm({ ...readingForm, tags: e.target.value })}
                      placeholder="Separate tags with commas"
                    />
                  </div>
                  <Button onClick={addReading} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reading
                  </Button>
                </CardContent>
              </Card>

              {readings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Your Readings ({readings.length})</h3>
                  {readings.map((reading) => (
                    <Card key={reading.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium mb-1">{reading.title}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {reading.authors} • {reading.year} • {reading.source}
                            </p>
                            <p className="text-sm mb-2">{reading.notes}</p>
                            <div className="flex flex-wrap gap-1">
                              {reading.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeReading(reading.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Beaker className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Document Your Results</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Add any empirical or theoretical results you have (optional)
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="result-title">Result Title</Label>
                      <Input
                        id="result-title"
                        value={resultForm.title}
                        onChange={(e) => setResultForm({ ...resultForm, title: e.target.value })}
                        placeholder="Descriptive title for this result"
                      />
                    </div>
                    <div>
                      <Label htmlFor="result-type">Type</Label>
                      <Select
                        value={resultForm.type}
                        onValueChange={(value: "empirical" | "theoretical") =>
                          setResultForm({ ...resultForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="empirical">Empirical</SelectItem>
                          <SelectItem value="theoretical">Theoretical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="result-findings">Findings</Label>
                    <Textarea
                      id="result-findings"
                      value={resultForm.findings}
                      onChange={(e) => setResultForm({ ...resultForm, findings: e.target.value })}
                      placeholder="Describe your findings in detail"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="result-conclusion">Conclusion</Label>
                    <Textarea
                      id="result-conclusion"
                      value={resultForm.conclusion}
                      onChange={(e) => setResultForm({ ...resultForm, conclusion: e.target.value })}
                      placeholder="What conclusions can be drawn?"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="result-status">Hypothesis Status</Label>
                      <Select
                        value={resultForm.status}
                        onValueChange={(value) => setResultForm({ ...resultForm, status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="supports">Supports</SelectItem>
                          <SelectItem value="contradicts">Contradicts</SelectItem>
                          <SelectItem value="partially_supports">Partially Supports</SelectItem>
                          <SelectItem value="inconclusive">Inconclusive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="result-confidence">Confidence</Label>
                      <Select
                        value={resultForm.confidence}
                        onValueChange={(value) => setResultForm({ ...resultForm, confidence: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addResult} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Result
                  </Button>
                </CardContent>
              </Card>

              {results.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Your Results ({results.length})</h3>
                  {results.map((result) => (
                    <Card key={result.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{result.title}</p>
                              <Badge variant={result.type === "empirical" ? "default" : "secondary"}>
                                {result.type}
                              </Badge>
                            </div>
                            <p className="text-sm mb-2">
                              <strong>Findings:</strong> {result.findings}
                            </p>
                            <p className="text-sm mb-2">
                              <strong>Conclusion:</strong> {result.conclusion}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline">{result.status.replace("_", " ")}</Badge>
                              <Badge variant="outline">{result.confidence} confidence</Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeResult(result.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Big Picture */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <Network className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">See the Big Picture</h2>
                <p className="text-gray-600 dark:text-gray-400">Here's how your research components connect together</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Hypotheses
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{hypotheses.length}</div>
                    <p className="text-xs text-gray-500">Research hypotheses defined</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Readings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{readings.length}</div>
                    <p className="text-xs text-gray-500">Sources documented</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Beaker className="h-4 w-4" />
                      Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{results.length}</div>
                    <p className="text-xs text-gray-500">Results collected</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Research Network Visualization</CardTitle>
                  <CardDescription>This visualization shows how your research components connect</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div className="text-center">
                      <Network className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                      <p className="text-sm text-gray-500 mb-2">Interactive research network visualization</p>
                      <p className="text-xs text-gray-400">
                        Shows connections between your hypotheses, readings, and results
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Setup Complete!
                  </CardTitle>
                  <CardDescription>
                    You've successfully set up your research foundation. You can continue adding and editing entries at
                    any time.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>✓ {hypotheses.length} hypotheses documented</p>
                    <p>✓ {readings.length} readings tracked</p>
                    <p>✓ {results.length} results recorded</p>
                    <p>✓ Research network established</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-purple-600 hover:bg-purple-700">
                Complete Setup
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
