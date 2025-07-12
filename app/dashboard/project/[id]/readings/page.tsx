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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, BookOpen, FileText, LinkIcon, Search, Tag } from "lucide-react"
import Link from "next/link"
import { storage, type Project, type Reading, type Hypothesis } from "@/lib/storage"

export default function ProjectReadingsPage() {
  const params = useParams()
  const projectId = Number(params.id)
  const [project, setProject] = useState<Project | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([])
  const [newReading, setNewReading] = useState({
    title: "",
    authors: "",
    source: "",
    year: new Date().getFullYear().toString(),
    type: "journal",
    tags: "",
    notes: "",
    relatedHypotheses: [],
  })
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  // Load data on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = storage.loadData()
        if (savedData) {
          const foundProject = savedData.projects.find(p => p.id === projectId)
          if (foundProject) {
            setProject(foundProject)
            const projectHypotheses = savedData.hypotheses.filter(h => h.projectId === projectId)
            setHypotheses(projectHypotheses)
            // Get readings for this project
            const projectReadings = savedData.readings.filter(r => r.projectId === projectId)
            setReadings(projectReadings)
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

  const handleCreateReading = () => {
    if (newReading.title.trim() === "") return

    const reading: Reading = {
      id: Math.max(...readings.map(r => r.id), 0) + 1,
      title: newReading.title,
      authors: newReading.authors,
      source: newReading.source,
      year: Number.parseInt(newReading.year),
      type: newReading.type as "journal" | "book" | "conference" | "website" | "other",
      tags: newReading.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      notes: newReading.notes,
      projectId: projectId,
      relatedHypotheses: newReading.relatedHypotheses,
      dateAdded: new Date().toISOString().split("T")[0],
    }

    const updatedReadings = [...readings, reading]
    setReadings(updatedReadings)
    
    // Save to storage
    const savedData = storage.loadData()
    if (savedData) {
      storage.saveData({
        ...savedData,
        readings: [...savedData.readings, reading]
      })
    }
    
    setNewReading({
      title: "",
      authors: "",
      source: "",
      year: new Date().getFullYear().toString(),
      type: "journal",
      tags: "",
      notes: "",
      relatedHypotheses: [],
    })
    setOpen(false)
  }

  const handleViewDetails = (reading: Reading) => {
    setSelectedReading(reading)
    setDetailsOpen(true)
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

  const filteredReadings = activeTab === "all" ? readings : readings.filter((reading) => reading.type === activeTab)

  const filteredAndSortedReadings = filteredReadings
    .filter(reading => 
      reading.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reading.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        case "oldest":
          return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Readings</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Reading
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Reading</DialogTitle>
              <DialogDescription>Track your research sources and take notes.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReading.title}
                  onChange={(e) => setNewReading({ ...newReading, title: e.target.value })}
                  placeholder="Enter title of paper, book, or resource"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="authors">Authors</Label>
                <Input
                  id="authors"
                  value={newReading.authors}
                  onChange={(e) => setNewReading({ ...newReading, authors: e.target.value })}
                  placeholder="Author names (e.g., Smith, J., & Jones, K.)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={newReading.source}
                    onChange={(e) => setNewReading({ ...newReading, source: e.target.value })}
                    placeholder="Journal name or URL"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={newReading.year}
                    onChange={(e) => setNewReading({ ...newReading, year: e.target.value })}
                    placeholder="Publication year"
                    type="number"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(value: string) => setNewReading({ ...newReading, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">Journal Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="conference">Conference Paper</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={newReading.tags}
                  onChange={(e) => setNewReading({ ...newReading, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
                <p className="text-xs text-gray-500">Separate tags with commas</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newReading.notes}
                  onChange={(e) => setNewReading({ ...newReading, notes: e.target.value })}
                  placeholder="Your notes and key takeaways"
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReading}>Add Reading</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search readings..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="journal">Journal Articles</TabsTrigger>
          <TabsTrigger value="book">Books</TabsTrigger>
          <TabsTrigger value="website">Websites</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          <div className="space-y-4">
            {filteredAndSortedReadings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-lg text-gray-500">No readings yet. Add your first reading to get started!</p>
              </div>
            ) : (
              filteredAndSortedReadings.map((reading) => (
                <Card key={reading.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{reading.title}</CardTitle>
                        <CardDescription>
                          {reading.authors} • {reading.year} • {reading.source}
                        </CardDescription>
                      </div>
                      <div className="flex items-center">
                        {reading.type === "journal" && <BookOpen className="h-4 w-4 text-blue-500" />}
                        {reading.type === "book" && <FileText className="h-4 w-4 text-purple-500" />}
                        {reading.type === "website" && <LinkIcon className="h-4 w-4 text-green-500" />}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{reading.notes}</p>
                    <div className="flex flex-wrap gap-2">
                      {reading.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                        >
                          <Tag className="h-3 w-3 mr-1 text-gray-500" />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between text-xs text-gray-500">
                    <span>Added: {reading.dateAdded}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewDetails(reading)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Reading Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReading?.title}</DialogTitle>
            <DialogDescription>
              {selectedReading?.authors} • {selectedReading?.year} • {selectedReading?.source}
            </DialogDescription>
          </DialogHeader>
          {selectedReading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {selectedReading.type}
                </div>
                <div>
                  <span className="font-medium">Added:</span> {selectedReading.dateAdded}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Notes:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {selectedReading.notes || "No notes added."}
                </p>
              </div>
              
              {selectedReading.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReading.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full"
                      >
                        <Tag className="h-3 w-3 mr-1 text-gray-500" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedReading.relatedHypotheses.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Related Hypotheses:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedReading.relatedHypotheses.map((id) => (
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