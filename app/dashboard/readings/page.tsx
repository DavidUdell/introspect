"use client"

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
import { useState } from "react"
import { Plus, BookOpen, FileText, LinkIcon, Search, Tag } from "lucide-react"

// Sample reading data
const initialReadings = [
  {
    id: 1,
    title: "Climate Change Effects on Marine Biodiversity: A Systematic Review",
    authors: "Johnson, M., Smith, A., & Williams, R.",
    source: "Journal of Marine Biology",
    year: 2022,
    type: "journal",
    tags: ["climate change", "marine biology", "biodiversity"],
    notes:
      "Comprehensive review of 50+ studies showing correlation between temperature rise and species decline. Key finding: 1°C increase leads to approximately 10% biodiversity loss in sensitive reef ecosystems.",
    relatedHypotheses: [1, 2],
    dateAdded: "2023-09-15",
  },
  {
    id: 2,
    title: "Neural Networks in Early Disease Detection: A Review",
    authors: "Chen, L., & Garcia, P.",
    source: "AI in Medicine",
    year: 2021,
    type: "journal",
    tags: ["machine learning", "neural networks", "medical diagnosis"],
    notes:
      "Explores various neural network architectures for medical imaging analysis. Convolutional networks showed best performance for cardiovascular imaging.",
    relatedHypotheses: [3],
    dateAdded: "2023-08-22",
  },
  {
    id: 3,
    title: "Ocean Warming and Coral Bleaching: New Evidence",
    authors: "Coral Reef Alliance",
    source: "https://coral.org/research/warming",
    year: 2023,
    type: "website",
    tags: ["coral reefs", "ocean warming", "bleaching events"],
    notes:
      "Latest data on bleaching events worldwide. Interactive maps showing correlation between temperature anomalies and bleaching severity.",
    relatedHypotheses: [1],
    dateAdded: "2023-10-05",
  },
]

export default function ReadingsPage() {
  const [readings, setReadings] = useState(initialReadings)
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

  const handleCreateReading = () => {
    if (newReading.title.trim() === "") return

    const reading = {
      id: readings.length + 1,
      title: newReading.title,
      authors: newReading.authors,
      source: newReading.source,
      year: Number.parseInt(newReading.year),
      type: newReading.type,
      tags: newReading.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      notes: newReading.notes,
      relatedHypotheses: [],
      dateAdded: new Date().toISOString().split("T")[0],
    }

    setReadings([...readings, reading])
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

  const filteredReadings = activeTab === "all" ? readings : readings.filter((reading) => reading.type === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Research Readings</h1>
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
                <Select defaultValue="journal" onValueChange={(value) => setNewReading({ ...newReading, type: value })}>
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
          <Input placeholder="Search readings..." className="pl-9" />
        </div>
        <Select defaultValue="newest">
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
            {filteredReadings.map((reading) => (
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
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
