"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { EmailTemplateData } from "@/types/email"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2, Copy, Download, ArrowLeft, Mail, Code, Eye, History, BarChart2 } from "lucide-react"
import { EmailTemplate, TemplateUsageStats } from "@/types/template"
import { templateAPI } from "@/lib/api/template"
import { toast } from "sonner"
import { generateEmail } from "@/lib/email/templates"
import { format } from "date-fns"

interface TemplateDetailProps {
  template: EmailTemplate
  onEdit: () => void
  onDelete: () => void
}

export default function TemplateDetail({ template, onEdit, onDelete }: TemplateDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("preview")
  const [previewData, setPreviewData] = useState<EmailTemplateData>({
    department: '',
    product: '',
    actionType: 'INFO',
    description: ''
  })
  const [previewHtml, setPreviewHtml] = useState("")
  const [usageStats, setUsageStats] = useState<TemplateUsageStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Generate preview with sample data
  useEffect(() => {
    const sampleData: EmailTemplateData = {
      department: 'Sample Department',
      product: 'Sample Product',
      actionType: 'INFO',
      description: 'Sample template preview',
      message: template.body
    };
    
    // Add template variables to sample data
    template.variables?.forEach(variable => {
      switch (variable.type) {
        case 'text':
          sampleData[variable.name] = `Sample ${variable.name}`
          break
        case 'number':
          sampleData[variable.name] = '123'
          break
        case 'date':
          sampleData[variable.name] = new Date().toISOString().split('T')[0]
          break
        case 'boolean':
          sampleData[variable.name] = 'true'
          break
        case 'select':
          if (variable.options?.[0]?.value) {
            sampleData[variable.name] = variable.options[0].value
          }
          break
      }
    })
    
    setPreviewData(sampleData)
  }, [template])

  // Update preview when preview data changes
  useEffect(() => {
    try {
      const { body } = generateEmail("INTERNAL", {
        ...previewData,
        message: template.body
      })
      setPreviewHtml(body)
    } catch (error) {
      console.error("Error generating preview:", error)
      setPreviewHtml("<p>Error generating preview. Please check your template syntax.</p>")
    }
  }, [previewData, template.body])

  // Load usage stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true)
        const stats = await templateAPI.getTemplateStats(template.id)
        setUsageStats(stats)
      } catch (error) {
        console.error("Error loading template stats:", error)
        toast.error("Failed to load usage statistics")
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadStats()
  }, [template.id])

  const handleDuplicate = async () => {
    const newName = prompt("Enter a name for the duplicated template:", `${template.name} (Copy)`)
    if (!newName) return

    try {
      await templateAPI.duplicateTemplate(template.id, newName)
      toast.success("Template duplicated successfully")
      router.refresh()
    } catch (error) {
      console.error("Error duplicating template:", error)
      toast.error("Failed to duplicate template")
    }
  }

  const handleExport = async () => {
    try {
      const blob = await templateAPI.exportTemplate(template.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error exporting template:", error)
      toast.error("Failed to export template")
    }
  }

  const handleUseTemplate = () => {
    router.push(`/compose?template=${template.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <Badge variant={template.isActive ? "default" : "secondary"}>
              {template.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          {template.description && (
            <p className="text-muted-foreground">{template.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span>Last updated: {format(new Date(template.updatedAt), 'PPpp')}</span>
            <span>•</span>
            <span>Version {template.version}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDuplicate}
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            onClick={handleUseTemplate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Mail className="mr-2 h-4 w-4" />
            Use Template
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="code">
            <Code className="mr-2 h-4 w-4" />
            Code
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart2 className="mr-2 h-4 w-4" />
            Usage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {template.category}
                  </Badge>
                  <Badge variant="secondary">
                    {template.variables?.length || 0} variables
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Subject: {template.subject}
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-4">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>

              {/* Template Variables */}
              {template.variables && template.variables.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Template Variables</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.variables.map((variable, index) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="bg-muted/50 px-4 py-2 flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            <span className="font-mono text-sm">
                              {`{{${variable.name}}}`}
                            </span>
                            {variable.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{variable.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {variable.type}
                            </Badge>
                          </div>
                          
                          {variable.description && (
                            <p className="text-sm text-muted-foreground">
                              {variable.description}
                            </p>
                          )}
                          
                          {variable.type === 'select' && variable.options && variable.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Options:</p>
                              <div className="flex flex-wrap gap-1">
                                {variable.options.map((option, optIndex) => (
                                  <Badge key={optIndex} variant="secondary" className="text-xs">
                                    {option.label}: <span className="font-mono ml-1">{option.value}</span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Template Code</CardTitle>
              <p className="text-sm text-muted-foreground">
                Raw template code for developers
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Subject</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{template.subject}</code>
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Body</h3>
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                    <code>{template.body}</code>
                  </pre>
                </div>
                
                {template.variables && template.variables.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Variables</h3>
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                      <code>{JSON.stringify(template.variables, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track how this template is being used
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="flex justify-center py-8">
                  <p>Loading usage statistics...</p>
                </div>
              ) : usageStats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Usage</p>
                    <p className="text-3xl font-bold">{usageStats.usageCount}</p>
                  </div>
                  
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-3xl font-bold">
                      {Math.round(usageStats.successRate * 100)}%
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground">Last Used</p>
                    <p className="text-lg font-medium">
                      {usageStats.lastUsedAt 
                        ? format(new Date(usageStats.lastUsedAt), 'PPpp')
                        : 'Never'}
                    </p>
                  </div>
                  
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h3 className="font-medium mb-2">Engagement</h3>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Open Rate</span>
                            <span>{Math.round(usageStats.openRate * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600"
                              style={{ width: `${Math.round(usageStats.openRate * 100)}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Click Rate</span>
                            <span>{Math.round(usageStats.clickRate * 100)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-600"
                              style={{ width: `${Math.round(usageStats.clickRate * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Recent Activity</h3>
                      <div className="space-y-2 text-sm">
                        <p>Last updated: {format(new Date(template.updatedAt), 'PPpp')}</p>
                        <p>Created: {format(new Date(template.createdAt), 'PPpp')}</p>
                        <p>Version: {template.version}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No usage data available</p>
                  <p className="text-sm">This template hasn't been used yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
