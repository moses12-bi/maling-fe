"use client"

import { useState, useCallback } from "react"
import EmailComposer from "@/components/email/email-composer"
import { EmailPreview } from "../email/email-preview"
import { Button } from "../ui/button"
import { FileText, Mail, Send, Save } from "lucide-react"
import Image from "next/image"
import type { EmailRequest } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
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

  const handleFormChange = useCallback((data: any) => {
    setFormData(prev => ({
      ...prev,
      from: data.from || prev.from || "noreply@centrika.rw",
      to: data.recipients || prev.to || [],
      subject: data.subject || prev.subject || "",
      message: data.body || prev.message || "",
      priority: data.urgencyLevel || prev.priority || 'NORMAL',
      department: data.department || prev.department || 'CEO Office',
      product: data.productLine || prev.product || '',
      actionType: data.actionType || prev.actionType || 'INFO',
      description: data.subject || prev.description || '',
      templateType: data.emailType === 'internal' ? 'INTERNAL' : 'EXTERNAL',
      cc: [],
      bcc: []
    }))
  }, [])

  // Convert FormData to EmailData for EmailPreview
  const getEmailDataForPreview = () => {
    return {
      id: Date.now().toString(),
      from: formData.from,
      recipients: formData.to,
      subject: formData.subject,
      body: formData.message,
      emailType: formData.templateType === 'INTERNAL' ? 'internal' : 'external',
      department: formData.department,
      position: '',
      serviceCategory: '',
      productLine: formData.product,
      actionType: formData.actionType,
      urgencyLevel: formData.priority,
      externalParty: undefined,
      createdAt: new Date().toISOString(),
      status: 'draft' as const
    }
  }

  const handleSaveDraft = useCallback(() => {
    try {
      const drafts = JSON.parse(localStorage.getItem('emailDrafts') || '[]')
      const newDraft = {
        ...formData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('emailDrafts', JSON.stringify([...drafts, newDraft]))
      toast({
        title: 'Draft saved',
        description: 'Your email has been saved as a draft.',
      })
    } catch (error) {
      console.error('Failed to save draft:', error)
      toast({
        title: 'Error',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      })
    }
  }, [formData])

  const handleSendEmail = useCallback(async () => {
    if (!formData.to.length) {
      toast({
        title: 'Recipient required',
        description: 'Please add at least one recipient',
        variant: 'destructive',
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toEmailRequest(formData)),
      })

      if (!response.ok) throw new Error('Failed to send email')

      toast({
        title: 'Email sent',
        description: 'Your email has been sent successfully.',
      })
      
      // Reset form after successful send
      setFormData(prev => ({
        ...prev,
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        description: '',
        product: '',
      }))
    } catch (error) {
      console.error('Failed to send email:', error)
      toast({
        title: 'Error',
        description: 'Failed to send email. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }, [formData])

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col sm:gap-4 sm:py-4">
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <div className="w-full">
            <div className="flex items-center justify-between mb-6">
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
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="h-8 gap-1"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSending}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Save Draft
                  </span>
                </Button>
                <Button 
                  size="sm" 
                  className="h-8 gap-1"
                  onClick={handleSendEmail}
                  disabled={isSending}
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    {isSending ? 'Sending...' : 'Send'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Two Card Layout: Compose Email (60%) and Email Preview (35%) */}
            <div className="grid grid-cols-12 gap-6">
              {/* Compose Email Card - 60% width */}
              <div className="col-span-7">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Compose Email
                    </h2>
                  </div>
                  <div className="p-4">
                    <EmailComposer 
                      userRole="user" 
                      generatedSubject=""
                      onFormDataChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              {/* Email Preview Card - 35% width */}
              <div className="col-span-5">
                <div className="bg-white rounded-lg border shadow-sm">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Email Preview
                    </h2>
                  </div>
                  <div className="p-4">
                    <EmailPreview 
                      emailData={getEmailDataForPreview()}
                      subject={formData.subject}
                      body={formData.message}
                      onEdit={() => {}}
                      onSend={handleSendEmail}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
