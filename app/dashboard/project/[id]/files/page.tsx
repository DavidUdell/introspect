// %%
// Module for the Project Files tab page. Displays and manages project-related files (Google Docs links).

"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { storage, type Project } from "@/lib/storage"

// %%
// Helper to validate Google Docs URLs.
function isValidGoogleDocUrl(url: string): boolean {
  return url.startsWith("https://docs.google.com/document/")
}

// %%
// Main component for the Files tab page.
export default function ProjectFilesPage() {
  // %%
  // State and params setup.
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [newUrl, setNewUrl] = useState("")
  const [error, setError] = useState("")

  // %%
  // Load project on mount.
  useEffect(() => {
    const data = storage.loadData()
    if (data) {
      const found = data.projects.find(p => p.id === projectId)
      setProject(found || null)
    }
    setLoading(false)
  }, [projectId])

  // %%
  // Add a new Google Doc link.
  function handleAddFile(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!isValidGoogleDocUrl(newUrl)) {
      setError("Please enter a valid Google Docs link.")
      return
    }
    if (!project) return
    const updatedFiles = [...(project.files || []), { url: newUrl }]
    updateProjectFiles(updatedFiles)
    setNewUrl("")
  }

  // %%
  // Remove a file by index.
  function handleRemoveFile(idx: number) {
    if (!project || !project.files) return
    const updatedFiles = project.files.filter((_, i) => i !== idx)
    updateProjectFiles(updatedFiles)
  }

  // %%
  // Update project files in storage and state.
  function updateProjectFiles(files: { url: string }[]) {
    const data = storage.loadData()
    if (!data) return
    const updatedProjects = data.projects.map(p =>
      p.id === projectId ? { ...p, files } : p
    )
    storage.saveData({ ...data, projects: updatedProjects })
    setProject(p => (p ? { ...p, files } : p))
  }

  // %%
  // Render loading, empty, and list states.
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading…</div>
  }
  if (!project) {
    return <div className="p-8 text-center text-gray-500">Project not found.</div>
  }
  const files = project.files || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Files</h1>
        </div>
      </div>
      <div className="max-w-xl mx-auto p-8">
        {/* Add file form */}
        <form onSubmit={handleAddFile} className="flex gap-2 mb-6">
          <input
            type="url"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Paste Google Docs link"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Google Doc
          </button>
        </form>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {/* Files list */}
        {files.length === 0 ? (
          <div className="text-center text-gray-500">No files yet.</div>
        ) : (
          <ul className="space-y-4">
            {files.map((file, idx) => (
              <li key={idx} className="flex items-center gap-3 border rounded px-3 py-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline break-all flex-1"
                >
                  {file.url}
                </a>
                <button
                  onClick={() => handleRemoveFile(idx)}
                  className="text-red-500 hover:text-red-700 px-2 py-1"
                  title="Remove"
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
} 