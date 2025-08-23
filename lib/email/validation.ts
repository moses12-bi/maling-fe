// Comprehensive Email Validation System for Centrika Standards
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  subjectFormat?: {
    department?: string
    product?: string
    action?: string
    urgency?: string
    externalParty?: string
  }
}

export interface EmailValidationData {
  emailType: 'internal' | 'external' | 'inbound'
  department: string
  product: string
  subject: string
  actionType: string
  urgencyLevel?: string
  externalParty?: string
  customExternalParty?: string
  message: string
  recipients: string[]
  from: string
}

// Valid department codes according to Centrika standards
const VALID_DEPARTMENTS = [
  'CTK-CEO', 'CTK-EXEC', 'CTK-BOARD', 'CTK-FINC', 'CTK-TECH', 'CTK-RISK', 
  'CTK-COMP', 'CTK-PROD', 'CTK-CUST', 'CTK-LEGAL', 'CTK-MARK', 'CTK-COMM', 
  'CTK-INTL', 'CTK-HR', 'CTK-AUDIT', 'CTK-GEN'
]

// Valid product codes according to Centrika standards
const VALID_PRODUCTS = [
  'GWAY', 'WALT', 'CARD', 'CRED', 'XPAY', 'KIOSK', 'SFBS', 'EVENT', 
  'COMP', 'TECH', 'FUND', 'ALL'
]

// Valid action types according to Centrika standards
const VALID_ACTIONS = [
  'ACTION', 'DECISION', 'REVIEW', 'APPROVAL', 'MEETING', 'INFO'
]

// Valid urgency levels according to Centrika standards
const VALID_URGENCY = [
  'URGENT', 'HIGH', 'LOW'
]

// External party validation patterns
const EXTERNAL_PARTY_PATTERNS = {
  regulatory: ['BNR', 'MINICT', 'RDB', 'RURA', 'RSB'],
  financial: ['BK', 'EquityBank', 'AccessBank', 'Unguka', 'BPR'],
  technology: ['Microsoft', 'AWS', 'Visa', 'Mastercard', 'UnionPay', 'MTN', 'Airtel'],
  common: ['Customer', 'Merchant', 'Investor', 'Partner', 'Vendor', 'Media']
}

export function validateEmailFormat(data: EmailValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  // 1. Validate Subject Line Format
  const subjectValidation = validateSubjectLine(data)
  result.errors.push(...subjectValidation.errors)
  result.warnings.push(...subjectValidation.warnings)
  result.suggestions.push(...subjectValidation.suggestions)
  result.subjectFormat = subjectValidation.subjectFormat

  // 2. Validate Subject Line Length
  const generatedSubject = generateSubjectLine(data)
  if (generatedSubject.length > 78) {
    result.errors.push(`Subject line is ${generatedSubject.length - 78} characters too long (max 78 characters)`)
    result.isValid = false
  }

  // 3. Validate Department Code
  if (!VALID_DEPARTMENTS.includes(data.department)) {
    result.errors.push(`Invalid department code: ${data.department}`)
    result.isValid = false
  }

  // 4. Validate Product Code
  if (!VALID_PRODUCTS.includes(data.product)) {
    result.errors.push(`Invalid product code: ${data.product}`)
    result.isValid = false
  }

  // 5. Validate Action Type
  if (!VALID_ACTIONS.includes(data.actionType)) {
    result.errors.push(`Invalid action type: ${data.actionType}`)
    result.isValid = false
  }

  // 6. Validate Urgency Level
  if (data.urgencyLevel && !VALID_URGENCY.includes(data.urgencyLevel)) {
    result.errors.push(`Invalid urgency level: ${data.urgencyLevel}`)
    result.isValid = false
  }

  // 7. Validate External Party (for external/inbound emails)
  if (data.emailType !== 'internal') {
    const externalPartyValidation = validateExternalParty(data)
    result.errors.push(...externalPartyValidation.errors)
    result.warnings.push(...externalPartyValidation.warnings)
  }

  // 8. Validate Email Content
  const contentValidation = validateEmailContent(data)
  result.errors.push(...contentValidation.errors)
  result.warnings.push(...contentValidation.warnings)
  result.suggestions.push(...contentValidation.suggestions)

  // 9. Validate Recipients
  const recipientValidation = validateRecipients(data)
  result.errors.push(...recipientValidation.errors)
  result.warnings.push(...recipientValidation.warnings)

  // Update overall validity
  if (result.errors.length > 0) {
    result.isValid = false
  }

  return result
}

function validateSubjectLine(data: EmailValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  const subject = data.subject.trim()

  // Check if subject is empty
  if (!subject) {
    result.errors.push('Subject line is required')
    result.isValid = false
    return result
  }

  // Check if subject is too short
  if (subject.length < 5) {
    result.warnings.push('Subject line is very short - consider adding more detail')
    result.suggestions.push('Provide a more descriptive subject (at least 5 characters)')
  }

  // Check for vague terms
  const vagueTerms = ['question', 'help', 'issue', 'problem', 'urgent', 'asap', 'important']
  const hasVagueTerms = vagueTerms.some(term => 
    subject.toLowerCase().includes(term)
  )
  
  if (hasVagueTerms) {
    result.warnings.push('Subject contains vague terms - be more specific')
    result.suggestions.push('Replace vague terms with specific details')
  }

  // Check for excessive punctuation
  if ((subject.match(/[!]{2,}/g) || []).length > 0) {
    result.warnings.push('Subject contains excessive punctuation')
    result.suggestions.push('Use professional punctuation - avoid multiple exclamation marks')
  }

  // Check for all caps
  if (subject === subject.toUpperCase() && subject.length > 3) {
    result.warnings.push('Subject is in all caps - use proper case')
    result.suggestions.push('Use proper capitalization for professional communication')
  }

  return result
}

