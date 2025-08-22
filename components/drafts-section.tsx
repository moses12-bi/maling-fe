"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Trash2 } from "lucide-react"

export default function DraftsSection() {
  // Mock draft data
  const drafts = [
    {
      id: 1,
      subject: "System Update Notification",
      priority: "HIGH",
      department: "Technology",
      lastModified: "2 hours ago",
      recipients: 3,
    },
    {
      id: 2,
      subject: "Monthly Report Review",
      priority: "NORMAL",
      department: "Finance",
      lastModified: "1 day ago",
      recipients: 5,
    },
    {
      id: 3,
      subject: "Client Meeting Follow-up",
      priority: "URGENT",
      department: "CEO Office",
      lastModified: "3 days ago",
      recipients: 2,
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-100 text-red-800"
      case "HIGH":
        return "bg-amber-100 text-amber-800"
      case "NORMAL":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader className="p-3">
        <CardTitle className="text-base flex items-center gap-2">📄 Drafts</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {drafts.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">No drafts available</div>
        ) : (
          drafts.map((draft) => (
            <div key={draft.id} className="border rounded-lg p-2 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <FileText className="h-3 w-3 text-gray-400" />
                    <span className="text-xs font-medium truncate">{draft.subject}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <Badge className={`text-xs ${getPriorityColor(draft.priority)}`}>{draft.priority}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {draft.department}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    {draft.recipients} recipients • {draft.lastModified}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-6 w-6 p-0 bg-transparent">
                    <FileText className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}

        <Button variant="outline" className="w-full h-7 text-xs mt-3 bg-transparent">
          View All Drafts
        </Button>
      </CardContent>
    </Card>
  )
}
