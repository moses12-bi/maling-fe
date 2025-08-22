"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmailPreview } from "@/components/email/email-preview"
import { EmailData } from "@/types/email"
import { generateEmail } from "@/lib/email/templates"
import { emailAPI, otpAPI, type EmailResponse, type EmailRequest } from "@/lib/api"

interface EmailFormData {
  id?: number;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  message: string;
  department: string;
  product: string;
  description: string;
  actionType: string;
  priority: string;
  urgency: string;
  templateType: 'INTERNAL' | 'EXTERNAL';
  emailType: 'INTERNAL' | 'EXTERNAL';
  otp?: string[];
}

interface SaveDraftResponse extends EmailResponse {
  id: number;
}

// Department options
const DEPARTMENTS = [
  { value: 'RISK', label: 'Risk Management' },
  { value: 'COMP', label: 'Compliance' },
  { value: 'PROD', label: 'Product Development' },
  { value: 'CUST', label: 'Customer Operations' },
  { value: 'FINC', label: 'Finance' },
  { value: 'LEGAL', label: 'Legal Affairs' },
  { value: 'TECH', label: 'Technology' },
  { value: 'MARK', label: 'Marketing' },
  { value: 'COMM', label: 'Commercial' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'EXEC', label: 'Executive Team' },
  { value: 'GEN', label: 'General' }
]

// Product options
const PRODUCTS = [
  { value: 'GWAY', label: 'Payment Gateway' },
  { value: 'WALT', label: 'Wallet' },
  { value: 'CARD', label: 'Cards' },
  { value: 'CRED', label: 'Credit Solutions' },
  { value: 'ALL', label: 'All Products' }
]

// Action type options
const ACTION_TYPES = [
  { value: 'ACTION', label: 'Action Required' },
  { value: 'DECISION', label: 'Decision Needed' },
  { value: 'REVIEW', label: 'For Review' },
  { value: 'APPROVAL', label: 'Approval Needed' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'INFO', label: 'Information' }
]

// Urgency options
const URGENCY_LEVELS = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' }
]

