/**
 * React hook for managing application data with persistent storage.
 * Provides CRUD operations for projects, hypotheses, readings, and results.
 */

import { useState, useEffect, useCallback } from "react"
import { storage, type UserData, type Project, type Hypothesis, type Reading, type Result } from "@/lib/storage"

export function useData() {
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = storage.loadData()
        if (savedData) {
          setData(savedData)
        } else {
          // Initialize with default data
          const defaultData = storage.getDefaultData()
          setData(defaultData)
          storage.saveData(defaultData)
        }
      } catch (err) {
        setError("Failed to load data")
        console.error("Error loading data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save data whenever it changes
  useEffect(() => {
    if (data && !loading) {
      try {
        storage.saveData(data)
      } catch (err) {
        setError("Failed to save data")
        console.error("Error saving data:", err)
      }
    }
  }, [data, loading])

  // Project operations
  const addProject = useCallback((project: Omit<Project, "id" | "createdAt">) => {
    if (!data) return

    const newProject: Project = {
      ...project,
      id: Math.max(...data.projects.map((p: Project) => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }

    setData({
      ...data,
      projects: [...data.projects, newProject],
    })
  }, [data])

  const updateProject = useCallback((id: number, updates: Partial<Project>) => {
    if (!data) return

    setData({
      ...data,
      projects: data.projects.map((project: Project) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    })
  }, [data])

  const deleteProject = useCallback((id: number) => {
    if (!data) return

    setData({
      ...data,
      projects: data.projects.filter((project: Project) => project.id !== id),
      // Also remove related hypotheses, readings, and results
      hypotheses: data.hypotheses.filter((hypothesis: Hypothesis) => hypothesis.projectId !== id),
      readings: data.readings.filter((reading: Reading) => 
        !reading.relatedHypotheses.some((hypId: number) => 
          data.hypotheses.find((h: Hypothesis) => h.id === hypId)?.projectId === id
        )
      ),
      results: data.results.filter((result: Result) => result.projectId !== id),
    })
  }, [data])

  // Hypothesis operations
  const addHypothesis = useCallback((hypothesis: Omit<Hypothesis, "id" | "createdAt">) => {
    if (!data) return

    const newHypothesis: Hypothesis = {
      ...hypothesis,
      id: Math.max(...data.hypotheses.map((h: Hypothesis) => h.id), 0) + 1,
      createdAt: new Date().toISOString(),
    }

    setData({
      ...data,
      hypotheses: [...data.hypotheses, newHypothesis],
    })
  }, [data])

  const updateHypothesis = useCallback((id: number, updates: Partial<Hypothesis>) => {
    if (!data) return

    setData({
      ...data,
      hypotheses: data.hypotheses.map((hypothesis: Hypothesis) =>
        hypothesis.id === id ? { ...hypothesis, ...updates } : hypothesis
      ),
    })
  }, [data])

  const deleteHypothesis = useCallback((id: number) => {
    if (!data) return

    setData({
      ...data,
      hypotheses: data.hypotheses.filter((hypothesis: Hypothesis) => hypothesis.id !== id),
      // Remove references from readings and results
      readings: data.readings.map((reading: Reading) => ({
        ...reading,
        relatedHypotheses: reading.relatedHypotheses.filter((hypId: number) => hypId !== id),
      })),
      results: data.results.map((result: Result) => ({
        ...result,
        relatedHypotheses: result.relatedHypotheses.filter((hypId: number) => hypId !== id),
      })),
    })
  }, [data])

  // Reading operations
  const addReading = useCallback((reading: Omit<Reading, "id" | "dateAdded">) => {
    if (!data) return

    const newReading: Reading = {
      ...reading,
      id: Math.max(...data.readings.map((r: Reading) => r.id), 0) + 1,
      dateAdded: new Date().toISOString(),
    }

    setData({
      ...data,
      readings: [...data.readings, newReading],
    })
  }, [data])

  const updateReading = useCallback((id: number, updates: Partial<Reading>) => {
    if (!data) return

    setData({
      ...data,
      readings: data.readings.map((reading: Reading) =>
        reading.id === id ? { ...reading, ...updates } : reading
      ),
    })
  }, [data])

  const deleteReading = useCallback((id: number) => {
    if (!data) return

    setData({
      ...data,
      readings: data.readings.filter((reading: Reading) => reading.id !== id),
    })
  }, [data])

  // Result operations
  const addResult = useCallback((result: Omit<Result, "id" | "date">) => {
    if (!data) return

    const newResult: Result = {
      ...result,
      id: Math.max(...data.results.map((r: Result) => r.id), 0) + 1,
      date: new Date().toISOString(),
    }

    setData({
      ...data,
      results: [...data.results, newResult],
    })
  }, [data])

  const updateResult = useCallback((id: number, updates: Partial<Result>) => {
    if (!data) return

    setData({
      ...data,
      results: data.results.map((result: Result) =>
        result.id === id ? { ...result, ...updates } : result
      ),
    })
  }, [data])

  const deleteResult = useCallback((id: number) => {
    if (!data) return

    setData({
      ...data,
      results: data.results.filter((result: Result) => result.id !== id),
    })
  }, [data])

  // Utility functions
  const clearAllData = useCallback(() => {
    storage.clearData()
    const defaultData = storage.getDefaultData()
    setData(defaultData)
    storage.saveData(defaultData)
  }, [])

  const exportData = useCallback(() => {
    return storage.exportData()
  }, [])

  const importData = useCallback((jsonString: string) => {
    const success = storage.importData(jsonString)
    if (success) {
      const importedData = storage.loadData()
      if (importedData) {
        setData(importedData)
      }
    }
    return success
  }, [])

  // Reminder operations
  const dismissReminder = useCallback((reminderId: string) => {
    if (!data) return

    if (!data.dismissedReminders.includes(reminderId)) {
      setData({
        ...data,
        dismissedReminders: [...data.dismissedReminders, reminderId],
      })
    }
  }, [data])

  const isReminderDismissed = useCallback((reminderId: string) => {
    if (!data) return false
    return data.dismissedReminders.includes(reminderId)
  }, [data])

  // Get related data
  const getProjectHypotheses = useCallback((projectId: number) => {
    return data?.hypotheses.filter((h: Hypothesis) => h.projectId === projectId) || []
  }, [data])

  const getProjectResults = useCallback((projectId: number) => {
    return data?.results.filter((r: Result) => r.projectId === projectId) || []
  }, [data])

  const getHypothesisReadings = useCallback((hypothesisId: number) => {
    return data?.readings.filter((r: Reading) => r.relatedHypotheses.includes(hypothesisId)) || []
  }, [data])

  const getHypothesisResults = useCallback((hypothesisId: number) => {
    return data?.results.filter((r: Result) => r.relatedHypotheses.includes(hypothesisId)) || []
  }, [data])

  return {
    // Data
    data,
    loading,
    error,
    
    // Project operations
    addProject,
    updateProject,
    deleteProject,
    
    // Hypothesis operations
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    
    // Reading operations
    addReading,
    updateReading,
    deleteReading,
    
    // Result operations
    addResult,
    updateResult,
    deleteResult,
    
    // Reminder operations
    dismissReminder,
    isReminderDismissed,
    
    // Utility operations
    clearAllData,
    exportData,
    importData,
    
    // Related data getters
    getProjectHypotheses,
    getProjectResults,
    getHypothesisReadings,
    getHypothesisResults,
  }
} 