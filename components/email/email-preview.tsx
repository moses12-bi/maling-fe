"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Check, X, Edit, Mail, Clock, Tag, Building, Box, AlertCircle, Loader2 } from "lucide-react"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EmailData {
  from: string
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  message: string
  department: string
  product: string
  actionType: string
  priority: string
  templateType: 'INTERNAL' | 'EXTERNAL'
  date?: string
  description?: string
}

interface EmailPreviewProps {
  emailData: EmailData
  subject: string
  body: string
  onEdit: () => void
  onSend: () => void
  isSending?: boolean
}

const getPriorityBadge = (priority: string) => {
  const priorityMap: Record<string, { 
    label: string; 
    className: string;
    icon: React.ReactNode;
  }> = {
    URGENT: { 
      label: "Urgent", 
      className: "bg-red-100 text-red-800 border-red-200",
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    HIGH: { 
      label: "High", 
      className: "bg-orange-100 text-orange-800 border-orange-200",
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    NORMAL: { 
      label: "Normal", 
      className: "bg-blue-50 text-blue-700 border-blue-100",
      icon: null
    },
    LOW: { 
      label: "Low", 
      className: "bg-gray-50 text-gray-600 border-gray-200",
      icon: null
    },
  }

  const { label, className, icon } = priorityMap[priority] || {
    label: priority,
    className: "bg-gray-50 text-gray-600 border border-gray-200",
    icon: null
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}>
      {icon}
      {label}
    </div>
  )
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  emailData,
  subject,
  body,
  onEdit,
  onSend,
  isSending = false,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Email Preview
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Review your email before sending
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                disabled={isSending}
                className="gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
              <Button
                onClick={onSend}
                disabled={isSending}
                className={cn(
                  "gap-1.5 transition-all",
                  isSending 
                    ? "bg-green-700 hover:bg-green-700" 
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-3.5 w-3.5" />
                    <span>Send Email</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Header */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">From:</span>
                  <span className="text-sm">{emailData.from || 'No sender'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">To:</span>
                  <span className="text-sm">{emailData.to.join(', ') || 'No recipients'}</span>
                </div>
                {emailData.cc.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">CC:</span>
                    <span className="text-sm">{emailData.cc.join(', ')}</span>
                  </div>
                )}
                {emailData.bcc && emailData.bcc.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">BCC:</span>
                    <span className="text-sm">{emailData.bcc.join(', ')}</span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  You'll be asked to verify your identity before sending
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(emailData.priority)}
                {emailData.templateType && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                    {emailData.templateType?.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-0 border rounded-lg overflow-hidden">
            {/* Subject Banner */}
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-blue-800">{subject || 'No subject'}</h3>
                <div className="flex items-center gap-2">
                  {emailData.priority === 'URGENT' && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      URGENT
                    </span>
                  )}
                  {emailData.priority === 'HIGH' && (
                    <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700 mt-1">
                <span>{format(new Date(), 'MMM d, yyyy h:mm a')}</span>
                {emailData.department && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5" />
                      <span>{emailData.department}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-6 bg-white">
              <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>

          {/* Email Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">Action Type:</span>
              <span className="capitalize">{emailData.actionType?.toLowerCase() || 'None'}</span>
            </div>
            {emailData.product && (
              <div className="flex items-center gap-2">
                <Box className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">Product:</span>
                <span>{emailData.product}</span>
              </div>
            )}
            {emailData.description && (
              <div className="mt-2 p-3 bg-muted/30 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Note:</span> {emailData.description}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">From:</span>
                <span className="text-sm">{emailData.from}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">To:</span>
                <span className="text-sm">{emailData.to.join(", ")}</span>
              </div>

              {emailData.cc && emailData.cc.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">CC:</span>
                  <span className="text-sm">{emailData.cc.join(", ")}</span>
                </div>
              )}

              {emailData.bcc && emailData.bcc.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">BCC:</span>
                  <span className="text-sm">{emailData.bcc.join(", ")}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">Department:</span>
                <span className="text-sm">{emailData.department}</span>
              </div>

              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{emailData.product || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium">Action:</span>
                <span className="text-sm">{emailData.actionType}</span>
              </div>

              {emailData.priority && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm font-medium">Priority:</span>
                  {getPriorityBadge(emailData.priority)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">{subject || "No subject"}</h3>
              <div className="prose max-w-none text-sm text-foreground">
                {body ? (
                  <div dangerouslySetInnerHTML={{ __html: body }} />
                ) : (
                  <p className="text-muted-foreground italic">No message content</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailPreview