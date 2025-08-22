"use client"

import type React from "react"
import OTPVerificationModal from "../otp-verification-modal"
import { useState, useCallback, useEffect } from "react"
import { emailAPI } from '@/lib/api/email';
import { EmailData } from "@/types/email";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import { X, Plus } from "lucide-react"

interface EmailFormProps {
  onFormChange: (data: any) => void
}

export default function EmailForm({ onFormChange }: EmailFormProps) {
  const [fromAddress, setFromAddress] = useState("user@centrika.rw")
  const [customEmail, setCustomEmail] = useState("")
  const [isCustomEmail, setIsCustomEmail] = useState(false)
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientInput, setRecipientInput] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<EmailData["priority"]>("NORMAL")
  const [department, setDepartment] = useState("CTK-GEN")
  const [emailType, setEmailType] = useState("Internal")
  const [product, setProduct] = useState("ALL")
  const [actionType, setActionType] = useState<EmailData["actionType"]>("INFO")

  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const updateFormData = useCallback(() => {
    const finalFromAddress = isCustomEmail ? customEmail : fromAddress
    onFormChange({
      fromAddress: finalFromAddress,
      recipients,
      subject,
      message,
      priority,
      department,
      emailType,
      product,
      actionType,
    })
  }, [
    fromAddress,
    customEmail,
    isCustomEmail,
    recipients,
    subject,
    message,
    priority,
    department,
    emailType,
    product,
    actionType,
    onFormChange,
  ])

  useEffect(() => {
    updateFormData()
  }, [updateFormData])

  const handleAddRecipient = () => {
    if (recipientInput.trim() && !recipients.includes(recipientInput.trim())) {
      setRecipients([...recipients, recipientInput.trim()])
      setRecipientInput("")
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter((r) => r !== email))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddRecipient()
    }
  }

  const handleFromAddressChange = (value: string) => {
    if (value === "custom") {
      setIsCustomEmail(true)
      setFromAddress("")
    } else {
      setIsCustomEmail(false)
      setFromAddress(value)
    }
  }

  const handleSaveDraft = async () => {
    const draftData: EmailData = {
      to: recipients,
      department,
      product,
      actionType,
      description: subject, // Using subject as description
      message: message,
      priority,
      senderName: isCustomEmail ? customEmail : fromAddress,
    };

    try {
      await emailAPI.saveDraft(draftData);
      alert('Draft saved successfully!');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft.');
    }
  };

  const handleSendEmail = () => {
    // Validate form before showing OTP
    if (!recipients.length) {
      alert("Please add at least one recipient")
      return
    }
    if (!subject.trim()) {
      alert("Please enter a subject description")
      return
    }
    if (!message.trim()) {
      alert("Please enter email content")
      return
    }

    // Show OTP verification modal
    setShowOTPModal(true)
    console.log("[v0] Sending OTP to:", isCustomEmail ? customEmail : fromAddress)
  }

  const handleOTPVerify = async (otp: string) => {
    setIsVerifying(true)

    try {
      // Simulate OTP verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In real implementation, verify OTP with backend
      if (otp === "123456") {
        // Demo OTP for testing
        console.log("[v0] OTP verified successfully")
        setShowOTPModal(false)
        setIsVerifying(false)

        // Actually send the email here
        console.log("[v0] Sending email with data:", {
          fromAddress: isCustomEmail ? customEmail : fromAddress,
          recipients,
          subject,
          message,
          priority,
          department,
          emailType,
          product,
          actionType,
        })

        alert("Email sent successfully!")

        // Reset form
        setRecipients([])
        setSubject("")
        setMessage("")
      } else {
        throw new Error("Invalid OTP")
      }
    } catch (error) {
      console.log("[v0] OTP verification failed:", error)
      setIsVerifying(false)
      alert("Invalid verification code. Please try again.")
    }
  }

  const handleCloseOTP = () => {
    setShowOTPModal(false)
    setIsVerifying(false)
  }

  const handleResendOTP = async () => {
    console.log("[v0] Resending OTP to:", isCustomEmail ? customEmail : fromAddress)
    // Simulate API call to resend OTP
    await new Promise((resolve) => setTimeout(resolve, 1500))
    alert(`A new verification code has been sent to ${isCustomEmail ? customEmail : fromAddress}`)
  }

  return (
    <>
      <Card className="h-fit">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-700">📧 Compose Email</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* Email Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email Type</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Internal">Internal</SelectItem>
                  <SelectItem value="External">External</SelectItem>
                  <SelectItem value="Inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CTK-CEO">CEO Office</SelectItem>
                  <SelectItem value="CTK-EXEC">Executive Team</SelectItem>
                  <SelectItem value="CTK-BOARD">Board of Directors</SelectItem>
                  <SelectItem value="CTK-FINC">Finance</SelectItem>
                  <SelectItem value="CTK-TECH">Technology</SelectItem>
                  <SelectItem value="CTK-RISK">Risk Management</SelectItem>
                  <SelectItem value="CTK-COMP">Compliance</SelectItem>
                  <SelectItem value="CTK-PROD">Product Development</SelectItem>
                  <SelectItem value="CTK-CUST">Customer Operations</SelectItem>
                  <SelectItem value="CTK-LEGAL">Legal Affairs</SelectItem>
                  <SelectItem value="CTK-MARK">Marketing</SelectItem>
                  <SelectItem value="CTK-COMM">Commercial</SelectItem>
                  <SelectItem value="CTK-INTL">International</SelectItem>
                  <SelectItem value="CTK-HR">Human Resources</SelectItem>
                  <SelectItem value="CTK-AUDIT">Internal Audit</SelectItem>
                  <SelectItem value="CTK-GEN">General/Cross-Dept</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Product</Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GWAY">Payment Gateway</SelectItem>
                  <SelectItem value="WALT">Consumer Wallet</SelectItem>
                  <SelectItem value="CARD">B2B Corporate Cards</SelectItem>
                  <SelectItem value="CRED">Credit Solutions</SelectItem>
                  <SelectItem value="XPAY">International Transfers</SelectItem>
                  <SelectItem value="KIOSK">Multi-Service Kiosks</SelectItem>
                  <SelectItem value="SFBS">Transport (SafariBus)</SelectItem>
                  <SelectItem value="EVENT">Event Ticketing (TiCQet)</SelectItem>
                  <SelectItem value="COMP">Compliance/Regulatory</SelectItem>
                  <SelectItem value="TECH">Technology Infrastructure</SelectItem>
                  <SelectItem value="FUND">Fundraising Activities</SelectItem>
                  <SelectItem value="ALL">Company-wide/Multiple</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Action Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Action Type</Label>
              <Select value={actionType} onValueChange={(value) => setActionType(value as EmailData["actionType"])}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTION">Action Required</SelectItem>
                  <SelectItem value="DECISION">Decision Needed</SelectItem>
                  <SelectItem value="REVIEW">Review Required</SelectItem>
                  <SelectItem value="APPROVAL">Approval Required</SelectItem>
                  <SelectItem value="MEETING">Meeting/Schedule</SelectItem>
                  <SelectItem value="INFO">Information Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Priority Level</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as EmailData["priority"])}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="URGENT">🔴 URGENT (1-2 hours)</SelectItem>
                  <SelectItem value="HIGH">🟡 HIGH (4-8 hours)</SelectItem>
                  <SelectItem value="LOW">🔵 LOW (Flexible)</SelectItem>
                  <SelectItem value="NORMAL">Normal (1-3 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Empty third column for layout balance */}
            <div></div>
          </div>

          {/* From Address */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">From Address</Label>
            {isCustomEmail ? (
              <div className="flex gap-2">
                <Input
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Enter your email@centrika.rw"
                  className="h-9"
                />
                <Button variant="outline" size="sm" onClick={() => setIsCustomEmail(false)} className="h-9 px-3">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Select value={fromAddress} onValueChange={handleFromAddressChange}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user@centrika.rw">user@centrika.rw</SelectItem>
                  <SelectItem value="noreply@centrika.rw">noreply@centrika.rw</SelectItem>
                  <SelectItem value="support@centrika.rw">support@centrika.rw</SelectItem>
                  <SelectItem value="admin@centrika.rw">admin@centrika.rw</SelectItem>
                  <SelectItem value="finance@centrika.rw">finance@centrika.rw</SelectItem>
                  <SelectItem value="tech@centrika.rw">tech@centrika.rw</SelectItem>
                  <SelectItem value="hr@centrika.rw">hr@centrika.rw</SelectItem>
                  <SelectItem value="legal@centrika.rw">legal@centrika.rw</SelectItem>
                  <SelectItem value="custom">Custom Email</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Subject Description</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of the email content"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Recipients</Label>
            <div className="flex gap-2">
              <Input
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add recipient email (press Enter or comma to add)"
                className="h-9 flex-1"
              />
              <Button variant="outline" size="sm" onClick={handleAddRecipient} className="h-9 px-3 bg-transparent">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {recipients.length === 0 && <p className="text-sm text-gray-500">No recipients added</p>}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipients.map((email) => (
                  <div
                    key={email}
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm"
                  >
                    {email}
                    <button onClick={() => handleRemoveRecipient(email)} className="hover:bg-blue-200 rounded">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Email Content</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email content here..."
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Send Button */}
          <div className="flex space-x-2">
            <Button onClick={handleSendEmail} className="w-full h-10 text-sm font-medium">
              Send Email
            </Button>
            <Button onClick={handleSaveDraft} variant="outline" className="w-full h-10 text-sm font-medium">
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleCloseOTP}
        onVerify={handleOTPVerify}
        senderEmail={isCustomEmail ? customEmail : fromAddress}
        isLoading={isVerifying}
        onResendOTP={handleResendOTP}
      />
    </>
  )
}
