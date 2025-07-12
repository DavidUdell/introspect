"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft, BrainCircuit, Calendar, CheckCircle, Clock, RefreshCw } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("insights")
  const [isRefreshing, setIsRefreshing] = useState(false)
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
    
    // Check if project has hypotheses
    if (projectHypotheses.length === 0) {
      newInsights.push({
        id: 1,
        type: "warning",
        title: "No Hypotheses Yet",
        description: "This project doesn't have any hypotheses. Consider adding research questions to get started.",
        date: new Date().toLocaleDateString()
      })
    }

    // Check for active hypotheses without results
    const activeHypotheses = projectHypotheses.filter((h: Hypothesis) => h.status === "active")
    const hypothesesWithoutResults = activeHypotheses.filter((h: Hypothesis) => 
      !projectResults.some((r: Result) => r.relatedHypotheses.includes(h.id))
    )
    
    if (hypothesesWithoutResults.length > 0) {
      newInsights.push({
        id: 2,
        type: "info",
        title: "Active Hypotheses Need Testing",
        description: `${hypothesesWithoutResults.length} active hypothesis(es) don't have associated results yet.`,
        date: new Date().toLocaleDateString()
      })
    }

    // Check for recent activity
    if (projectReadings.length > 0 || projectResults.length > 0) {
      newInsights.push({
        id: 3,
        type: "success",
        title: "Project Progress",
        description: `This project has ${projectReadings.length} readings and ${projectResults.length} results.`,
        date: new Date().toLocaleDateString()
      })
    }

    setInsights(newInsights)
  }

  const handleRefreshInsights = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    try {
      const data = storage.loadData()
      if (data && project) {
        generateProjectInsights(project, data)
      }
    } catch (err) {
      console.error("Error refreshing insights:", err)
    }
    
    setIsRefreshing(false)
  }

  const handleViewAllInsights = () => {
    // For now, just log - could navigate to a dedicated insights page
    console.log("View all project insights clicked")
  }

  const handleViewAllReminders = () => {
    // For now, just log - could navigate to a dedicated reminders page
    console.log("View all project reminders clicked")
  }

  const handleCompleteReminder = (reminderId: number) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId))
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
        <Button 
          variant="outline"
          onClick={handleRefreshInsights}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Insights"}
        </Button>
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
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Last activity: {projectStats.lastActivity}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
            <div className="h-[150px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
              <div className="text-center">
                <BrainCircuit className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Project insights visualization</p>
                <p className="text-xs text-gray-400">(Connections between hypotheses, readings, and results)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
        <TabsContent value="insights" className="mt-6 space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">No insights yet. Start adding research data to see insights!</p>
            </div>
          ) : (
            <>
              {insights.map((insight) => (
                <Alert
                  key={insight.id}
                  variant={insight.type === "warning" ? "destructive" : insight.type === "success" ? "default" : undefined}
                >
                  <div className="flex items-start">
                    {insight.type === "warning" && <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />}
                    {insight.type === "success" && <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500" />}
                    {insight.type === "info" && <BrainCircuit className="h-4 w-4 mr-2 mt-0.5 text-purple-500" />}
                    <div>
                      <AlertTitle className="mb-1">{insight.title}</AlertTitle>
                      <AlertDescription className="text-sm">{insight.description}</AlertDescription>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {insight.date}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewAllInsights}
              >
                View All Insights
              </Button>
            </>
          )}
        </TabsContent>
        <TabsContent value="reminders" className="mt-6 space-y-4">
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-500">No reminders yet. Keep up the good work!</p>
            </div>
          ) : (
            <>
              {reminders.map((reminder) => (
                <Card key={reminder.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{reminder.title}</CardTitle>
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
                    <CardDescription>{reminder.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due: {reminder.dueDate}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => handleCompleteReminder(reminder.id)}
                    >
                      Complete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleViewAllReminders}
              >
                View All Reminders
              </Button>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 