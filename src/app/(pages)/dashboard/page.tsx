"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, Briefcase, Mail, Building, Loader2, AlertCircle, Globe, Folder } from "lucide-react"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: "client" | "agency"
  company_name: string | null
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          console.error("User fetch error:", userError)
          router.push("/login")
          return
        }

        if (!user) {
          router.push("/login")
          return
        }

        setUser(user)

        // Get user profile
        const { data: profile, error: profileFetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileFetchError) {
          console.error("Profile fetch error:", profileFetchError)

          // Handle specific error cases
          if (profileFetchError.code === "PGRST116") {
            // Profile not found - create a basic profile
            setProfileError("Profile not found. Creating basic profile...")

            const { error: createError } = await supabase.from("profiles").insert({
              id: user.id,
              email: user.email!,
              full_name: user.user_metadata?.full_name || "",
            })

            if (createError) {
              console.error("Profile creation error:", createError)
              setProfileError("Failed to create profile. Please try refreshing the page.")
            } else {
              // Retry fetching the profile
              const { data: newProfile, error: retryError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single()

              if (retryError) {
                setProfileError("Failed to load profile after creation.")
              } else {
                setProfile(newProfile)
                setProfileError(null)
              }
            }
          } else {
            setProfileError(`Profile error: ${profileFetchError.message}`)
          }
        } else {
          setProfile(profile)
          setProfileError(null)
        }
      } catch (error) {
        console.error("Auth error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Show success toast if redirected from login
    const success = searchParams.get("success")
    if (success) {
      toast.success(success)
    }
  }, [supabase, router, searchParams])

  const getRoleIcon = (role: string) => {
    return role === "agency" ? <Briefcase className="h-4 w-4" /> : <Users className="h-4 w-4" />
  }

  const getRoleColor = (role: string) => {
    return role === "agency" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
  }

 const handleSignOut = async () => {
  try {
    const result = await signOut()

    if (!result.success) {
      throw new Error(result.message || "Unknown error during sign out")
    }

    // Clear local state
    setUser(null)
    setProfile(null)

    // Redirect to login page
    router.push("/login")
    toast.success(result.message)
  } catch (error) {
    console.error("Error signing out:", error)
    toast.error("Failed to sign out. Please try again.")
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (profileError && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Profile Error
            </CardTitle>
            <CardDescription>{profileError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full bg-transparent"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create a fallback profile if profile is still null
  const displayProfile = profile || {
    id: user.id,
    email: user.email!,
    full_name: user.user_metadata?.full_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    role: "client" as const,
    company_name: null,
    created_at: user.created_at,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {displayProfile.full_name || user.email}</p>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 bg-transparent"
          >
            Sign Out
          </Button>
        </div>

        {profileError && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{profileError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={displayProfile.avatar_url || ""} />
                  <AvatarFallback>
                    {displayProfile.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("") || user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Account Type</span>
                <Badge className={`${getRoleColor(displayProfile.role)} flex items-center gap-1`}>
                  {getRoleIcon(displayProfile.role)}
                  {displayProfile.role === "agency" ? "Agency" : "Client"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{displayProfile.email}</p>
                  </div>
                </div>

                {displayProfile.company_name && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{displayProfile.role === "agency" ? "Agency" : "Company"}</p>
                      <p className="text-sm text-gray-600">{displayProfile.company_name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Member since</span>
                  <span className="text-gray-900">{new Date(displayProfile.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-500">Last sign in</span>
                  <span className="text-gray-900">{new Date(user.last_sign_in_at || "").toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                {displayProfile.role === "agency" ? "Manage your agency services" : "Find and hire agencies"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayProfile.role === "agency" ? (
                <>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Manage Services
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View Clients
                  </Button>
                </>
              ) : (
                <>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Agencies
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Briefcase className="h-4 w-4 mr-2" />
                    My Projects
                  </Button>
                </>
              )}
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/features">
                  <Globe className="h-4 w-4 mr-2" />
                  View Features
                </Link>
              </Button>
              <Button asChild className="w-full justify-start bg-transparent" variant="outline">
                <Link href="/project-structure">
                  <Folder className="h-4 w-4 mr-2" />
                  Project Structure
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}