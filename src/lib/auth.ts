import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { CustomToken } from "@/types"

/**
 * Configuração do NextAuth
 * 
 * Inclui:
 * - Autenticação por credenciais (email/senha)
 * - Autenticação com Google
 * - Adaptador Prisma para persistência
 * - Callbacks personalizados para sessão e JWT
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
          access_type: "offline",
          response_type: "code"
        },
      },
      async profile(profile: any): Promise<any> {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER",
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
          },
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    /**
     * Callback de autorização de login
     * Permite login via Google ou credenciais
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        return true
      }

      if (account?.provider === "credentials" && user) {
        return true
      }

      return false
    },

    /**
     * Callback de sessão
     * Gerencia a atualização da sessão do usuário
     * 
     * @param session - Sessão atual
     * @param token - Token JWT
     * @param trigger - Tipo de atualização ('update' ou undefined)
     * @param newSession - Nova sessão em caso de update
     */
    async session({ session, token, trigger, newSession }) {
      // Se a sessão está sendo atualizada via update()
      if (trigger === "update" && newSession) {
        return newSession as any
      }

      // Caso contrário, use o token
      const customToken = token as CustomToken
      if (customToken) {
        session.user.id = customToken.sub
        session.user.name = customToken.name || ""
        session.user.email = customToken.email || ""
        session.user.image = customToken.image
        session.user.role = customToken.role
      }

      return session
    },

    /**
     * Callback de JWT
     * Gerencia a atualização do token JWT
     * 
     * @param token - Token atual
     * @param user - Dados do usuário
     * @param trigger - Tipo de atualização ('update' ou undefined)
     * @param session - Sessão em caso de update
     */
    async jwt({ token, user, trigger, session }) {
      // Se o token está sendo atualizado via update()
      if (trigger === "update" && session) {
        return {
          ...token,
          ...session.user,
        }
      }

      // Se é um novo login
      if (user) {
        return {
          ...token,
          sub: user.id,
          role: user.role,
          image: user.image,
        }
      }

      return token
    },
  },
}
