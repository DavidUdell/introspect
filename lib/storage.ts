/**
 * Client-side storage utilities for the Introspect research app.
 * Provides localStorage and cookie-based persistence with fallbacks.
 */

// Data types
export interface Project {
  id: number
  title: string
  description: string
  lastUpdated: string
  progress: number
  createdAt: string
  files?: { url: string }[]
}

export interface Hypothesis {
  id: number
  projectId: number
  statement: string
  assumptions: string[]
  status: "draft" | "active" | "testing" | "confirmed" | "rejected"
  createdAt: string
}

export interface Reading {
  id: number
  title: string
  authors: string
  source: string
  year: number
  type: string
  tags: string[]
  notes: string
  projectId: number
  relatedHypotheses: number[]
  dateAdded: string
}

export interface Result {
  id: number
  title: string
  description: string
  date: string
  projectId: number
  relatedHypotheses: number[]
  findings: string
  conclusion: string
  status: "supports" | "partially_supports" | "contradicts" | "inconclusive"
  confidence: "low" | "medium" | "high"
}

export interface UserData {
  projects: Project[]
  hypotheses: Hypothesis[]
  readings: Reading[]
  results: Result[]
  dismissedReminders: string[] // Array of reminder identifiers that have been dismissed
  lastSync?: string
}

class StorageManager {
  private readonly STORAGE_KEY = "introspect-data"
  private readonly COOKIE_KEY = "introspect-data"
  private readonly COOKIE_EXPIRY_DAYS = 30

  // Check if localStorage is available
  private isLocalStorageAvailable(): boolean {
    try {
      const test = "__localStorage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // Set a cookie
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`
  }

  // Get a cookie
  private getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      }
    }
    return null
  }

  // Save data with fallback
  saveData(data: UserData): boolean {
    const dataString = JSON.stringify({
      ...data,
      lastSync: new Date().toISOString(),
    })

    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem(this.STORAGE_KEY, dataString)
        return true
      }
    } catch (error) {
      console.warn("localStorage failed, falling back to cookies:", error)
    }

    // Fallback to cookies
    try {
      this.setCookie(this.COOKIE_KEY, dataString, this.COOKIE_EXPIRY_DAYS)
      return true
    } catch (error) {
      console.error("Failed to save data to cookies:", error)
      return false
    }
  }

  // Load data with fallback
  loadData(): UserData | null {
    let dataString: string | null = null

    // Try localStorage first
    try {
      if (this.isLocalStorageAvailable()) {
        dataString = localStorage.getItem(this.STORAGE_KEY)
      }
    } catch (error) {
      console.warn("localStorage failed, trying cookies:", error)
    }

    // Fallback to cookies
    if (!dataString) {
      try {
        dataString = this.getCookie(this.COOKIE_KEY)
      } catch (error) {
        console.error("Failed to load data from cookies:", error)
      }
    }

    if (!dataString) {
      return null
    }

    try {
      const parsed = JSON.parse(dataString)
      
      // Handle migration: add dismissedReminders field if it doesn't exist
      if (!parsed.dismissedReminders) {
        parsed.dismissedReminders = []
      }
      
      return parsed as UserData
    } catch (error) {
      console.error("Failed to parse stored data:", error)
      return null
    }
  }

  // Clear all data
  clearData(): void {
    try {
      if (this.isLocalStorageAvailable()) {
        localStorage.removeItem(this.STORAGE_KEY)
      }
    } catch (error) {
      console.warn("Failed to clear localStorage:", error)
    }

    try {
      this.setCookie(this.COOKIE_KEY, "", -1) // Expire immediately
    } catch (error) {
      console.warn("Failed to clear cookies:", error)
    }
  }

  // Get default data structure
  getDefaultData(): UserData {
    return {
      projects: [],
      hypotheses: [],
      readings: [],
      results: [],
      dismissedReminders: [],
    }
  }

  // Export data as JSON
  exportData(): string {
    const data = this.loadData()
    return JSON.stringify(data, null, 2)
  }

  // Import data from JSON
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString)
      return this.saveData(parsed as UserData)
    } catch (error) {
      console.error("Failed to import data:", error)
      return false
    }
  }

  // Dismiss a reminder
  dismissReminder(reminderId: string): boolean {
    const data = this.loadData()
    if (!data) return false

    if (!data.dismissedReminders.includes(reminderId)) {
      data.dismissedReminders.push(reminderId)
      return this.saveData(data)
    }
    return true
  }

  // Check if a reminder is dismissed
  isReminderDismissed(reminderId: string): boolean {
    const data = this.loadData()
    if (!data) return false
    return data.dismissedReminders.includes(reminderId)
  }

  // Get all dismissed reminder IDs
  getDismissedReminders(): string[] {
    const data = this.loadData()
    if (!data) return []
    return data.dismissedReminders
  }
}

// Create singleton instance
export const storage = new StorageManager() 