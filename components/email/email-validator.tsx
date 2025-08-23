"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface ValidationResult {
  isValid: boolean
  issues: string[]
  suggestions: string[]
  characterCount: number
  parts: {
    prefix?: string
    department?: string
    product?: string
    subject?: string
    action?: string
    urgency?: string
  }
}

export function EmailValidator() {
  const [subjectLine, setSubjectLine] = useState("")
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const validateSubjectLine = (subject: string): ValidationResult => {
    const issues: string[] = []
    const suggestions: string[] = []
    const parts: ValidationResult["parts"] = {}

    // Check if it starts with CTK-
    if (!subject.startsWith("CTK-")) {
      issues.push('Subject line must start with "CTK-"')
    } else {
      parts.prefix = "CTK-"
    }

    // Check character count
    const characterCount = subject.length
    if (characterCount > 78) {
      issues.push(`Subject line is ${characterCount - 78} characters too long`)
      suggestions.push("Consider shortening the subject description")
    }

    // Parse the subject line structure
    const regex = /^CTK-([A-Z]+)-([A-Z]+)\s*-\s*(.+?)\s*-\s*([A-Z]+)(?:\s*-\s*([A-Z]+))?$/
    const match = subject.match(regex)

    if (!match) {
      issues.push("Subject line does not follow the correct format")
      suggestions.push("Use format: CTK-[DEPT]-[PRODUCT] - [Subject] - [ACTION] - [URGENCY]")
    } else {
      const [, dept, product, subjectDesc, action, urgency] = match
      parts.department = dept
      parts.product = product
      parts.subject = subjectDesc
      parts.action = action
      parts.urgency = urgency

      // Validate department codes
      const validDepts = [
        "RISK",
        "COMP",
        "PROD",
        "CUST",
        "FINC",
        "LEGAL",
        "TECH",
        "MARK",
        "COMM",
        "HR",
        "CEO",
        "EXEC",
        "GEN",
        "EXT",
        "IN",
      ]
      if (!validDepts.some((d) => dept.includes(d))) {
        issues.push(`"${dept}" is not a recognized department code`)
      }

      // Validate product codes
      const validProducts = ["GWAY", "WALT", "CARD", "CRED", "TRANS", "EVENT", "ALL", "COMP", "TECH", "FUND", "PROJ"]
      if (!validProducts.includes(product)) {
        issues.push(`"${product}" is not a recognized product code`)
      }

      // Validate action types
      const validActions = ["ACTION", "DECISION", "REVIEW", "APPROVAL", "MEETING", "INFO"]
      if (!validActions.includes(action)) {
        issues.push(`"${action}" is not a recognized action type`)
      }

      // Validate urgency levels
      if (urgency) {
        const validUrgency = ["URGENT", "HIGH", "LOW"]
        if (!validUrgency.includes(urgency)) {
          issues.push(`"${urgency}" is not a recognized urgency level`)
        }
      }

      // Check subject description
      if (subjectDesc.length < 5) {
        issues.push("Subject description is too short")
        suggestions.push("Provide a more descriptive subject (at least 5 characters)")
      }

      if (subjectDesc.toLowerCase().includes("urgent") && urgency !== "URGENT") {
        suggestions.push('Consider using URGENT urgency level instead of "urgent" in subject')
      }
    }

    // Additional checks
    if (subject.includes("!!")) {
      issues.push("Avoid using multiple exclamation marks")
      suggestions.push("Use urgency levels instead of exclamation marks")
    }

    if (subject.toLowerCase().includes("asap")) {
      suggestions.push('Use urgency levels instead of "ASAP"')
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions,
      characterCount,
      parts,
    }
  }

  const handleValidate = () => {
    if (subjectLine.trim()) {
      const result = validateSubjectLine(subjectLine.trim())
      setValidationResult(result)
    }
  }

  const getStatusIcon = () => {
    if (!validationResult) return null

    if (validationResult.isValid) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else if (validationResult.issues.length > 0) {
      return <XCircle className="h-5 w-5 text-red-500" />
    } else {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif">Email Subject Line Validator</CardTitle>
          <CardDescription>Check if your email subject line follows Centrika standards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your email subject line here..."
              value={subjectLine}
              onChange={(e) => setSubjectLine(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{subjectLine.length}/78 characters</span>
              <Button onClick={handleValidate} disabled={!subjectLine.trim()}>
                Validate Subject Line
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif">
              {getStatusIcon()}
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status Badge */}
            <div>
              <Badge variant={validationResult.isValid ? "default" : "destructive"} className="mb-4">
                {validationResult.isValid ? "Valid Format" : "Issues Found"}
              </Badge>
            </div>

            {/* Character Count */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Character Count:</span>
              <Badge variant={validationResult.characterCount > 78 ? "destructive" : "secondary"}>
                {validationResult.characterCount}/78
              </Badge>
            </div>

            {/* Parsed Parts */}
            {Object.keys(validationResult.parts).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detected Components:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {validationResult.parts.department && (
                    <div>
                      Department: <Badge variant="outline">{validationResult.parts.department}</Badge>
                    </div>
                  )}
                  {validationResult.parts.product && (
                    <div>
                      Product: <Badge variant="outline">{validationResult.parts.product}</Badge>
                    </div>
                  )}
                  {validationResult.parts.action && (
                    <div>
                      Action: <Badge variant="outline">{validationResult.parts.action}</Badge>
                    </div>
                  )}
                  {validationResult.parts.urgency && (
                    <div>
                      Urgency: <Badge variant="outline">{validationResult.parts.urgency}</Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issues */}
            {validationResult.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Issues Found:</h4>
                <ul className="space-y-1">
                  {validationResult.issues.map((issue, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-yellow-600">Suggestions:</h4>
                <ul className="space-y-1">
                  {validationResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Example Valid Formats */}
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Example Valid Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="rounded bg-muted p-2 font-mono">
              CTK-RISK-ALL - Q3 Risk Committee Meeting Tomorrow - MEETING - HIGH
            </div>
            <div className="rounded bg-muted p-2 font-mono">
              CTK-CUST-GWAY - Customer Payment Investigation Required - ACTION - URGENT
            </div>
            <div className="rounded bg-muted p-2 font-mono">
              CTK-EXT-BNR-ALL - Monthly Statistical Return Submission - INFO
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 