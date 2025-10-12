import NextAuth, { NextAuthOptions, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Environment variables validation
const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing environment variable: ${key}`);
  return value;
};

// Zod schema for login validation
const credentialsSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: getEnvVar("GOOGLE_CLIENT_ID"),
      clientSecret: getEnvVar("GOOGLE_CLIENT_SECRET"),
      allowDangerousEmailAccountLinking: true,
    }),

    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials);

          const { rows } = await query(
            `SELECT id, email, full_name, email_verified, password_hash, avatar_url
             FROM users 
             WHERE email = $1`,
            [email.toLowerCase().trim()]
          );

          const user = rows[0];
          if (!user) {
            throw new Error("No account found with this email");
          }

          if (!user.password_hash) {
            throw new Error(
              "This account was created with Google. Please sign in with Google."
            );
          }

          const isValid = await bcrypt.compare(
            password,
            String(user.password_hash)
          );
          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: String(user.id),
            email: String(user.email),
            name: String(user.full_name || ""),
            isVerified: Boolean(user.email_verified),
            avatar: String(user.avatar_url || ""),
          } as User;
        } catch (err) {
          if (err instanceof z.ZodError) {
            throw new Error(err.errors[0].message);
          }
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error("Something went wrong, please try again");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  callbacks: {
    async jwt({ token, user, account, profile, trigger }) {
      // ✅ FIX: Handle session updates
      if (trigger === "update") {
        // Refresh user data from database
        try {
          const { rows } = await query(
            `SELECT id, email_verified, avatar_url 
             FROM users 
             WHERE id = $1`,
            [token.id]
          );

          const dbUser = rows[0];
          if (dbUser) {
            token.isVerified = Boolean(dbUser.email_verified);
            token.avatar = String(dbUser.avatar_url || "");
          }
        } catch (error) {
          console.error("Token update error:", error);
        }
      }

      // Handle Google OAuth
      if (account?.provider === "google" && profile) {
        try {
          const email = profile.email?.toLowerCase().trim();
          if (!email) return token;

          const { rows } = await query(
            `SELECT id, email_verified, avatar_url 
             FROM users 
             WHERE email = $1`,
            [email]
          );

          let dbUser = rows[0];

          if (!dbUser) {
            const { rows: newUser } = await query(
              `INSERT INTO users (
                email, full_name, email_verified, avatar_url, 
                auth_provider, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
              RETURNING id, email_verified, avatar_url`,
              [email, profile.name, true, profile.picture || null, "google"]
            );
            dbUser = newUser[0];
            token.isNewUser = true;
          } else {
            token.isNewUser = false;
          }

          token.id = String(dbUser.id);
          token.isVerified = Boolean(dbUser.email_verified);
          token.avatar = String(dbUser.avatar_url || "");
          token.provider = "google"; // ✅ ADDED: Set provider in token
          return token;
        } catch (error) {
          console.error("Google OAuth error:", error);
          return token;
        }
      }

      // Credentials login
      if (user) {
        token.id = String(user.id);
        token.isVerified = Boolean(user.isVerified);
        token.avatar = String(user.avatar || "");
        token.isNewUser = false;
        token.provider = "credentials"; // ✅ ADDED: Set provider in token
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.id);
        session.user.email = String(token.email);
        session.user.name = String(token.name || "");
        session.user.isVerified = Boolean(token.isVerified);
        session.user.avatar = String(token.avatar || "");
        session.user.provider = String(token.provider || "");
      }
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        if (!user.isVerified) {
          throw new Error("Please verify your email before signing in");
        }
        return true;
      }

      if (account?.provider === "google") {
        return !!user.email;
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      // ✅ FIX: Improved redirect logic
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },

  secret: getEnvVar("NEXTAUTH_SECRET"),
  useSecureCookies: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV === "development",

  // ✅ ADDED: Critical for production
  //  cookies: {
  //   sessionToken: {
  //     name: `next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //       // Add domain for production if using custom domain
  //       ...(process.env.NODE_ENV === "production" && process.env.NEXTAUTH_URL?.includes('yourdomain.com')
  //         ? { domain: '.yourdomain.com' }
  //         : {}
  //       ),
  //     },
  //   },
  // },

  // cookies for test production
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Remove domain for local development
      },
    },
  },
};

export default NextAuth(authOptions);
