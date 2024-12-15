import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { db } from "@/lib/db"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { Adapter } from "next-auth/adapters"
import { verifyJwt } from "./jwt"
import { User } from "next-auth"

const prismaAdapter = PrismaAdapter(db) as Adapter

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid",
          access_type: "offline",
          response_type: "code"
        },
      },
      async profile(profile: any): Promise<User> {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: UserRole.USER,
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        try {
          // Verificar se é um login por token de verificação
          if (credentials?.token) {
            const verifiedToken = verifyJwt(credentials.token);
            if (!verifiedToken || !verifiedToken.email) {
              console.error("[TOKEN_VERIFY_ERROR] Token inválido ou sem email");
              return null;
            }

            const user = await db.user.findUnique({
              where: { email: verifiedToken.email },
              select: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                emailVerified: true,
              },
            });

            if (!user || !user.emailVerified) {
              console.error("[TOKEN_VERIFY_ERROR] Usuário não encontrado ou email não verificado");
              return null;
            }

            return user;
          }

          // Login normal com email e senha
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              password: true,
            },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          const { password, ...userWithoutPass } = user;
          return userWithoutPass;
        } catch (error) {
          console.error("[AUTHORIZE_ERROR]", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false
        }

        try {
          const userExists = await db.user.findUnique({
            where: {
              email: user.email,
            },
          })

          if (!userExists) {
            await db.user.create({
              data: {
                email: user.email ?? '',
                name: user.name ?? 'User',
                image: user.image ?? '',
                role: UserRole.USER,
              },
            })
          }

          return true
        } catch (error) {
          console.error("Error checking if user exists: ", error)
          return false
        }
      }

      return true
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
        session.user.role = token.role as UserRole
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
  },
}
