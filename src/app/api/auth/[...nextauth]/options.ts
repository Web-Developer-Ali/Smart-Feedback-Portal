import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { query } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

// Environment variables validation
const getEnvVar = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

// Zod schema for login validation
const credentialsSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: getEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
      allowDangerousEmailAccountLinking: true,
    }),

    // Email & Password
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate with Zod
          const { email, password } = credentialsSchema.parse(credentials)

          const { rows } = await query(
            `SELECT id, email, full_name, email_verified, password_hash, avatar_url
             FROM users
             WHERE email = $1`,
            [email.toLowerCase().trim()]
          )

          const user = rows[0]
          if (!user) {
            throw new Error("No account found with this email")
          }

          if (!user.password_hash) {
            throw new Error("This account was created with Google. Please sign in with Google.")
          }

          const isValid = await bcrypt.compare(password, user.password_hash)
          if (!isValid) {
            throw new Error("Invalid password")
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            isVerified: user.email_verified,
            avatar: user.avatar_url,
          }
        } catch (err) {
          // Zod validation errors
          if (err instanceof z.ZodError) {
            throw new Error(err.errors[0].message)
          }

          // Auth errors
          if (err instanceof Error) {
            throw new Error(err.message)
          }

          throw new Error("Something went wrong, please try again")
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // 24 hours
  },

  callbacks: {
    async jwt({ token, user, account, profile }) {
      // Handle Google OAuth
      if (account?.provider === "google" && profile) {
        try {
          const email = profile.email?.toLowerCase().trim()
          if (!email) return token

          const { rows } = await query(
            `SELECT id, email_verified, avatar_url 
             FROM users 
             WHERE email = $1`,
            [email]
          )

          let dbUser = rows[0]

          if (!dbUser) {
            // Create Google user
            const { rows: newUser } = await query(
              `INSERT INTO users (
                email,
                full_name,
                email_verified,
                avatar_url,
                auth_provider,
                created_at,
                updated_at
              )
              VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
              RETURNING id, email_verified, avatar_url`,
              [
                email,
                profile.name,
                true, // Google users are auto-verified
                (profile)?.picture || null,
                "google",
              ]
            )
            dbUser = newUser[0]
            token.isNewUser = true
          } else {
            token.isNewUser = false
          }

          token.id = dbUser.id
          token.isVerified = dbUser.email_verified
          token.avatar = dbUser.avatar_url
          return token
        } catch (error) {
          console.error("Google OAuth error:", error)
          return token
        }
      }

      // Credentials login
      if (user) {
        token.id = user.id
        token.isVerified = user.isVerified
        token.avatar = user.avatar
        token.isNewUser = false
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.isVerified = token.isVerified as boolean
        session.user.avatar = token.avatar as string
      }
      return session
    },

    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in")
        }
        return true
      }

      if (account?.provider === "google") {
        return !!user.email
      }

      return true
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl)
        ? `${baseUrl}/dashboard`
        : url.startsWith("/")
        ? `${baseUrl}${url}`
        : baseUrl
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },

  secret: getEnvVar("NEXTAUTH_SECRET"),
  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",
}

export default NextAuth(authOptions)
