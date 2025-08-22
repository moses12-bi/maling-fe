"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { X, Shield, Mail, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface OTPVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onVerify: (otp: string) => void
  senderEmail: string
  isLoading?: boolean
  onResendOTP: () => void
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
  onVerify,
  senderEmail,
  isLoading = false,
  onResendOTP,
}: OTPVerificationModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [resendCount, setResendCount] = useState(0)
  const [isResendDisabled, setIsResendDisabled] = useState(true)
  const [resendTimer, setResendTimer] = useState(30) // 30 seconds cooldown
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Initialize refs array and start countdown
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsResendDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""])
      setError("")
      setResendCount(0)
      setIsResendDisabled(false)
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [isOpen])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError("")

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "Enter") {
      handleVerify()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text/plain').trim()
    if (/^\d{6}$/.test(pasteData)) {
      const pastedOtp = pasteData.split('').slice(0, 6)
      const newOtp = [...otp]
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char
      })
      setOtp(newOtp)
      setError("")
      inputRefs.current[Math.min(5, pastedOtp.length - 1)]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter a 6-digit verification code")
      return
    }
    
    try {
      setIsVerifying(true)
      setError("")
      await onVerify(otpString)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendClick = async () => {
    try {
      setIsResendDisabled(true)
      setResendTimer(30) // Reset cooldown
      setOtp(["", "", "", "", "", ""])
      setError("")
      
      // Start countdown
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      await onResendOTP()
      inputRefs.current[0]?.focus()
      
      return () => clearInterval(timer)
    } catch (error) {
      setError("Failed to resend OTP. Please try again.")
      setIsResendDisabled(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <h3 className="text-lg font-medium">Verify Your Identity</h3>
                <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to {senderEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
              disabled={isLoading || isVerifying}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">For security, we've sent a verification code to</p>
            <p className="font-medium text-gray-900">{senderEmail}</p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Enter 6-digit verification code</Label>
            <div className="space-y-4 mb-6">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <div key={index} className="relative">
                    <Input
                      ref ={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={cn(
                        "h-14 w-12 text-center text-2xl font-semibold p-0",
                        "border-2 focus:border-blue-500 focus:ring-0",
                        error && "border-red-500"
                      )}
                      autoComplete="one-time-code"
                      disabled={isLoading || isVerifying}
                    />
                    {index === 2 && (
                      <span className="absolute left-full top-1/2 -translate-y-1/2 px-2 text-gray-400">-</span>
                    )}
                  </div>
                ))}
              </div>
              {error && (
                <div className="text-center text-sm text-red-500 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={isLoading || isVerifying || otp.some((digit) => !digit)}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>

            <div className="mt-4 text-center text-sm">
              <p className="text-muted-foreground">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  onClick={handleResendClick}
                  disabled={isResendDisabled || isLoading || isVerifying}
                  className={cn(
                    "font-medium focus:outline-none focus:underline",
                    isResendDisabled
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  )}
                >
                  {isResendDisabled 
                    ? `Resend code in ${resendTimer}s` 
                    : 'Resend code'}
                  {resendCount > 0 && !isResendDisabled && ` (${resendCount})`}
                </button>
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            This verification ensures only authorized users can send emails from this address.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
