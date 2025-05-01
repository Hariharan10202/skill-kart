"use client"

import * as React from "react"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Define the login schema
const loginSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

// Define the register schema
const registerSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

export function AuthForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tabValue, setTabValue] = useState<"login" | "register">("login")
  const router = useRouter()

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
  })

  async function onLoginSubmit(values: LoginFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onRegisterSubmit(values: RegisterFormValues) {
    setIsLoading(true)

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registerData } = values

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      })

      if (!response.ok) {
        throw new Error("Registration failed. Username might already be taken.")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs 
      defaultValue="login" 
      value={tabValue} 
      onValueChange={(value) => setTabValue(value as "login" | "register")}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              disabled={isLoading}
              {...loginForm.register("username")}
            />
            {loginForm.formState.errors.username && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              {...loginForm.register("password")}
            />
            {loginForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="register">
        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              disabled={isLoading}
              {...registerForm.register("name")}
            />
            {registerForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-username">Username</Label>
            <Input
              id="register-username"
              placeholder="johndoe"
              disabled={isLoading}
              {...registerForm.register("username")}
            />
            {registerForm.formState.errors.username && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              disabled={isLoading}
              {...registerForm.register("password")}
            />
            {registerForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              disabled={isLoading}
              {...registerForm.register("confirmPassword")}
            />
            {registerForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {registerForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  )
}