function validateExternalParty(data: EmailValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  if (!data.externalParty) {
    result.errors.push('External party is required for external/inbound emails')
    result.isValid = false
    return result
  }

  // Check if external party is in valid patterns
  const allValidParties = Object.values(EXTERNAL_PARTY_PATTERNS).flat()
  const isValidParty = allValidParties.includes(data.externalParty)

  if (!isValidParty && !data.customExternalParty) {
    result.warnings.push('External party not in standard list - ensure proper naming')
    result.suggestions.push('Use standard external party codes when possible')
  }

  // Validate custom external party name
  if (data.customExternalParty) {
    if (data.customExternalParty.length < 2) {
      result.errors.push('Custom external party name is too short')
      result.isValid = false
    }
    
    if (data.customExternalParty.length > 50) {
      result.warnings.push('Custom external party name is very long')
      result.suggestions.push('Keep external party names concise')
    }
  }

  return result
}

function validateEmailContent(data: EmailValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  const message = data.message.trim()

  // Check if message is empty
  if (!message) {
    result.errors.push('Email message content is required')
    result.isValid = false
    return result
  }

  // Check message length
  if (message.length < 10) {
    result.warnings.push('Email message is very short')
    result.suggestions.push('Provide more detailed information in the message')
  }

  if (message.length > 5000) {
    result.warnings.push('Email message is very long')
    result.suggestions.push('Consider breaking long messages into multiple emails or attachments')
  }

  // Check for unprofessional language
  const unprofessionalTerms = ['hey', 'hi there', 'whats up', 'cool', 'awesome', 'gonna', 'wanna']
  const hasUnprofessionalTerms = unprofessionalTerms.some(term => 
    message.toLowerCase().includes(term)
  )
  
  if (hasUnprofessionalTerms) {
    result.warnings.push('Message contains informal language')
    result.suggestions.push('Use professional language appropriate for business communication')
  }

  // Check for missing action items
  const actionKeywords = ['please', 'request', 'require', 'need', 'action', 'complete', 'review', 'approve']
  const hasActionKeywords = actionKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  )
  
  if (data.actionType !== 'INFO' && !hasActionKeywords) {
    result.warnings.push('Message may be missing clear action items')
    result.suggestions.push('Include specific action items and deadlines when requesting actions')
  }

  return result
}

function validateRecipients(data: EmailValidationData): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  if (!data.recipients || data.recipients.length === 0) {
    result.errors.push('At least one recipient is required')
    result.isValid = false
    return result
  }

  // Validate email format for each recipient
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const invalidEmails = data.recipients.filter(email => !emailRegex.test(email))
  
  if (invalidEmails.length > 0) {
    result.errors.push(`Invalid email format: ${invalidEmails.join(', ')}`)
    result.isValid = false
  }

  // Check for duplicate recipients
  const uniqueRecipients = new Set(data.recipients)
  if (uniqueRecipients.size !== data.recipients.length) {
    result.warnings.push('Duplicate recipients detected')
    result.suggestions.push('Remove duplicate email addresses')
  }

  // Check for too many recipients
  if (data.recipients.length > 20) {
    result.warnings.push('Large number of recipients')
    result.suggestions.push('Consider using BCC for large recipient lists')
  }

  return result
}

function generateSubjectLine(data: EmailValidationData): string {
  let prefix = "CTK-"
  
  if (data.emailType === "internal") {
    prefix += data.department
  } else if (data.emailType === "external") {
    if (data.externalParty && data.customExternalParty) {
      prefix += `EXT-${data.externalParty}${data.customExternalParty.toUpperCase().replace(/\s+/g, "")}`
    } else {
      prefix += `EXT-${data.externalParty}`
    }
  } else {
    if (data.externalParty && data.customExternalParty) {
      prefix += `IN-${data.externalParty}${data.customExternalParty.toUpperCase().replace(/\s+/g, "")}`
    } else {
      prefix += `IN-${data.externalParty}`
    }
  }

  if (data.product) {
    prefix += `-${data.product}`
  }

  if (data.subject) {
    prefix += ` - ${data.subject}`
  }

  if (data.actionType) {
    prefix += ` - ${data.actionType}`
  }

  if (data.urgencyLevel) {
    prefix += ` - ${data.urgencyLevel}`
  }
  
  return prefix
}

// Real-time validation for form fields
export function validateField(field: string, value: string, context?: any): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  }

  switch (field) {
    case 'subject':
      if (!value.trim()) {
        result.errors.push('Subject is required')
        result.isValid = false
      } else if (value.length < 5) {
        result.warnings.push('Subject is very short')
      }
      break

    case 'department':
      if (!VALID_DEPARTMENTS.includes(value)) {
        result.errors.push('Invalid department code')
        result.isValid = false
      }
      break

    case 'product':
      if (!VALID_PRODUCTS.includes(value)) {
        result.errors.push('Invalid product code')
        result.isValid = false
      }
      break

    case 'actionType':
      if (!VALID_ACTIONS.includes(value)) {
        result.errors.push('Invalid action type')
        result.isValid = false
      }
      break

    case 'urgencyLevel':
      if (value && !VALID_URGENCY.includes(value)) {
        result.errors.push('Invalid urgency level')
        result.isValid = false
      }
      break

    case 'externalParty':
      if (context?.emailType !== 'internal' && !value) {
        result.errors.push('External party is required')
        result.isValid = false
      }
      break
  }

  return result
}
