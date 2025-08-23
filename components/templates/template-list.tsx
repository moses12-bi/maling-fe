"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Filter, Download, Upload, MoreHorizontal, Eye, Edit, Copy, Trash2, Star } from "lucide-react"
import { EmailTemplate, TemplateCategory, TemplateFilterOptions } from "@/types/template"
import { templateAPI } from "@/lib/api/template"
import { toast } from "sonner"

interface TemplateListProps {
  onEditTemplate: (template: EmailTemplate) => void;
  onViewTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: string) => Promise<void>;
  categories: TemplateCategory[];
}

export default function TemplateList({ 
  onEditTemplate, 
  onViewTemplate, 
  onDeleteTemplate, 
  categories: propCategories 
}: TemplateListProps) {
  const router = useRouter()
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [categories, setCategories] = useState<TemplateCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TemplateFilterOptions>({
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    isActive: true
  })
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch templates and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [templatesData, categoriesData] = await Promise.all([
          templateAPI.getTemplates(filters),
          templateAPI.getCategories()
        ])
        setTemplates(templatesData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filters])

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        searchQuery: searchQuery || undefined
      }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      await templateAPI.deleteTemplate(templateId)
      setTemplates(templates.filter(t => t.id !== templateId))
      toast.success('Template deleted successfully')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleDuplicate = async (template: EmailTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    const newName = prompt('Enter a name for the duplicated template:', `${template.name} (Copy)`)
    if (!newName) return

    try {
      const newTemplate = await templateAPI.duplicateTemplate(template.id, newName)
      setTemplates([newTemplate, ...templates])
      toast.success('Template duplicated successfully')
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast.error('Failed to duplicate template')
    }
  }

  const handleExport = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const blob = await templateAPI.exportTemplate(templateId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${templateId}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error exporting template:', error)
      toast.error('Failed to export template')
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const newTemplate = await templateAPI.importTemplate(file)
      setTemplates([newTemplate, ...templates])
      toast.success('Template imported successfully')
    } catch (error) {
      console.error('Error importing template:', error)
      toast.error('Failed to import template')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading templates...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage your email templates for consistent communication
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleImport}
            />
          </Button>
          <Button onClick={() => router.push('/templates/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Template</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search templates..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.categories?.[0] || ""}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  categories: value ? [value] : [] 
                }))}
              >
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.templateCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={`${filters.sortBy}:${filters.sortOrder}`}
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split(':')
                  setFilters(prev => ({
                    ...prev,
                    sortBy: sortBy as any,
                    sortOrder: sortOrder as any
                  }))
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                  <SelectItem value="updatedAt:desc">Recently Updated</SelectItem>
                  <SelectItem value="updatedAt:asc">Oldest Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No templates found. Create your first template to get started.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow 
                    key={template.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/templates/${template.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {template.name}
                        {template.tags?.includes('favorite') && (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(template.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={template.isActive ? 'default' : 'secondary'}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/compose?template=${template.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/templates/${template.id}/edit`)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDuplicate(template, e)}
                        >
                          <Copy className="h-4 w-4" />
                          <span className="sr-only">Duplicate</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleExport(template.id, e)}
                        >
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Export</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => handleDelete(template.id, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
