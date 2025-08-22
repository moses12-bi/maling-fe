"use client"

import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, KeyboardEvent, useRef } from "react"

interface RecipientInputProps {
  recipients: string[]
  onChange: (emails: string[]) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function RecipientInput({
  recipients = [],
  onChange,
  placeholder = "name@example.com",
  disabled = false,
  className
}: RecipientInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  const handleAdd = (email: string) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && validateEmail(trimmedEmail) && !recipients.includes(trimmedEmail)) {
      onChange([...recipients, trimmedEmail])
      setInputValue('')
    }
  }
  
  const handleRemove = (index: number) => {
    const newRecipients = [...recipients]
    newRecipients.splice(index, 1)
    onChange(newRecipients)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAdd(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && recipients.length > 0) {
      handleRemove(recipients.length - 1)
    }
  }
  const handleBlur = () => {
    if (inputValue.trim()) {
      handleAdd(inputValue)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className={cn(
          "flex flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {recipients.map((email, index) => (
          <div
            key={`${email}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
          >
            <span>{email}</span>
            <button
              type="button"
              className="ml-1 rounded-full p-0.5 hover:bg-black/10"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(index)
              }}
              disabled={disabled}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="email"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={recipients.length === 0 ? placeholder : ''}
          className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        />
      </div>
    </div>
  )
}
