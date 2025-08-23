"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "@/hooks/use-toast"
import { validateEmailFormat, validateField, ValidationResult } from "@/lib/email/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Paperclip, Bold, Italic, ListOrdered, List, AlignLeft, AlignCenter, AlignRight, AlignJustify, Sparkles, Check, Copy, RefreshCw, CheckCircle, Mail } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

type UserRole = "admin" | "manager" | "user"

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

interface EmailComposerProps {
  userRole: UserRole
  generatedSubject?: string
  onFormDataChange?: (data: EmailData) => void
}

export default function EmailComposer({ userRole, generatedSubject = "", onFormDataChange }: EmailComposerProps) {
  // Updated department and position mapping according to Centrika standards
  const departments = [
    // Executive & Management
    { code: "CTK-CEO", name: "CEO Office", description: "Chief Executive Office - Strategic leadership and executive decisions" },
    { code: "CTK-EXEC", name: "Executive Team", description: "Executive Team - Senior management and strategic planning" },
    { code: "CTK-BOARD", name: "Board of Directors", description: "Board of Directors - Governance and oversight" },
    
    // Core Business Departments
    { code: "CTK-FINC", name: "Finance Department", description: "Finance Department - Financial management and accounting" },
    { code: "CTK-TECH", name: "Technology Department", description: "Technology Department - IT infrastructure and development" },
    { code: "CTK-RISK", name: "Risk Management", description: "Risk Management - Risk assessment and mitigation" },
    { code: "CTK-COMP", name: "Compliance Department", description: "Compliance Department - Regulatory compliance and legal adherence" },
    { code: "CTK-PROD", name: "Product Development", description: "Product Development - Product design and innovation" },
    { code: "CTK-CUST", name: "Customer Operations", description: "Customer Operations - Customer service and support" },
    { code: "CTK-LEGAL", name: "Legal Affairs", description: "Legal Affairs - Legal counsel and contract management" },
    
    // Business Operations
    { code: "CTK-MARK", name: "Marketing Department", description: "Marketing Department - Brand promotion and market strategy" },
    { code: "CTK-COMM", name: "Commercial Department", description: "Commercial Department - Sales and business development" },
    { code: "CTK-INTL", name: "International Division", description: "International Division - Global operations and expansion" },
    { code: "CTK-HR", name: "Human Resources", description: "Human Resources - Employee management and development" },
    { code: "CTK-AUDIT", name: "Internal Audit", description: "Internal Audit - Internal controls and audit functions" },
    { code: "CTK-GEN", name: "General/Cross-Dept", description: "General/Cross-Dept - Company-wide communications" },
  ]

  // Department to position mapping with proper hierarchy
  const departmentPositions: Record<string, string[]> = {
    // Executive & Management Positions
    "CTK-CEO": ["Chief Executive Officer", "Executive Assistant", "Chief of Staff", "Strategic Advisor"],
    "CTK-EXEC": ["Chief Operating Officer", "Chief Technology Officer", "Chief Financial Officer", "Chief Risk Officer", "Vice President", "Executive Director"],
    "CTK-BOARD": ["Board Chair", "Board Member", "Board Secretary", "Governance Officer"],
    
    // Finance Department Positions
    "CTK-FINC": ["Finance Director", "Financial Controller", "Senior Accountant", "Accountant", "Financial Analyst", "Treasury Manager", "Budget Manager", "Payroll Specialist", "Bookkeeper"],
    
    // Technology Department Positions
    "CTK-TECH": ["Chief Technology Officer", "Technology Director", "Software Engineer", "Senior Software Engineer", "DevOps Engineer", "QA Engineer", "Technical Lead", "Product Manager", "System Administrator", "Security Analyst", "Data Engineer", "UI/UX Designer", "Project Manager"],
    
    // Risk Management Positions
    "CTK-RISK": ["Chief Risk Officer", "Risk Director", "Senior Risk Analyst", "Risk Analyst", "Compliance Officer", "Risk Manager", "Regulatory Specialist", "Audit Manager", "Credit Analyst"],
    
    // Compliance Department Positions
    "CTK-COMP": ["Compliance Director", "Senior Compliance Officer", "Compliance Officer", "Regulatory Specialist", "AML Officer", "KYC Specialist", "Policy Manager", "Compliance Analyst"],
    
    // Product Development Positions
    "CTK-PROD": ["Product Director", "Senior Product Manager", "Product Manager", "Product Analyst", "UX Designer", "Technical Product Manager", "Product Owner", "Scrum Master"],
    
    // Customer Operations Positions
    "CTK-CUST": ["Customer Operations Director", "Customer Service Manager", "Senior Customer Support", "Customer Support", "IT Support", "Helpdesk Specialist", "Client Success Manager", "Customer Experience Manager"],
    
    // Legal Affairs Positions
    "CTK-LEGAL": ["General Counsel", "Legal Director", "Senior Legal Counsel", "Legal Counsel", "Contract Manager", "Regulatory Lawyer", "Corporate Secretary"],
    
    // Marketing Department Positions
    "CTK-MARK": ["Marketing Director", "Senior Marketing Manager", "Marketing Manager", "Brand Manager", "Digital Marketing Specialist", "Content Manager", "Campaign Manager", "Market Research Analyst"],
    
    // Commercial Department Positions
    "CTK-COMM": ["Commercial Director", "Sales Director", "Senior Sales Manager", "Sales Manager", "Account Manager", "Business Development Manager", "Partnership Manager", "Sales Representative"],
    
    // International Division Positions
    "CTK-INTL": ["International Director", "Country Manager", "Regional Manager", "International Business Development", "Local Operations Manager", "Cross-border Specialist"],
    
    // Human Resources Positions
    "CTK-HR": ["HR Director", "Senior HR Manager", "HR Manager", "Recruitment Specialist", "Talent Manager", "HR Coordinator", "Training Manager", "Employee Relations Specialist"],
    
    // Internal Audit Positions
    "CTK-AUDIT": ["Internal Audit Director", "Senior Internal Auditor", "Internal Auditor", "Audit Manager", "Compliance Auditor", "Risk Auditor"],
    
    // General/Cross-Dept Positions
    "CTK-GEN": ["General Manager", "Project Manager", "Coordinator", "Administrative Assistant", "Executive Assistant", "Office Manager"],
  }

  // Service categories
  const serviceCategories = [
    "Payments",
    "Compliance",
    "Technology",
    "Customer Support",
    "Finance",
    "Legal",
    "Marketing",
    "Human Resources",
    "Operations",
    "Sales"
  ]

  // Product lines according to Centrika standards
  const productLines = [
    { code: "GWAY", name: "Payment Gateway", description: "Transaction processing, merchant issues" },
    { code: "WALT", name: "Consumer Wallet", description: "User accounts, P2P transfers" },
    { code: "CARD", name: "B2B Corporate Cards", description: "Card issuance, expense management" },
    { code: "CRED", name: "Credit Solutions", description: "Loan applications, credit scoring" },
    { code: "XPAY", name: "International Transfers", description: "Remittances, FX transactions" },
    { code: "KIOSK", name: "Multi-Service Kiosks", description: "Physical locations, cash services" },
    { code: "SFBS", name: "Transport (SafariBus)", description: "Bus ticketing, route management" },
    { code: "EVENT", name: "Event Ticketing (TiCQet)", description: "Event sales, venue management" },
    { code: "COMP", name: "Compliance/Regulatory", description: "BNR reporting, audit requirements" },
    { code: "TECH", name: "Technology Infrastructure", description: "System maintenance, security" },
    { code: "FUND", name: "Fundraising Activities", description: "Investor relations, due diligence" },
    { code: "ALL", name: "Company-wide/Multiple", description: "General announcements, multi-product" }
  ]

  // Action types
  const actionTypes = [
    "Action Required",
    "Decision Needed",
    "Review Required",
    "Approval Required",
    "Meeting/Schedule",
    "Information Only"
  ]

  // Urgency levels
  const urgencyLevels = [
    "Low",
    "Normal",
    "High",
    "Urgent"
  ]

  // External Party Naming Conventions according to Centrika standards
  const externalParties = {
    // Regulatory Bodies
    regulatory: [
      { code: "BNR", name: "Central Bank of Rwanda", description: "Regulatory authority" },
      { code: "MINICT", name: "Ministry of ICT and Innovation", description: "Government ministry" },
      { code: "RDB", name: "Rwanda Development Board", description: "Development authority" },
      { code: "RURA", name: "Rwanda Utilities Regulatory Authority", description: "Utilities regulator" },
      { code: "RSB", name: "Rwanda Standards Board", description: "Standards authority" }
    ],
    // Financial Institutions
    financial: [
      { code: "BK", name: "Bank of Kigali", description: "Partner bank" },
      { code: "EquityBank", name: "Equity Bank Rwanda", description: "Partner bank" },
      { code: "AccessBank", name: "Access Bank Rwanda", description: "Partner bank" },
      { code: "Unguka", name: "Unguka Bank", description: "Partner bank" },
      { code: "BPR", name: "Banque Populaire du Rwanda", description: "Partner bank" }
    ],
    // Technology Partners
    technology: [
      { code: "Microsoft", name: "Microsoft Corporation", description: "Technology partner" },
      { code: "AWS", name: "Amazon Web Services", description: "Cloud services" },
      { code: "Visa", name: "Visa Inc.", description: "Payment network" },
      { code: "Mastercard", name: "Mastercard", description: "Payment network" },
      { code: "UnionPay", name: "China UnionPay", description: "Payment network" },
      { code: "MTN", name: "MTN Rwanda", description: "Telecom partner" },
      { code: "Airtel", name: "Airtel Rwanda", description: "Telecom partner" }
    ],
    // Common External Parties
    common: [
      { code: "Customer", name: "Customer", description: "Individual customer" },
      { code: "Merchant", name: "Merchant", description: "Business merchant" },
      { code: "Investor", name: "Investor", description: "Current or potential investor" },
      { code: "Partner", name: "Business Partner", description: "Strategic partner" },
      { code: "Vendor", name: "Vendor", description: "Service provider" },
      { code: "Media", name: "Media Outlet", description: "Press or media" }
    ]
  }

  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [availablePositions, setAvailablePositions] = useState<string[]>([])
  const [selectedPosition, setSelectedPosition] = useState("")
  const [selectedServiceCategory, setSelectedServiceCategory] = useState("Payments")
  const [selectedProductLine, setSelectedProductLine] = useState("")
  const [selectedActionType, setSelectedActionType] = useState("")
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState("")
  const [emailType, setEmailType] = useState<"internal" | "external" | "inbound">("internal")
  const [externalParty, setExternalParty] = useState("")
  const [selectedExternalPartyType, setSelectedExternalPartyType] = useState<"regulatory" | "financial" | "technology" | "common" | "custom">("common")
  const [customExternalParty, setCustomExternalParty] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const [recipients, setRecipients] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [from, setFrom] = useState("")
  const [recipientList, setRecipientList] = useState<string[]>([])
  const [newRecipient, setNewRecipient] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [fontSize, setFontSize] = useState("14px")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [textAlign, setTextAlign] = useState("left")

  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (generatedSubject) {
      setSubject(generatedSubject)
    }
  }, [generatedSubject])

  // Update available positions when department changes
  useEffect(() => {
    if (selectedDepartment && departmentPositions[selectedDepartment]) {
      setAvailablePositions(departmentPositions[selectedDepartment])
      setSelectedPosition("")
      // setEmailData(prev => ({
      //   ...prev,
      //   department: departments.find(d => d.code === selectedDepartment)?.name || selectedDepartment,
      //   position: ""
      // }))
    } else {
      setAvailablePositions([])
      setSelectedPosition("")
    }
  }, [selectedDepartment])

  // Update position in email data when selected
  useEffect(() => {
    // setEmailData(prev => ({
    //   ...prev,
    //   position: selectedPosition,
    //   subject: generateSubjectLine(prev.subject)
    // }))
  }, [selectedPosition, selectedDepartment])

  // Call parent callback whenever form data changes
  useEffect(() => {
    if (onFormDataChange) {
      const emailData: EmailData = {
        id: Date.now().toString(),
        from,
        recipients: recipientList,
        subject: generateSubjectLine(subject),
        body: message,
        emailType,
        department: selectedDepartment,
        position: selectedPosition,
        serviceCategory: selectedServiceCategory,
        productLine: selectedProductLine,
        actionType: selectedActionType,
        urgencyLevel: selectedUrgencyLevel,
        externalParty: emailType === "external" || emailType === "inbound" ? externalParty : undefined,
        createdAt: new Date().toISOString(),
        status: "draft"
      }
      onFormDataChange(emailData)
    }
  }, [
    selectedDepartment, 
    selectedPosition, 
    selectedServiceCategory, 
    selectedProductLine, 
    selectedActionType, 
    selectedUrgencyLevel, 
    subject, 
    recipientList, 
    message, 
    emailType, 
    externalParty,
    selectedExternalPartyType,
    customExternalParty,
    onFormDataChange,
    from
  ])

  // Validate email format whenever form data changes
  useEffect(() => {
    if (selectedDepartment && selectedProductLine && subject && selectedActionType) {
      const validationData = {
        emailType,
        department: selectedDepartment,
        product: selectedProductLine,
        subject,
        actionType: selectedActionType,
        urgencyLevel: selectedUrgencyLevel,
        externalParty,
        customExternalParty,
        message,
        recipients: recipientList,
        from
      }
      
      const result = validateEmailFormat(validationData)
      setValidationResult(result)
    }
  }, [
    emailType,
    selectedDepartment,
    selectedProductLine,
    subject,
    selectedActionType,
    selectedUrgencyLevel,
    externalParty,
    customExternalParty,
    message,
    recipientList,
    from
  ])

  // Generate subject line based on selected values
  const generateSubjectLine = (customSubject: string) => {
    if (!selectedDepartment) return customSubject;
    
    let prefix = "CTK-"
    
    if (emailType === "internal") {
      prefix += selectedDepartment
    } else if (emailType === "external") {
      if (selectedExternalPartyType === "common" && customExternalParty) {
        prefix += `EXT-${externalParty}${customExternalParty.toUpperCase().replace(/\s+/g, "")}`
      } else {
        prefix += `EXT-${externalParty}`
      }
    } else {
      if (selectedExternalPartyType === "common" && customExternalParty) {
        prefix += `IN-${externalParty}${customExternalParty.toUpperCase().replace(/\s+/g, "")}`
      } else {
        prefix += `IN-${externalParty}`
      }
    }

    if (selectedProductLine) {
      prefix += `-${selectedProductLine}`
    }

    if (customSubject) {
      prefix += ` - ${customSubject}`
    }

    if (selectedActionType) {
      prefix += ` - ${selectedActionType}`
    }

    if (selectedUrgencyLevel) {
      prefix += ` - ${selectedUrgencyLevel}`
    }
    
    return prefix;
  }

  const handleSend = () => {
    if (!from) {
      toast({
        title: "Sender Required",
        description: "Please enter a sender email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!recipientList.length) {
      toast({
        title: "Recipient Required",
        description: "Please enter at least one recipient",
        variant: "destructive"
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "Subject Required",
        description: "Please enter a subject line",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDepartment || !selectedPosition) {
      toast({
        title: "Department/Position Required",
        description: "Please select both department and position",
        variant: "destructive"
      });
      return;
    }

    // Validate external party for external/inbound emails
    if ((emailType === "external" || emailType === "inbound") && !externalParty) {
      toast({
        title: "External Party Required",
        description: "Please select or enter an external party",
        variant: "destructive"
      });
      return;
    }

    // Validate custom external party name for common external parties
    if (selectedExternalPartyType === "common" && !customExternalParty) {
      toast({
        title: "External Party Name Required",
        description: "Please enter the specific external party name",
        variant: "destructive"
      });
      return;
    }

    // Use comprehensive validation
    if (validationResult && !validationResult.isValid) {
      toast({
        title: "Email Format Issues",
        description: `Please fix ${validationResult.errors.length} issue(s) before sending`,
        variant: "destructive"
      });
      return;
    }

    setIsSending(true)
    // Simulate sending
    setTimeout(() => {
      console.log({
        from,
        recipients: recipientList,
        subject,
        body: message,
        emailType,
        externalParty: emailType === "external" || emailType === "inbound" ? externalParty : undefined
      })
      setIsSending(false)
    }, 1500)
  }

  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value || '')
    editorRef.current?.focus()
  }

  const addRecipient = () => {
    if (newRecipient.trim() && !recipientList.includes(newRecipient.trim())) {
      setRecipientList([...recipientList, newRecipient.trim()])
      setNewRecipient("")
    }
  }

  const removeRecipient = (email: string) => {
    setRecipientList(recipientList.filter(r => r !== email))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addRecipient()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      alert(`File attached: ${file.name}`)
      // Handle file upload logic here
    }
  }

  // Calculate required fields completed
  const requiredFieldsCompleted = [
    from, 
    selectedDepartment, 
    selectedPosition, 
    selectedServiceCategory, 
    selectedProductLine, 
    subject,
    // Add external party validation for external/inbound emails
    ...(emailType === "external" || emailType === "inbound" ? [externalParty] : [])
  ].filter(Boolean).length

  // Copy generated subject to clipboard
  const copySubjectToClipboard = async () => {
    const generatedSubject = generateSubjectLine(subject)
    try {
      await navigator.clipboard.writeText(generatedSubject)
      toast({
        title: "Subject copied!",
        description: "Generated subject line copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually",
        variant: "destructive"
      })
    }
  }

  const resetForm = () => {
    setSelectedDepartment("")
    setSelectedPosition("")
    setSelectedServiceCategory("")
    setSelectedProductLine("")
    setSelectedActionType("")
    setSelectedUrgencyLevel("")
    setSubject("")
    setEmailType("internal")
    setExternalParty("")
    setSelectedExternalPartyType("common")
    setCustomExternalParty("")
    setRecipients("")
    setMessage("")
    setRecipientList([])
    setNewRecipient("")
    setFrom("")
  }

  // Template helper function
  const getTemplateSuggestion = (actionType: string, context: any) => {
    const baseTemplate = `Dear Team,

I am writing regarding ${context.subject || 'the matter at hand'}.

[Your message content here]

Best regards,
Centrika Team`

    const actionTemplates: Record<string, string> = {
      'ACTION': `Dear Team,

I need your assistance with ${context.subject || 'the following matter'}.

Required Actions:
• [Action 1]
• [Action 2]
• [Action 3]

Timeline:
• Deadline: [Specify deadline]
• Updates required: [How often]

Please confirm receipt and expected completion.

Best regards,
Centrika Team`,

      'MEETING': `Dear Team,

I would like to schedule a meeting to discuss ${context.subject || 'important matters'}.

Meeting Details:
• Date: [Proposed date and time]
• Duration: [Expected length]
• Location: [Physical location or Teams link]
• Attendees: [Required participants]

Agenda:
• [Agenda item 1]
• [Agenda item 2]
• [Agenda item 3]

Please confirm your availability.

Best regards,
Centrika Team`,

      'APPROVAL': `Dear [Approver Name],

I am requesting your approval for ${context.subject || 'the following item'}.

Request Details:
• What: [Detailed description]
• Why: [Business justification]
• When: [Timeline and deadlines]
• Cost: [Financial impact if applicable]
• Risk: [Risk assessment and mitigation]

Supporting Documents:
• [Document 1]
• [Document 2]

Please approve or provide feedback by [deadline].

Best regards,
Centrika Team`,

      'INFO': `Dear Team,

I'm sharing the following information for your awareness.

Key Information:
• [Point 1]
• [Point 2]
• [Point 3]

Impact on your work:
• [How this affects the recipient]
• [Any changes needed]

No action required unless you have questions.

Best regards,
Centrika Team`,

      'DECISION': `Dear Team,

A decision is needed regarding ${context.subject || 'the following matter'}.

Context:
[Provide context and background]

Available Options:
• [Option 1]
• [Option 2]
• [Option 3]

Please provide your decision by [deadline].

Best regards,
Centrika Team`,

      'REVIEW': `Dear Team,

I need your review and feedback on ${context.subject || 'the following item'}.

Review Scope:
[What needs to be reviewed]

Areas for Feedback:
• [Area 1]
• [Area 2]
• [Area 3]

Please provide your feedback by [deadline].

Best regards,
Centrika Team`
    }

    return actionTemplates[actionType] || baseTemplate
  }

  const generatedSubjectLine = generateSubjectLine(subject)
  const isValid = selectedDepartment && selectedPosition && selectedServiceCategory && selectedProductLine && subject

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-purple-600 mb-2">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Professional Communication</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Email Subject Generator</h1>
        {/* Progress Indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Form Progress</span>
            <span className="text-sm text-gray-500">
              {requiredFieldsCompleted}/{emailType === "internal" ? "6" : "7"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(requiredFieldsCompleted / (emailType === "internal" ? 6 : 7)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Email Type & External Party Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Email Type */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">1</div>
              <Label className="text-sm font-medium text-gray-700">Email Type *</Label>
            </div>
            <Select value={emailType} onValueChange={(value: "internal" | "external" | "inbound") => setEmailType(value)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="external">External</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* External Party (for external/inbound emails) */}
          {(emailType === "external" || emailType === "inbound") && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">2</div>
                <Label className="text-sm font-medium text-gray-700">External Party *</Label>
              </div>
              
              {/* External Party Type Selection */}
              <Select value={selectedExternalPartyType} onValueChange={(value: "regulatory" | "financial" | "technology" | "common" | "custom") => {
                setSelectedExternalPartyType(value)
                setExternalParty("")
                setCustomExternalParty("")
              }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select external party type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regulatory">Regulatory Bodies</SelectItem>
                  <SelectItem value="financial">Financial Institutions</SelectItem>
                  <SelectItem value="technology">Technology Partners</SelectItem>
                  <SelectItem value="common">Common External Parties</SelectItem>
                  <SelectItem value="custom">Custom External Party</SelectItem>
                </SelectContent>
              </Select>

              {/* External Party Selection */}
              {selectedExternalPartyType !== "custom" && selectedExternalPartyType !== "common" && (
                <Select value={externalParty} onValueChange={setExternalParty}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select external party" />
                  </SelectTrigger>
                  <SelectContent>
                    {externalParties[selectedExternalPartyType]?.map((party) => (
                      <SelectItem key={party.code} value={party.code}>
                        <div className="flex flex-col">
                          <span className="font-medium">{party.name}</span>
                          <span className="text-xs text-muted-foreground">{party.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Custom External Party Input */}
              {selectedExternalPartyType === "custom" && (
                <Input
                  placeholder="Enter custom external party name"
                  value={customExternalParty}
                  onChange={(e) => {
                    setCustomExternalParty(e.target.value)
                    setExternalParty(e.target.value.toUpperCase().replace(/\s+/g, ""))
                  }}
                  className="h-10"
                />
              )}

              {/* Common External Party with Custom Name */}
              {selectedExternalPartyType === "common" && (
                <div className="space-y-2">
                  <Select value={externalParty} onValueChange={setExternalParty}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select external party type" />
                    </SelectTrigger>
                    <SelectContent>
                      {externalParties.common.map((party) => (
                        <SelectItem key={party.code} value={party.code}>
                          <div className="flex flex-col">
                            <span className="font-medium">{party.name}</span>
                            <span className="text-xs text-muted-foreground">{party.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Enter specific name (e.g., JohnUwimana, MerchantABC)"
                    value={customExternalParty}
                    onChange={(e) => setCustomExternalParty(e.target.value)}
                    className="h-10"
                  />
                </div>
              )}

              {/* External Party Format Info */}
              {(emailType === "external" || emailType === "inbound") && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
                  <p className="font-medium mb-1">External Party Format:</p>
                  <p>• <strong>Regulatory:</strong> CTK-EXT-BNR-[PRODUCT] - [Subject] - [ACTION]</p>
                  <p>• <strong>Financial:</strong> CTK-EXT-BK-[PRODUCT] - [Subject] - [ACTION]</p>
                  <p>• <strong>Customer:</strong> CTK-EXT-CustomerJohnUwimana-[PRODUCT] - [Subject] - [ACTION]</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Department & Position Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Department */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-medium flex items-center justify-center">
                {emailType === "internal" ? "2" : "3"}
              </div>
              <Label className="text-sm font-medium text-gray-700">Department *</Label>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select your department" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {departments.map((dept) => (
                  <SelectItem key={dept.code} value={dept.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{dept.name}</span>
                      <span className="text-xs text-muted-foreground">{dept.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Position */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-medium flex items-center justify-center">
                {emailType === "internal" ? "3" : "4"}
              </div>
              <Label className="text-sm font-medium text-gray-700">Position *</Label>
            </div>
            <Select value={selectedPosition} onValueChange={setSelectedPosition} disabled={!selectedDepartment}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder={selectedDepartment ? "Select position" : "Select department first"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {availablePositions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Service Category & Product Line Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Service Category */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-medium flex items-center justify-center">
                {emailType === "internal" ? "4" : "5"}
              </div>
              <Label className="text-sm font-medium text-gray-700">Service Category *</Label>
              <Check className="h-4 w-4 text-blue-500" />
            </div>
            <Select value={selectedServiceCategory} onValueChange={setSelectedServiceCategory}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Line */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs font-medium flex items-center justify-center">
                {emailType === "internal" ? "5" : "6"}
              </div>
              <Label className="text-sm font-medium text-gray-700">Product Line *</Label>
            </div>
            <Select value={selectedProductLine} onValueChange={setSelectedProductLine}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select product line" />
              </SelectTrigger>
              <SelectContent>
                {productLines.map((product) => (
                  <SelectItem key={product.code} value={product.code}>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">{product.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center">
              {emailType === "internal" ? "6" : "7"}
            </div>
            <Label className="text-sm font-medium text-gray-700">Subject *</Label>
          </div>
          
          {/* Auto-generated Subject Display */}
          {isValid && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Generated Subject Line:</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={copySubjectToClipboard}
                    className="h-6 px-2 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              <div className="font-mono text-sm text-blue-700 bg-white p-3 rounded border font-medium">
                {generateSubjectLine(subject)}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                This is how your email subject will appear when sent
              </div>
              
              {/* Validation Feedback */}
              {validationResult && (
                <div className="mt-3 space-y-2">
                  {validationResult.errors.length > 0 && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <div className="font-medium text-red-800 mb-1">Issues to fix:</div>
                      {validationResult.errors.map((error, index) => (
                        <div key={index} className="text-red-700">• {error}</div>
                      ))}
                    </div>
                  )}
                  
                  {validationResult.warnings.length > 0 && (
                    <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <div className="font-medium text-yellow-800 mb-1">Suggestions:</div>
                      {validationResult.warnings.map((warning, index) => (
                        <div key={index} className="text-yellow-700">• {warning}</div>
                      ))}
                    </div>
                  )}
                  
                  {validationResult.suggestions.length > 0 && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="font-medium text-blue-800 mb-1">Tips:</div>
                      {validationResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-blue-700">• {suggestion}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Float balance reminder"
            className="h-10"
            maxLength={30}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Keep it concise and descriptive</span>
            <span>{subject.length}/30 characters</span>
          </div>
        </div>

        {/* Optional Enhancements */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-medium flex items-center justify-center">
              {emailType === "internal" ? "7" : "8"}
            </div>
            <h3 className="text-lg font-medium text-orange-600">Optional Enhancements</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Action Type</Label>
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Urgency Level</Label>
              <Select value={selectedUrgencyLevel} onValueChange={setSelectedUrgencyLevel}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((urgency) => (
                    <SelectItem key={urgency} value={urgency}>
                      {urgency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Email Content Section */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          {/* From Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">From</Label>
            <Input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter sender email address"
              className="h-10"
            />
          </div>

          {/* To Field */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">To</Label>
            <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md">
              {recipientList.map((email, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 bg-blue-100 text-blue-800"
                >
                  {email}
                  <button
                    onClick={() => removeRecipient(email)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-2 flex-grow">
                <Input
                  type="email"
                  placeholder="Add recipient email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-grow h-8"
                />
                <Button
                  type="button"
                  onClick={addRecipient}
                  disabled={!newRecipient.trim()}
                  size="sm"
                  className="h-8 px-3"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Message</Label>
              {selectedActionType && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const templateData = getTemplateSuggestion(selectedActionType, {
                      department: selectedDepartment,
                      product: selectedProductLine,
                      subject: subject
                    })
                    if (templateData) {
                      setMessage(templateData)
                    }
                  }}
                  className="text-xs"
                >
                  Get Template
                </Button>
              )}
            </div>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your email message here..."
              className="min-h-[200px] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" size="lg">
              Save Draft
            </Button>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSend}
              disabled={isSending}
            >
              {isSending ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
