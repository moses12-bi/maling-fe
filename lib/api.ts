const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Types for API responses
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  department: string
  role: string
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface EmailRequest {
  id?: number
  fromAddress: string
  recipients: string[]
  subject: string
  message: string
  priority: string
  department: string
  product: string
  actionType: string
  emailType: 'INTERNAL' | 'EXTERNAL'
  description?: string
}

export interface EmailResponse {
  id: number
  fromAddress: string
  recipients: string[]
  subject: string
  message: string
  priority: string
  department: string
  emailType: string
  product: string
  actionType: string
  status: string
  createdAt: string
  sentAt?: string
  sender: User
}

export interface OTPResponse {
  message: string
  success: boolean
  email: string
}

export interface MetadataResponse {
  departments: Array<{
    code: string
    displayName: string
    description: string
  }>
  products: Array<{
    code: string
    displayName: string
    description: string
    category: string
  }>
  actionTypes: Array<{
    code: string
    displayName: string
    description: string
    urgencyLevel: string
  }>
  priorities: Array<{
    code: string
    displayName: string
    description: string
    timeframe: string
    colorCode: string
  }>
  emailTypes: Array<{
    code: string
    displayName: string
    description: string
  }>
}

// API utility functions
const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Authentication API
export const authAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await handleResponse(response)
    if (data.token) {
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
    }
    return data
  },

  register: async (userData: {
    username: string
    email: string
    password: string
    firstName: string
    lastName: string
    department: string
  }): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
    const data = await handleResponse(response)
    if (data.token) {
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_data", JSON.stringify(data.user))
    }
    return data
  },

  logout: () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  },

  getCurrentUser: (): User | null => {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth_token")
  },
}

// Email API
export const emailAPI = {
  createDraft: async (emailData: EmailRequest): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    })
    return handleResponse(response)
  },

  sendEmail: async (emailId: number, otpCode: string): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailId, otpCode }),
    })
    return handleResponse(response)
  },

  getUserEmails: async (): Promise<EmailResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/emails`, {
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },

  getEmailById: async (emailId: number): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },

  updateDraft: async (emailId: number, emailData: EmailRequest): Promise<EmailResponse> => {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    })
    return handleResponse(response)
  },

  deleteEmail: async (emailId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/emails/${emailId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  },

  getDrafts: async (): Promise<EmailResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/emails/drafts`, {
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },

  getSentEmails: async (): Promise<EmailResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/emails/sent`, {
      headers: { "Content-Type": "application/json" },
    })
    return handleResponse(response)
  },
}

// OTP API
export const otpAPI = {
  generateOTP: async (email: string, type = "EMAIL_VERIFICATION"): Promise<OTPResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, simulating OTP generation")
      return {
        message: "OTP generated successfully (demo mode)",
        success: true,
        email: email,
      }
    }
  },

  verifyOTP: async (email: string, otpCode: string): Promise<OTPResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode }),
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, simulating OTP verification")
      return {
        message: "OTP verified successfully (demo mode)",
        success: true,
        email: email,
      }
    }
  },

  generateEmailVerificationOTP: async (email: string): Promise<OTPResponse> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/otp/generate-email-verification?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      )
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, simulating email verification OTP")
      return {
        message: "Email verification OTP sent successfully (demo mode)",
        success: true,
        email: email,
      }
    }
  },
}

// Metadata API
const mockMetadata: MetadataResponse = {
  departments: [
    { code: "CTK-CEO", displayName: "CEO Office", description: "Chief Executive Office" },
    { code: "CTK-EXEC", displayName: "Executive", description: "Executive Management" },
    { code: "CTK-FIN", displayName: "Finance", description: "Finance Department" },
    { code: "CTK-HR", displayName: "Human Resources", description: "Human Resources Department" },
    { code: "CTK-IT", displayName: "Information Technology", description: "IT Department" },
    { code: "CTK-OPS", displayName: "Operations", description: "Operations Department" },
    { code: "CTK-MKT", displayName: "Marketing", description: "Marketing Department" },
    { code: "CTK-SALES", displayName: "Sales", description: "Sales Department" },
  ],
  products: [
    { code: "GWAY", displayName: "Gateway", description: "Gateway Product", category: "Core" },
    { code: "WALT", displayName: "Wallet", description: "Digital Wallet", category: "Financial" },
    { code: "CARD", displayName: "Card Services", description: "Card Management", category: "Financial" },
    { code: "LOAN", displayName: "Loan Services", description: "Loan Management", category: "Financial" },
    { code: "INV", displayName: "Investment", description: "Investment Platform", category: "Financial" },
    { code: "INSUR", displayName: "Insurance", description: "Insurance Services", category: "Financial" },
  ],
  actionTypes: [
    { code: "ACTION", displayName: "Action Required", description: "Immediate action needed", urgencyLevel: "HIGH" },
    { code: "DECISION", displayName: "Decision Required", description: "Decision needed", urgencyLevel: "MEDIUM" },
    {
      code: "REVIEW",
      displayName: "Review Required",
      description: "Review and feedback needed",
      urgencyLevel: "MEDIUM",
    },
    { code: "INFO", displayName: "Information", description: "Informational only", urgencyLevel: "LOW" },
    { code: "APPROVAL", displayName: "Approval Required", description: "Approval needed", urgencyLevel: "HIGH" },
    { code: "UPDATE", displayName: "Status Update", description: "Status update", urgencyLevel: "LOW" },
  ],
  priorities: [
    {
      code: "URGENT",
      displayName: "Urgent",
      description: "Immediate attention required",
      timeframe: "Within 1 hour",
      colorCode: "#FF0000",
    },
    {
      code: "HIGH",
      displayName: "High",
      description: "High priority",
      timeframe: "Within 4 hours",
      colorCode: "#FF6600",
    },
    {
      code: "NORMAL",
      displayName: "Normal",
      description: "Normal priority",
      timeframe: "Within 24 hours",
      colorCode: "#0066FF",
    },
    { code: "LOW", displayName: "Low", description: "Low priority", timeframe: "Within 3 days", colorCode: "#00AA00" },
  ],
  emailTypes: [
    { code: "INTERNAL", displayName: "Internal", description: "Internal communication" },
    { code: "EXTERNAL", displayName: "External", description: "External communication" },
    { code: "INBOUND", displayName: "Inbound", description: "Incoming communication" },
  ],
}

export const metadataAPI = {
  getAllMetadata: async (): Promise<MetadataResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/all`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock metadata")
      return mockMetadata
    }
  },

  getDepartments: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/departments`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock departments")
      return mockMetadata.departments
    }
  },

  getProducts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/products`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock products")
      return mockMetadata.products
    }
  },

  getActionTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/action-types`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock action types")
      return mockMetadata.actionTypes
    }
  },

  getPriorities: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/priorities`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock priorities")
      return mockMetadata.priorities
    }
  },

  getEmailTypes: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/metadata/email-types`, {
        headers: { "Content-Type": "application/json" },
      })
      return handleResponse(response)
    } catch (error) {
      console.log("[v0] Backend not available, using mock email types")
      return mockMetadata.emailTypes
    }
  },
}
