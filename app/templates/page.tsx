"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import TemplateList from "@/components/templates/template-list"
import { TemplateEditor } from "@/components/templates/template-editor"
import { TemplateDetail } from "@/components/templates/template-detail"
import { EmailTemplate, TemplateCategory } from "@/types/template"
import { templateAPI } from "@/lib/api/template"
import { toast } from "sonner"

// Mock data for categories (in a real app, this would come from an API)
const MOCK_CATEGORIES: TemplateCategory[] = [
  { id: "marketing", name: "Marketing", templateCount: 5 },
  { id: "notifications", name: "Notifications", templateCount: 8 },
  { id: "onboarding", name: "Onboarding", templateCount: 3 },
  { id: "transactions", name: "Transactions", templateCount: 6 },
  { id: "alerts", name: "Alerts", templateCount: 4 },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">("list")
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<TemplateCategory[]>([])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        // In a real app, you would fetch this from your API
        // const categories = await templateAPI.getCategories()
        setCategories(MOCK_CATEGORIES)
      } catch (error) {
        console.error("Error loading categories:", error)
        toast.error("Failed to load template categories")
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleCreateTemplate = () => {
    setCurrentTemplate(null)
    setView("create")
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template)
    setView("edit")
  }

  const handleViewTemplate = (template: EmailTemplate) => {
    setCurrentTemplate(template)
    setView("detail")
  }

  const handleSaveTemplate = async (template: EmailTemplate) => {
    try {
      // In a real app, you would save the template to your API
      // const savedTemplate = currentTemplate
      //   ? await templateAPI.updateTemplate(currentTemplate.id, template)
      //   : await templateAPI.createTemplate(template)
      
      toast.success(`Template ${currentTemplate ? 'updated' : 'created'} successfully`)
      
      // Go back to the list view
      setView("list")
      
      // In a real app, you would refresh the template list here
      // fetchTemplates()
    } catch (error) {
      console.error("Error saving template:", error)
      toast.error(`Failed to ${currentTemplate ? 'update' : 'create'} template`)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return
    }

    try {
      // In a real app, you would delete the template via API
      // await templateAPI.deleteTemplate(templateId)
      
      toast.success("Template deleted successfully")
      
      // If we're currently viewing the template being deleted, go back to the list
      if (currentTemplate?.id === templateId) {
        setView("list")
      }
      
      // In a real app, you would refresh the template list here
      // fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      toast.error("Failed to delete template")
    }
  }

  // Render the appropriate view based on the current state
  const renderView = () => {
    switch (view) {
      case "create":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Create New Template</h1>
              <Button 
                variant="outline" 
                onClick={() => setView("list")}
              >
                Back to Templates
              </Button>
            </div>
            <TemplateEditor 
              categories={categories}
              onSave={handleSaveTemplate}
              onCancel={() => setView("list")}
            />
          </div>
        )
      
      case "edit":
        return currentTemplate ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Edit Template</h1>
              <Button 
                variant="outline" 
                onClick={() => setView("detail")}
              >
                Cancel
              </Button>
            </div>
            <TemplateEditor 
              template={currentTemplate}
              categories={categories}
              onSave={handleSaveTemplate}
              onCancel={() => setView("detail")}
            />
          </div>
        ) : null
      
      case "detail":
        return currentTemplate ? (
          <TemplateDetail 
            template={currentTemplate}
            onEdit={() => setView("edit")}
            onDelete={() => handleDeleteTemplate(currentTemplate.id)}
          />
        ) : null
      
      case "list":
      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Email Templates</h1>
                <p className="text-muted-foreground">
                  Manage your email templates for consistent communication
                </p>
              </div>
              <Button onClick={handleCreateTemplate} className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </div>
            
            <TemplateList 
              onEditTemplate={handleEditTemplate}
              onViewTemplate={handleViewTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              categories={categories}
            />
          </div>
        )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading templates...</p>
        </div>
      ) : (
        renderView()
      )}
    </div>
  )
}
