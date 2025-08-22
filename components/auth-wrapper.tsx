"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { authAPI } from "../lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [department, setDepartment] = useState("CTK_GEN")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsAuthenticated(authAPI.isAuthenticated())
    setIsLoading(false)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await authAPI.login(username, password)
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Login failed:", error)
      alert("Login failed. Please check your credentials.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await authAPI.register({
        username,
        email,
        password,
        firstName,
        lastName,
        department,
      })
      setIsAuthenticated(true)
    } catch (error) {
      console.error("Registration failed:", error)
      alert("Registration failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogout = () => {
    authAPI.logout()
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
    setEmail("")
    setFirstName("")
    setLastName("")
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">{showLogin ? "Login to Centrika" : "Register for Centrika"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>

              {!showLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Please wait..." : showLogin ? "Login" : "Register"}
              </Button>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setShowLogin(!showLogin)}>
                {showLogin ? "Need an account? Register" : "Have an account? Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Centrika Email Management</h1>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {children}
    </div>
  )
}
