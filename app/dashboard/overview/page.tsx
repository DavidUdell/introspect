"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react"
import { AlertCircle, ArrowRight, BrainCircuit, Calendar, CheckCircle, Clock, RefreshCw } from "lucide-react"

export default function OverviewPage() {
  const [activeTab, setActiveTab] = useState("insights")

  // Sample data for visualization
  const projectStats = {
    totalProjects: 0,
    activeHypotheses: 0,
    readings: 0,
    results: 0,
    lastActivity: "No activity yet",
  }

  const insights: any[] = []

  const reminders: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Overview</h1>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Hypotheses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.activeHypotheses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Readings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.readings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.results}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Progress</CardTitle>
          <CardDescription>Last activity: {projectStats.lastActivity}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
            <div className="text-center">
              <BrainCircuit className="h-10 w-10 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Research progress visualization would appear here</p>
              <p className="text-xs text-gray-400">(Connections between hypotheses, readings, and results)</p>
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
              <Button variant="outline" className="w-full">
                View All Insights
                <ArrowRight className="ml-2 h-4 w-4" />
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
            reminders.map((reminder) => (
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
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Complete
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
          <Button variant="outline" className="w-full">
            View All Reminders
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
