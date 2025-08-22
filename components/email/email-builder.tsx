"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { Plus, X, Paperclip } from "lucide-react"
import OTPVerificationModal from "../otp-verification-modal"
import { EmailData, EmailTemplateData } from "@/types/email"
import { generateEmail } from "@/lib/email/templates"
import { otpAPI } from "@/lib/api/otp"

interface EmailBuilderProps {
  initialData?: Partial<EmailData>
  onSend: (email: EmailData) => Promise<void>
  onDraftSave?: (draft: EmailData) => Promise<void>
  isSending?: boolean
}

type RecipientField = 'to' | 'cc' | 'bcc';

export default function EmailBuilder({
  initialData,
  onSend,
  onDraftSave,
  isSending = false,
}: EmailBuilderProps) {
  // Form state
  const [formData, setFormData] = useState<EmailData>({
    to: [],
    cc: [],
    bcc: [],
    department: "",
    product: "",
    actionType: "INFO",
    description: "",
    priority: "NORMAL",
    message: "",
    templateType: "INTERNAL",
    ...initialData,
  })

  // UI State
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string }>({
    subject: "",
    body: "",
  })
  const [isGeneratingOTP, setIsGeneratingOTP] = useState(false)
  const [otpError, setOtpError] = useState("")

  // Update preview when form data changes
  useEffect(() => {
    try {
      const { subject, body } = generateEmail(
        formData.templateType || "INTERNAL",
        formData
      )
      setEmailPreview({ subject, body })
    } catch (error) {
      console.error("Error generating email preview:", error)
    }
  }, [formData])

  // Handle form field changes
  const handleChange = useCallback((field: keyof EmailData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }, [])

  // Handle recipient management
  const handleAddRecipient = (type: RecipientField) => {
    const emailInput = document.getElementById(`${type}-input`) as HTMLInputElement
    const email = emailInput?.value.trim()
    
    if (email && !formData[type]?.includes(email)) {
      handleChange(type, [...(formData[type] || []), email])
      emailInput.value = ""
    }
  }

  const handleRemoveRecipient = (type: RecipientField, email: string) => {
    handleChange(
      type,
      formData[type]?.filter((e) => e !== email) || []
    )
  }

  // Handle OTP verification
  const handleSendClick = async () => {
    if (!formData.to?.length) {
      setOtpError("Please add at least one recipient")
      return
    }

    setIsGeneratingOTP(true)
    try {
      // In a real app, you would call your API to generate and send OTP
      // await otpAPI.generateOTP(senderEmail)
      setShowOTPModal(true)
      setOtpError("")
    } catch (error) {
      console.error("Error generating OTP:", error)
      setOtpError("Failed to send verification code. Please try again.")
    } finally {
      setIsGeneratingOTP(false)
    }
  }

  const handleOTPVerify = async (otp: string) => {
    try {
      // In a real app, you would verify the OTP with your API
      // await otpAPI.verifyOTP(senderEmail, otp)
      await onSend({
        ...formData,
        subject: emailPreview.subject,
        body: emailPreview.body,
      })
      setShowOTPModal(false)
    } catch (error) {
      console.error("Error verifying OTP:", error)
      throw new Error("Invalid verification code. Please try again.")
    }
  }

  const handleResendOTP = async () => {
    try {
      // In a real app, you would call your API to resend OTP
      // await otpAPI.resendOTP(senderEmail)
    } catch (error) {
      console.error("Error resending OTP:", error)
      throw new Error("Failed to resend verification code. Please try again.")
    }
  }

  // Render recipient input field
  const renderRecipientField = (type: RecipientField) => (
    <div className="space-y-2">
      <Label htmlFor={`${type}-input`} className="capitalize">
        {type} {type === "to" && "*"}
      </Label>
      <div className="flex gap-2">
        <Input
          id={`${type}-input`}
          type="email"
          placeholder={`Enter ${type} email`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddRecipient(type)
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => handleAddRecipient(type)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {(formData[type as RecipientField]?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {formData[type as RecipientField]?.map((email) => (
            <div
              key={email}
              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
            >
              {email}
              <button
                type="button"
                onClick={() => handleRemoveRecipient(type, email)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Email Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="template-type">Email Type</Label>
          <Select
            value={formData.templateType}
            onValueChange={(value) => handleChange("templateType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select email type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTERNAL">Internal</SelectItem>
              <SelectItem value="EXTERNAL">External</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TECH">Technology</SelectItem>
              <SelectItem value="CUST">Customer Service</SelectItem>
              <SelectItem value="FINC">Finance</SelectItem>
              <SelectItem value="HR">Human Resources</SelectItem>
              <SelectItem value="MKTG">Marketing</SelectItem>
              <SelectItem value="SALE">Sales</SelectItem>
              <SelectItem value="OPS">Operations</SelectItem>
              <SelectItem value="LEGAL">Legal</SelectItem>
              <SelectItem value="EXEC">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product and Action Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="product">Product *</Label>
          <Select
            value={formData.product}
            onValueChange={(value) => handleChange("product", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GWAY">Payment Gateway</SelectItem>
              <SelectItem value="WALT">Digital Wallet</SelectItem>
              <SelectItem value="CARD">Corporate Cards</SelectItem>
              <SelectItem value="CRED">Credit Solutions</SelectItem>
              <SelectItem value="ALL">All Products</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="action-type">Action Type *</Label>
          <Select
            value={formData.actionType}
            onValueChange={(value: any) => handleChange("actionType", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTION">Action Required</SelectItem>
              <SelectItem value="DECISION">Decision Needed</SelectItem>
              <SelectItem value="REVIEW">For Review</SelectItem>
              <SelectItem value="APPROVAL">Approval Requested</SelectItem>
              <SelectItem value="MEETING">Meeting</SelectItem>
              <SelectItem value="INFO">Information Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Priority and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="URGENT">Urgent</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description of the email"
            required
          />
        </div>
      </div>

      {/* Recipients */}
      <div className="space-y-4">
        {renderRecipientField("to")}
        {renderRecipientField("cc")}
        {renderRecipientField("bcc")}
      </div>

      {/* Email Body */}
      <div className="space-y-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Write your email content here..."
          className="min-h-[200px]"
          required
        />
      </div>

      {/* Preview Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Preview</Label>
          <span className="text-sm text-gray-500">
            Subject: {emailPreview.subject || "(No subject)"}
          </span>
        </div>
        <div
          className="border rounded-md p-4 bg-white min-h-[200px] overflow-auto"
          dangerouslySetInnerHTML={{ __html: emailPreview.body || "<p>Preview will appear here</p>" }}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onDraftSave?.(formData)}
          disabled={isSending}
        >
          Save Draft
        </Button>
        <Button
          type="button"
          onClick={handleSendClick}
          disabled={isSending || isGeneratingOTP}
        >
          {isSending ? "Sending..." : "Send Email"}
        </Button>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleOTPVerify}
        senderEmail={formData.to?.[0] || ""}
        isLoading={isSending}
        onResendOTP={handleResendOTP}
      />

      {/* Error Message */}
      {otpError && (
        <div className="text-red-500 text-sm mt-2">{otpError}</div>
      )}
    </div>
  )
}
