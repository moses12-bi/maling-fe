"use client"

import { useState, useCallback } from "react"
import EmailForm from "@/components/email/email-form"
import { EmailPreview } from "../email/email-preview"
import { Button } from "../ui/button"
import { FileText } from "lucide-react"
import Image from "next/image"
import type { EmailRequest } from "@/lib/api"

// Helper function to convert form data to EmailRequest
const toEmailRequest = (data: FormData): EmailRequest => ({
  fromAddress: data.from,
  recipients: data.to,
  subject: data.subject,
  message: data.message,
  priority: data.priority,
  department: data.department,
  product: data.product,
  actionType: data.actionType,
  emailType: data.templateType,
  description: data.description,
})

interface FormData {
  from: string
  to: string[]
  cc: string[]
  bcc: string[]
  subject: string
  message: string
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW'
  department: string
  product: string
  actionType: 'ACTION' | 'DECISION' | 'REVIEW' | 'APPROVAL' | 'MEETING' | 'INFO'
  description: string
  templateType: 'INTERNAL' | 'EXTERNAL'
}

export default function EmailDashboard() {
  const [formData, setFormData] = useState<FormData>({
    from: "noreply@centrika.rw",
    to: [],
    subject: "",
    message: "",
    priority: "NORMAL",
    department: "CEO Office",
    product: "",
    actionType: "INFO",
    description: "",
    templateType: "INTERNAL",
    cc: [],
    bcc: [],
  })

  const handleFormUpdate = useCallback((emailRequest: EmailRequest) => {
    setFormData(prev => ({
      ...prev,
      from: emailRequest.fromAddress,
      to: emailRequest.recipients,
      subject: emailRequest.subject,
      message: emailRequest.message,
      priority: emailRequest.priority as FormData['priority'],
      department: emailRequest.department,
      product: emailRequest.product,
      actionType: emailRequest.actionType as FormData['actionType'],
      templateType: emailRequest.emailType
    }))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-2">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <Image
                src="/images/centrika-logo.svg"
                alt="Centrika Logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <h1 className="text-lg font-bold text-gray-800">Centrika Email System</h1>
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Drafts
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-20 p-2">
        <div className="max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="flex justify-center gap-3">
            <div className="w-[60%] max-w-2xl">
              <EmailForm onFormChange={handleFormUpdate} />
            </div>
            <div className="w-[30%] max-w-md">
              <EmailPreview 
                emailData={{
                  from: formData.from,
                  to: formData.to,
                  cc: formData.cc,
                  bcc: formData.bcc,
                  subject: formData.subject,
                  message: formData.message,
                  department: formData.department,
                  product: formData.product,
                  actionType: formData.actionType,
                  description: formData.description,
                  priority: formData.priority,
                  templateType: formData.templateType,
                  date: new Date().toISOString(),
                }}
                subject={formData.subject}
                body={formData.message}
                onEdit={() => {}}
                onSend={() => {}}
                isSending={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
