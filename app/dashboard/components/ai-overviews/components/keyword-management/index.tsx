'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Search, Trash2 } from "lucide-react"
import AiButton from "../../../../../components/animata/button/ai-button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import type { Keyword } from "../../types"

interface KeywordManagementProps {
  companyId: number
  accountId: string
  isSuperAdmin: boolean
  selectedProductId: number | null
}

export function KeywordManagement({ companyId, accountId, isSuperAdmin, selectedProductId }: KeywordManagementProps) {
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTerm, setNewTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set())

  // Fetch terms on component mount
  useEffect(() => {
    fetchTerms()
  }, [companyId, accountId, isSuperAdmin, selectedProductId])

  const fetchTerms = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching terms with params:', { companyId, accountId, isSuperAdmin, selectedProductId })
      const response = await fetch(`/api/ai-overview-terms?companyId=${companyId}&accountId=${accountId}&isSuperAdmin=${isSuperAdmin}${selectedProductId ? `&productId=${selectedProductId}` : ''}`)
      console.log('Response status:', response.status)
      if (!response.ok) throw new Error('Failed to fetch terms')
      const data = await response.json()
      console.log('Fetched data:', data)
      setKeywords(data)
    } catch (error) {
      console.error('Error fetching terms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTerm = async () => {
    if (!newTerm.trim()) return

    try {
      setIsLoading(true)
      const response = await fetch('/api/ai-overview-terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm.trim(),
          companyId,
          accountId,
          isSuperAdmin,
          productId: selectedProductId
        })
      })

      if (!response.ok) throw new Error('Failed to add term')
      
      const newKeyword = await response.json()
      setKeywords([newKeyword, ...keywords])
      setNewTerm("")
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error adding term:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ai-overview-terms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: newStatus
        })
      })

      if (!response.ok) throw new Error('Failed to update term')
      
      const updatedTerm = await response.json()
      setKeywords(keywords.map(k => k.id === id ? updatedTerm : k))
    } catch (error) {
      console.error('Error updating term:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFindTerms = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ai-overview-terms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          accountId,
          productId: selectedProductId
        })
      })

      if (!response.ok) throw new Error('Failed to generate terms')
      
      await fetchTerms() // Refresh the terms list after generation
    } catch (error) {
      console.error('Error generating terms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredKeywords = keywords.filter(keyword => {
    const matchesSearch = keyword.term.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSource = sourceFilter === "all" || keyword.source === sourceFilter
    const matchesStatus = statusFilter === "all" || keyword.status === statusFilter
    return matchesSearch && matchesSource && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTerms(new Set(filteredKeywords.map(k => k.id)))
    } else {
      setSelectedTerms(new Set())
    }
  }

  const handleSelectTerm = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTerms)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedTerms(newSelected)
  }

  const handleDeleteSelected = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/ai-overview-terms', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedTerms)
        })
      })

      if (!response.ok) throw new Error('Failed to delete terms')
      
      // Remove deleted terms from the state
      setKeywords(keywords.filter(k => !selectedTerms.has(k.id)))
      setSelectedTerms(new Set())
    } catch (error) {
      console.error('Error deleting terms:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Terms Management</h3>
          <div className="flex items-center space-x-2">
            {selectedTerms.size > 0 && (
              <Button 
                onClick={handleDeleteSelected} 
                disabled={isLoading}
                variant="destructive"
                type="button"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedTerms.size})
              </Button>
            )}
            <AiButton 
              onClick={handleFindTerms} 
              disabled={isLoading}
            >
              Magic Keyword Generator
            </AiButton>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Keyword
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Term</DialogTitle>
                  <DialogDescription>
                    Enter a new term to track in AI Overviews
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="Enter term..."
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTerm} disabled={isLoading}>
                    Add Keyword
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              disabled={isLoading}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter} disabled={isLoading}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="ai">AI Generated</SelectItem>
              <SelectItem value="moz">MOZ</SelectItem>
              <SelectItem value="user">User Added</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedTerms.size === filteredKeywords.length && filteredKeywords.length > 0}
                  onCheckedChange={handleSelectAll}
                  disabled={isLoading || filteredKeywords.length === 0}
                />
              </TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Est. Volume</TableHead>
              <TableHead>Est. Relevance</TableHead>
              <TableHead>Est. Difficulty</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Loading terms...
                </TableCell>
              </TableRow>
            ) : filteredKeywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No terms found
                </TableCell>
              </TableRow>
            ) : (
              filteredKeywords.map((keyword) => (
                <TableRow key={keyword.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedTerms.has(keyword.id)}
                      onCheckedChange={(checked) => handleSelectTerm(keyword.id, checked as boolean)}
                      disabled={isLoading}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{keyword.term}</TableCell>
                  <TableCell>
                    {keyword.estimated_volume ? 
                      new Intl.NumberFormat().format(keyword.estimated_volume) 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {keyword.estimated_relevance ? 
                      `${(keyword.estimated_relevance * 100).toFixed(1)}%` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {keyword.estimated_difficulty ? 
                      `${keyword.estimated_difficulty}/100` 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{keyword.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        keyword.status === 'approved' 
                          ? 'default'
                          : keyword.status === 'rejected'
                          ? 'destructive'
                          : 'secondary'
                      }
                      className="capitalize"
                    >
                      {keyword.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(keyword.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {keyword.status === 'pending' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleUpdateStatus(keyword.id, 'approved')}
                          disabled={isLoading}
                          className="mr-2"
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleUpdateStatus(keyword.id, 'rejected')}
                          disabled={isLoading}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
} 