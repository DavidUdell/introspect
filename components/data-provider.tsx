"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { storage, type UserData, type Project, type Hypothesis, type Reading, type Result } from "@/lib/storage"

interface DataContextType {
  data: UserData | null
  loading: boolean
  error: string | null
  
  // Project operations
  addProject: (project: Omit<Project, "id" | "createdAt">) => void
  updateProject: (id: number, updates: Partial<Project>) => void
  deleteProject: (id: number) => void
  
  // Hypothesis operations
  addHypothesis: (hypothesis: Omit<Hypothesis, "id" | "createdAt">) => void
  updateHypothesis: (id: number, updates: Partial<Hypothesis>) => void
  deleteHypothesis: (id: number) => void
  
  // Reading operations
  addReading: (reading: Omit<Reading, "id" | "dateAdded">) => void
  updateReading: (id: number, updates: Partial<Reading>) => void
  deleteReading: (id: number) => void
  
  // Result operations
  addResult: (result: Omit<Result, "id" | "date">) => void
  updateResult: (id: number, updates: Partial<Result>) => void
  deleteResult: (id: number) => void
  
  // Reminder operations
  dismissReminder: (reminderId: string) => void
  isReminderDismissed: (reminderId: string) => boolean
  
  // Utility operations
  clearAllData: () => void
  exportData: () => string
  importData: (jsonString: string) => boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
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
  const addProject = (project: Omit<Project, "id" | "createdAt">) => {
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
  }

  const updateProject = (id: number, updates: Partial<Project>) => {
    if (!data) return

    setData({
      ...data,
      projects: data.projects.map((project: Project) =>
        project.id === id ? { ...project, ...updates } : project
      ),
    })
  }

  const deleteProject = (id: number) => {
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
  }

  // Hypothesis operations
  const addHypothesis = (hypothesis: Omit<Hypothesis, "id" | "createdAt">) => {
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
  }

  const updateHypothesis = (id: number, updates: Partial<Hypothesis>) => {
    if (!data) return

    setData({
      ...data,
      hypotheses: data.hypotheses.map((hypothesis: Hypothesis) =>
        hypothesis.id === id ? { ...hypothesis, ...updates } : hypothesis
      ),
    })
  }

  const deleteHypothesis = (id: number) => {
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
  }

  // Reading operations
  const addReading = (reading: Omit<Reading, "id" | "dateAdded">) => {
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
  }

  const updateReading = (id: number, updates: Partial<Reading>) => {
    if (!data) return

    setData({
      ...data,
      readings: data.readings.map((reading: Reading) =>
        reading.id === id ? { ...reading, ...updates } : reading
      ),
    })
  }

  const deleteReading = (id: number) => {
    if (!data) return

    setData({
      ...data,
      readings: data.readings.filter((reading: Reading) => reading.id !== id),
    })
  }

  // Result operations
  const addResult = (result: Omit<Result, "id" | "date">) => {
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
  }

  const updateResult = (id: number, updates: Partial<Result>) => {
    if (!data) return

    setData({
      ...data,
      results: data.results.map((result: Result) =>
        result.id === id ? { ...result, ...updates } : result
      ),
    })
  }

  const deleteResult = (id: number) => {
    if (!data) return

    setData({
      ...data,
      results: data.results.filter((result: Result) => result.id !== id),
    })
  }

  // Utility functions
  const clearAllData = () => {
    storage.clearData()
    const defaultData = storage.getDefaultData()
    setData(defaultData)
    storage.saveData(defaultData)
  }

  const exportData = () => {
    return storage.exportData()
  }

  const importData = (jsonString: string) => {
    const success = storage.importData(jsonString)
    if (success) {
      const importedData = storage.loadData()
      if (importedData) {
        setData(importedData)
      }
    }
    return success
  }

  // Reminder operations
  const dismissReminder = (reminderId: string) => {
    if (!data) return

    if (!data.dismissedReminders.includes(reminderId)) {
      setData({
        ...data,
        dismissedReminders: [...data.dismissedReminders, reminderId],
      })
    }
  }

  const isReminderDismissed = (reminderId: string) => {
    if (!data) return false
    return data.dismissedReminders.includes(reminderId)
  }

  const value: DataContextType = {
    data,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    addReading,
    updateReading,
    deleteReading,
    addResult,
    updateResult,
    deleteResult,
    dismissReminder,
    isReminderDismissed,
    clearAllData,
    exportData,
    importData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
} 