export default function ComposeEmailPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"compose" | "preview">("compose")
  const [isSending, setIsSending] = useState(false)
  const [emailData, setEmailData] = useState<EmailFormData>({
    from: 'user@centrika.rw',
    to: [],
    cc: [],
    bcc: [],
    subject: '',
    message: '',
    department: 'CTK_GEN',
    product: 'ALL',
    description: '',
    actionType: 'INFO',
    priority: 'NORMAL',
    urgency: 'NORMAL',
    templateType: 'INTERNAL',
    emailType: 'INTERNAL',
    otp: Array(6).fill('')
  });
  const [emailPreview, setEmailPreview] = useState<{ subject: string; body: string }>({
    subject: "",
    body: "",
  })
  const [showOTPModal, setShowOTPModal] = useState(false)

  // Generate email subject based on form data
  const generateSubject = useCallback((): string => {
    const { department, product, description, actionType, priority } = emailData;
    if (!department || !product || !description || !actionType) return "";
    
    const parts = [
      `CTK-${department}`,
      product ? `-${product}` : '',
      description ? ` - ${description}` : '',
      actionType ? ` - ${actionType}` : ''
    ];

    // Add priority if it's not NORMAL or empty
    if (priority && priority !== 'NORMAL' && priority !== '') {
      parts.push(` - ${priority}`);
    }

    // Join all parts and ensure we don't exceed 78 characters
    let subject = parts.join('');
    
    // Truncate if necessary (leaving room for potential '...')
    if (subject.length > 75) {
      subject = subject.substring(0, 72) + '...';
    }

    return subject;
  }, [emailData]);

  // Update email preview when form data changes
  useEffect(() => {
    try {
      const subject = generateSubject();
      setEmailPreview({
        subject,
        body: emailData.message || ""
      });
    } catch (error) {
      console.error("Error generating email preview:", error);
    }
  }, [emailData, generateSubject]);

  const handleOTPVerify = async (otp: string | string[]) => {
    if (!emailData.id) return;
    
    const otpString = Array.isArray(otp) ? otp.join('') : otp;
    
    try {
      setIsSending(true);
      await emailAPI.sendEmail(emailData.id, otpString);
      toast.success('Email sent successfully!');
      router.push('/sent');
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
      setShowOTPModal(false);
    }
  };

  const handleSaveDraft = async (): Promise<SaveDraftResponse> => {
    try {
      setIsSending(true);
      const draftRequest: EmailRequest = {
        fromAddress: emailData.from,
        recipients: emailData.to,
        subject: generateSubject(),
        message: emailData.message,
        priority: emailData.priority,
        department: emailData.department,
        product: emailData.product,
        actionType: emailData.actionType,
        emailType: emailData.templateType,
        description: emailData.description
      };
      const response = await emailAPI.createDraft(draftRequest);
      return { ...response, id: response.id || 0 };
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft. Please try again.");
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  // Handle OTP input change
  const handleOTPChange = (index: number, value: string) => {
    if (value === '' || /^[0-9]$/.test(value)) {
      const newOtp = [...(emailData.otp || [])];
      newOtp[index] = value;
      setEmailData({ ...emailData, otp: newOtp });
      
      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
        nextInput?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      if (!emailData.to || emailData.to.length === 0) {
        throw new Error("No recipient email address found");
      }
      
      // In a real app, resend OTP
      // await otpAPI.resendOTP(emailData.to[0])
      toast.success("Verification code resent!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to resend verification code. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">
              {emailData.templateType === "INTERNAL" ? "Internal" : "External"} Email
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={isSending}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSending}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => setActiveTab(activeTab === "compose" ? "preview" : "compose")}
                variant={activeTab === "preview" ? "secondary" : "outline"}
                disabled={isSending}
              >
                {activeTab === "compose" ? "Preview" : "Back to Edit"}
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const draft = await handleSaveDraft();
                    if (draft?.id) {
                      setEmailData(prev => ({ ...prev, id: draft.id }));
                      setShowOTPModal(true);
                    }
                  } catch (error) {
                    console.error("Error preparing to send email:", error);
                  }
                }}
                disabled={isSending || !emailData.to?.length}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="compose" className="m-0 p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Department Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={emailData.department}
                        onValueChange={(value) => setEmailData(prev => ({ ...prev, department: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Product Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="product">Product *</Label>
                      <Select
                        value={emailData.product}
                        onValueChange={(value) => setEmailData(prev => ({ ...prev, product: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS.map((product) => (
                            <SelectItem key={product.value} value={product.value}>
                              {product.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Type */}
                    <div className="space-y-2">
                      <Label htmlFor="actionType">Action Type *</Label>
                      <Select
                        value={emailData.actionType}
                        onValueChange={(value) => setEmailData(prev => ({ ...prev, actionType: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select action type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_TYPES.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              {action.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Urgency Level */}
                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency</Label>
                      <Select
                        value={emailData.urgency}
                        onValueChange={(value) => setEmailData(prev => ({ ...prev, urgency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                        <SelectContent>
                          {URGENCY_LEVELS.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Input
                        id="description"
                        value={emailData.description || ''}
                        onChange={(e) => setEmailData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the email subject"
                      />
                  </div>

                  {/* Read-only Subject Preview */}
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm font-medium text-blue-800 mb-1">Subject (Auto-generated):</p>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="font-medium text-gray-900">{emailPreview.subject || "Subject will be generated based on your selections"}</p>
                      {emailPreview.subject && (
                        <p className="text-xs text-gray-500 mt-1">
                          Length: {emailPreview.subject.length}/78 characters
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      The subject is automatically generated based on the selected department, product, description, and action type.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Message Body */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Write your message here..."
                      rows={8}
                      className="min-h-[200px]"
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("preview")}
                      disabled={isSending}
                    >
                      Preview
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        try {
                          const draft = await handleSaveDraft();
                          if (draft?.id) {
                            setEmailData(prev => ({ ...prev, id: draft.id }));
                            setShowOTPModal(true);
                          }
                        } catch (error) {
                          console.error("Error preparing to send email:", error);
                        }
                      }}
                      disabled={isSending || !emailData.department || !emailData.product || !emailData.description || !emailData.actionType || !emailData.message}
                    >
                      {isSending ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="m-0 p-6">
              <EmailPreview
                emailData={{
                  ...emailData,
                  from: emailData.from || "noreply@centrika.rw",
                  subject: emailPreview.subject,
                  message: emailPreview.body
                }}
                subject={emailPreview.subject}
                body={emailPreview.body}
                onEdit={() => setActiveTab("compose")}
                onSend={async () => {
                  try {
                    const draft = await handleSaveDraft();
                    if (draft?.id) {
                      setEmailData(prev => ({ ...prev, id: draft.id }));
                      setShowOTPModal(true);
                    }
                  } catch (error) {
                    console.error("Error preparing to send email:", error);
                  }
                }}
                isSending={isSending}
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("compose")}
                  disabled={isSending}
                >
                  Back to Edit
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const draft = await handleSaveDraft();
                      if (draft?.id) {
                        setEmailData(prev => ({ ...prev, id: draft.id }));
                        setShowOTPModal(true);
                      }
                    } catch (error) {
                      console.error("Error preparing to send email:", error);
                    }
                  }}
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Email'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Verify Your Identity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">
                We've sent a 6-digit verification code to your email. Please enter it below to continue.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '' || /^[0-9]$/.test(value)) {
                          // Handle OTP input
                          const newOtp = [...(emailData.otp || Array(6).fill(''))]
                          newOtp[index] = value
                          setEmailData({ ...emailData, otp: newOtp })
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement
                            nextInput?.focus()
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                          const prevInput = document.querySelector(`input[data-index="${index - 1}"]`) as HTMLInputElement
                          prevInput?.focus()
                        }
                      }}
                      value={emailData.otp?.[index] || ''}
                      data-index={index}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-sm text-blue-600 hover:text-blue-800"
                    disabled={isSending}
                  >
                    Resend Code
                  </button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowOTPModal(false)}
                      disabled={isSending}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (emailData.otp) {
                          const otpString = emailData.otp.join('');
                          if (otpString.length === 6) {
                            handleOTPVerify(otpString);
                          }
                        }
                      }}
                      disabled={isSending || !emailData.otp || emailData.otp.length < 6 || emailData.otp.some(digit => !digit)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSending ? 'Verifying...' : 'Verify & Send'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
