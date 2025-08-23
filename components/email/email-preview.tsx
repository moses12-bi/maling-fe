"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Check, X, Edit, Mail, Clock, Tag, Building, Box, AlertCircle, Loader2, Paperclip, Send, Eye } from "lucide-react"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface EmailData {
  id: string
  from: string
  recipients: string[]
  subject: string
  body: string
  emailType: "internal" | "external" | "inbound"
  department: string
  position: string
  serviceCategory: string
  productLine: string
  actionType?: string
  urgencyLevel?: string
  externalParty?: string
  createdAt: string
  status: "draft" | "sent" | "failed"
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
      className: "bg-red-100 text-red-800 border-red-200 shadow-sm",
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    HIGH: { 
      label: "High", 
      className: "bg-orange-100 text-orange-800 border-orange-200 shadow-sm",
      icon: <AlertCircle className="h-3 w-3 mr-1" />
    },
    NORMAL: { 
      label: "Normal", 
      className: "bg-blue-50 text-blue-700 border-blue-100 shadow-sm",
      icon: null
    },
    LOW: { 
      label: "Low", 
      className: "bg-gray-50 text-gray-600 border-gray-200 shadow-sm",
      icon: null
    },
  }

  const { label, className, icon } = priorityMap[priority] || {
    label: priority,
    className: "bg-gray-50 text-gray-600 border border-gray-200 shadow-sm",
    icon: null
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-200 hover:shadow-md ${className}`}>
      {icon}
      {label}
    </div>
  )
}

const getStatusIndicator = (status: string) => {
  const statusMap: Record<string, { 
    label: string; 
    className: string;
    icon: React.ReactNode;
  }> = {
    draft: { 
      label: "Draft", 
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Eye className="h-3 w-3 mr-1" />
    },
    sent: { 
      label: "Sent", 
      className: "bg-green-100 text-green-800 border-green-200",
      icon: <Send className="h-3 w-3 mr-1" />
    },
    failed: { 
      label: "Failed", 
      className: "bg-red-100 text-red-800 border-red-200",
      icon: <X className="h-3 w-3 mr-1" />
    },
  }

  const { label, className, icon } = statusMap[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border shadow-sm transition-all duration-200 hover:shadow-md ${className}`}>
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
  const [isHovered, setIsHovered] = useState(false)
  
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
      <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
                <Mail className="h-5 w-5 text-blue-500" />
                Email Preview
              </CardTitle>
              <CardDescription className="text-sm mt-1 text-gray-600">
                Review your email before sending
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIndicator(emailData.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          {/* Email Header */}
          <div className="space-y-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">From:</span>
                  <span className="text-sm font-semibold text-gray-900">{emailData.from || 'No sender'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">To:</span>
                  <span className="text-sm text-gray-900">{emailData.recipients.join(', ') || 'No recipients'}</span>
                </div>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md inline-block">
                  <Clock className="h-3 w-3 inline mr-1" />
                  You'll be asked to verify your identity before sending
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getPriorityBadge(emailData.urgencyLevel || 'NORMAL')}
                {emailData.emailType && (
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 shadow-sm hover:shadow-md transition-all duration-200">
                    {emailData.emailType?.toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Email Body - Enhanced Realistic Email Design */}
          <div 
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-300"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Email Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {subject || 'No subject'}
                    </h3>
                    <p className="text-blue-100 text-sm flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(emailData.createdAt), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {emailData.urgencyLevel === 'URGENT' && (
                    <span className="bg-red-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg animate-pulse">
                      URGENT
                    </span>
                  )}
                  {emailData.urgencyLevel === 'HIGH' && (
                    <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      HIGH PRIORITY
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Email Content */}
            <div className="p-6">
              {/* Sender Info */}
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-blue-600 font-semibold text-sm">
                    {emailData.from?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{emailData.from}</p>
                  <p className="text-sm text-gray-500">to {emailData.recipients.join(', ') || 'No recipients'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Paperclip className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400">0 attachments</span>
                </div>
              </div>

              {/* Email Message */}
              {body ? (
                <div className="prose max-w-none prose-sm text-gray-700 leading-relaxed">
                  <div 
                    className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-200"
                    dangerouslySetInnerHTML={{ __html: body }} 
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-gray-200" />
                  <p className="text-lg font-medium text-gray-500">No message content</p>
                  <p className="text-sm text-gray-400 mt-2">Please write your email message in the form above</p>
                </div>
              )}

              {/* Email Signature */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <Building className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-800">Centrika Team</p>
                    <p className="text-gray-500">{emailData.department || 'Department'}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      This email was sent from the Centrika Email Management System
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500">
                <p className="mb-1">
                  Powered by{" "}
                  <a 
                    href="https://centrika.rw/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
                  >
                    Centrika
                  </a>
                </p>
                <p className="text-gray-400">
                  Professional email management system
                </p>
              </div>
            </div>
          </div>

          {/* Email Metadata */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="font-medium text-gray-800 flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-500" />
              Form Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                <Tag className="h-3.5 w-3.5 text-blue-500" />
                <span className="font-medium text-gray-700">Action Type:</span>
                <span className="capitalize text-gray-900">{emailData.actionType?.toLowerCase() || 'None'}</span>
              </div>
              {emailData.productLine && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <Box className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium text-gray-700">Product:</span>
                  <span className="text-gray-900">{emailData.productLine}</span>
                </div>
              )}
              {emailData.department && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <Building className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium text-gray-700">Department:</span>
                  <span className="text-gray-900">{emailData.department}</span>
                </div>
              )}
              {emailData.urgencyLevel && (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                  <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-medium text-gray-700">Priority:</span>
                  {getPriorityBadge(emailData.urgencyLevel)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EmailPreview