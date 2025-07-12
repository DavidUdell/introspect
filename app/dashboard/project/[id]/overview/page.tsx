"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, BrainCircuit, Calendar, CheckCircle, Clock, X } from "lucide-react"
import Link from "next/link"
import { storage, type Project, type Hypothesis, type Reading, type Result } from "@/lib/storage"

export default function ProjectOverviewPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [readings, setReadings] = useState<Reading[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<any[]>([])
  const [reminders, setReminders] = useState<any[]>([])

  useEffect(() => {
    const loadProjectData = () => {
      try {
        const data = storage.loadData()
        if (data) {
          const foundProject = data.projects.find(p => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
            setHypotheses(data.hypotheses.filter(h => h.projectId === projectId))
            setReadings(data.readings.filter(r => r.projectId === projectId))
            setResults(data.results.filter(r => r.projectId === projectId))
            
            // Generate insights for this project
            generateProjectInsights(foundProject, data)
            // Generate reminders for this project
            generateProjectReminders(foundProject, data)
          }
        }
      } catch (err) {
        console.error("Error loading project data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [projectId])

  const generateProjectInsights = (project: Project, data: any) => {
    const projectHypotheses = data.hypotheses.filter((h: Hypothesis) => h.projectId === projectId)
    const projectReadings = data.readings.filter((r: Reading) => r.projectId === projectId)
    const projectResults = data.results.filter((r: Result) => r.projectId === projectId)
    
    const newInsights = []
    let insightId = 1
    
    // Project Foundation Insights
    if (projectHypotheses.length === 0) {
      newInsights.push({
        id: insightId++,
        type: "warning",
        title: "Missing research foundation",
        description: "Your project lacks hypotheses or research questions. This is essential for guiding your research direction and methodology."
      })
    } else if (projectHypotheses.length === 1) {
      newInsights.push({
        id: insightId++,
        type: "info",
        title: "Single hypothesis detected",
        description: "You have one hypothesis. Consider developing additional research questions to strengthen your study's scope and validity."
      })
    } else if (projectHypotheses.length >= 3) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Strong hypothesis foundation",
        description: `Excellent! You have ${projectHypotheses.length} well-defined hypotheses. This provides a solid foundation for your research.`
      })
    }

    // Literature Review Insights
    if (projectReadings.length === 0) {
      newInsights.push({
        id: insightId++,
        type: "warning",
        title: "Literature review needed",
        description: "No readings have been added yet. A comprehensive literature review is crucial for understanding existing research and identifying gaps."
      })
    } else if (projectReadings.length < 5) {
      newInsights.push({
        id: insightId++,
        type: "info",
        title: "Literature review in progress",
        description: `You have ${projectReadings.length} reading(s). Aim for 10-20 quality sources for a comprehensive literature review.`
      })
    } else if (projectReadings.length >= 10) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Comprehensive literature review",
        description: `Impressive! You have ${projectReadings.length} readings. This suggests a thorough understanding of existing research.`
      })
    }

    // Research Progress Insights
    if (projectResults.length === 0 && projectReadings.length > 0) {
      newInsights.push({
        id: insightId++,
        type: "info",
        title: "Ready for analysis",
        description: "You have readings but no results yet. Consider analyzing your findings and documenting your research outcomes."
      })
    } else if (projectResults.length > 0) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Research outcomes documented",
        description: `Great progress! You have ${projectResults.length} result(s) documented. This shows active research engagement.`
      })
    }

    // Hypothesis-Result Relationship Insights
    const activeHypotheses = projectHypotheses.filter((h: Hypothesis) => h.status === "active")
    const hypothesesWithoutResults = activeHypotheses.filter((h: Hypothesis) => 
      !projectResults.some((r: Result) => r.relatedHypotheses.includes(h.id))
    )
    
    // Note: Removed "Untested hypotheses" insight since there's already a reminder for this

    // Research Balance Insights
    const hypothesisToReadingRatio = projectReadings.length > 0 ? projectHypotheses.length / projectReadings.length : 0
    if (hypothesisToReadingRatio > 0.5 && projectReadings.length < 10) {
      newInsights.push({
        id: insightId++,
        type: "info",
        title: "Consider more literature",
        description: "Your hypothesis-to-reading ratio suggests you might benefit from additional literature review to better support your research questions."
      })
    }

    // Stale Readings Insight
    const currentYear = new Date().getFullYear()
    const oldReadings = projectReadings.filter((r: Reading) => r.year < currentYear - 2)
    if (oldReadings.length > 0 && projectReadings.length >= 3) {
      newInsights.push({
        id: insightId++,
        type: "warning",
        title: "Consider updating literature review",
        description: `${oldReadings.length} reading(s) are more than 2 years old. Consider adding recent sources to ensure your research reflects current developments.`
      })
    }

    // Inconclusive Results Insight
    const inconclusiveResults = projectResults.filter((r: Result) => r.status === "inconclusive" || r.confidence === "low")
    if (inconclusiveResults.length > 0) {
      newInsights.push({
        id: insightId++,
        type: "warning",
        title: "Results need further analysis",
        description: `${inconclusiveResults.length} result(s) are inconclusive or have low confidence. Consider gathering more data or refining your analysis.`
      })
    }

    // Project Completion Milestone
    if (projectHypotheses.length >= 3 && projectReadings.length >= 10 && projectResults.length >= 3) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Research project milestone achieved",
        description: "Congratulations! Your project has reached a significant milestone with comprehensive hypotheses, literature review, and documented results."
      })
    }

    // Project Completion Insights
    const totalComponents = projectHypotheses.length + projectReadings.length + projectResults.length
    if (totalComponents >= 15) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Well-structured research project",
        description: `Your project has ${totalComponents} total components, indicating a comprehensive research approach with good depth and breadth.`
      })
    } else if (totalComponents >= 8) {
      newInsights.push({
        id: insightId++,
        type: "info",
        title: "Solid research foundation",
        description: `Your project has ${totalComponents} components. You're building a good foundation - consider expanding in areas that need more attention.`
      })
    }

    // Recent Activity Insights
    const recentDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    const recentActivity = [...projectHypotheses, ...projectReadings, ...projectResults].filter(item => 
      new Date(item.dateAdded || item.dateCreated || Date.now()) > recentDate
    )
    
    if (recentActivity.length === 0 && totalComponents > 0) {
      newInsights.push({
        id: insightId++,
        type: "warning",
        title: "No recent activity",
        description: "No new content has been added in the last week. Consider revisiting your project to maintain momentum."
      })
    } else if (recentActivity.length > 0) {
      newInsights.push({
        id: insightId++,
        type: "success",
        title: "Active research progress",
        description: `Great momentum! ${recentActivity.length} new item(s) added recently. Keep up the excellent work!`
      })
    }

    setInsights(newInsights)
  }

  const generateProjectReminders = (project: Project, data: any) => {
    const projectHypotheses = data.hypotheses.filter((h: Hypothesis) => h.projectId === projectId)
    const projectReadings = data.readings.filter((r: Reading) => r.projectId === projectId)
    const projectResults = data.results.filter((r: Result) => r.projectId === projectId)
    
    const newReminders = []
    let reminderId = 1

    // Generate reminders based on project state
    if (projectHypotheses.length === 0) {
      newReminders.push({
        id: reminderId++,
        title: "Add your first hypothesis",
        description: "Start your research by defining clear hypotheses or research questions",
        priority: "high",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/hypotheses`,
          label: "Add hypotheses"
        }
      })
    } else if (projectHypotheses.length < 3) {
      newReminders.push({
        id: reminderId++,
        title: "Expand your hypotheses",
        description: `You have ${projectHypotheses.length} hypothesis(es). Consider adding more to strengthen your research.`,
        priority: "medium",
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 14 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/hypotheses`,
          label: "Expand hypotheses"
        }
      })
    }

    if (projectReadings.length === 0) {
      newReminders.push({
        id: reminderId++,
        title: "Start your literature review",
        description: "Begin adding relevant readings to support your research",
        priority: "high",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 5 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/readings`,
          label: "Start literature review"
        }
      })
    } else if (projectReadings.length < 5) {
      newReminders.push({
        id: reminderId++,
        title: "Continue literature review",
        description: `You have ${projectReadings.length} reading(s). Aim for at least 5-10 sources for a solid foundation.`,
        priority: "medium",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 10 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/readings`,
          label: "Add more readings"
        }
      })
    }

    // Add reminder for stale readings
    const currentYear = new Date().getFullYear()
    const oldReadings = projectReadings.filter((r: Reading) => r.year < currentYear - 2)
    if (oldReadings.length > 0 && projectReadings.length >= 3) {
      newReminders.push({
        id: reminderId++,
        title: "Update your literature review",
        description: `${oldReadings.length} reading(s) are more than 2 years old. Add recent sources to stay current.`,
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/readings`,
          label: "Add recent readings"
        }
      })
    }

    if (projectResults.length === 0 && projectReadings.length > 0) {
      newReminders.push({
        id: reminderId++,
        title: "Document your findings",
        description: "Start recording results and findings from your research",
        priority: "high",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 3 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/results`,
          label: "Document results"
        }
      })
    }

    // Check for hypotheses that need results
    const activeHypotheses = projectHypotheses.filter((h: Hypothesis) => h.status === "active")
    const hypothesesWithoutResults = activeHypotheses.filter((h: Hypothesis) => 
      !projectResults.some((r: Result) => r.relatedHypotheses.includes(h.id))
    )
    
    if (hypothesesWithoutResults.length > 0) {
      newReminders.push({
        id: reminderId++,
        title: "Test your hypotheses",
        description: `${hypothesesWithoutResults.length} active hypothesis(es) need results or testing`,
        priority: "medium",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/results`,
          label: "Test hypotheses"
        }
      })
    }

    // Add reminder for inconclusive results
    const inconclusiveResults = projectResults.filter((r: Result) => r.status === "inconclusive" || r.confidence === "low")
    if (inconclusiveResults.length > 0) {
      newReminders.push({
        id: reminderId++,
        title: "Refine your results",
        description: `${inconclusiveResults.length} result(s) are inconclusive or have low confidence. Gather more data or improve analysis.`,
        priority: "medium",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 5 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/results`,
          label: "Refine results"
        }
      })
    }

    // Add a general progress reminder if project is well underway
    if (projectHypotheses.length >= 3 && projectReadings.length >= 5 && projectResults.length >= 2) {
      newReminders.push({
        id: reminderId++,
        title: "Review and refine",
        description: "Your project is well underway. Consider reviewing and refining your work",
        priority: "low",
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 21 days from now
        action: {
          type: "navigate",
          link: `/dashboard/project/${projectId}/overview`,
          label: "Review project"
        }
      })
    }

    setReminders(newReminders)
  }

  const handleCompleteReminder = (reminderId: number) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId))
  }

  // Calculate project progress based on actual data
  const calculateProgress = () => {
    const totalItems = hypotheses.length + readings.length + results.length
    if (totalItems === 0) return 0
    
    // Weight different components: hypotheses (30%), readings (40%), results (30%)
    const hypothesisScore = Math.min(hypotheses.length * 10, 30) // Max 30 points
    const readingScore = Math.min(readings.length * 8, 40) // Max 40 points  
    const resultScore = Math.min(results.length * 10, 30) // Max 30 points
    
    return Math.min(Math.round((hypothesisScore + readingScore + resultScore)), 100)
  }

  const progress = calculateProgress()

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

  const projectStats = {
    totalHypotheses: hypotheses.length,
    totalReadings: readings.length,
    totalResults: results.length,
    lastActivity: project.lastUpdated,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Hypotheses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalHypotheses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalReadings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalResults}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Last activity: {projectStats.lastActivity}</CardDescription>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              progress === 0 ? "bg-gray-100 text-gray-600" :
              progress < 30 ? "bg-red-100 text-red-700" :
              progress < 70 ? "bg-amber-100 text-amber-700" :
              "bg-green-100 text-green-700"
            }`}>
              {progress === 0 ? "Not Started" :
               progress < 30 ? "Early Stage" :
               progress < 70 ? "In Progress" :
               "Well Advanced"}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insights Tile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-600" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500">No insights yet. Start adding research data to see insights!</p>
            </div>
          ) : (
            <>
                <div className="space-y-3">
              {insights.map((insight) => (
                    <Card key={insight.id} className="text-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{insight.title}</CardTitle>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              insight.type === "warning"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                : insight.type === "success"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            }`}
                          >
                            {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                          </span>
                      </div>
                        <CardDescription className="text-xs">{insight.description}</CardDescription>
                      </CardHeader>
                      <div className="pb-5"></div>
                    </Card>
                  ))}
                  </div>
            </>
          )}
          </CardContent>
        </Card>

        {/* Reminders Tile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-8">
                <p className="text-sm text-gray-500">No reminders yet. Keep up the good work!</p>
            </div>
          ) : (
            <>
                <div className="space-y-3">
              {reminders.map((reminder) => (
                    <Card key={reminder.id} className="text-sm relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 z-10"
                        onClick={() => handleCompleteReminder(reminder.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <CardHeader className="pb-2 pr-8">
                    <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{reminder.title}</CardTitle>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          reminder.priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            : reminder.priority === "medium"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        }`}
                      >
                        {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                      </span>
                    </div>
                        <CardDescription className="text-xs">{reminder.description}</CardDescription>
                  </CardHeader>
                      <CardFooter className="pt-2 flex-col items-start space-y-2">
                        <div className="flex items-center justify-between w-full">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {reminder.dueDate}
                    </div>
                          {reminder.action && (
                            <Link href={reminder.action.link}>
                    <Button 
                                variant="outline" 
                      size="sm" 
                                className="text-xs"
                    >
                                {reminder.action.label}
                    </Button>
                            </Link>
                          )}
                        </div>
                  </CardFooter>
                </Card>
              ))}
                </div>
            </>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 