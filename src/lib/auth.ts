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
import { JWT } from "next-auth/jwt"

interface CustomToken extends JWT {
  sub: string
  role: UserRole
  image: string | null
}

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

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("[AUTH_ERROR]", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Permitir login com Google
      if (account?.provider === "google") {
        return true;
      }

      // Verificar se é um login por token
      if (account?.provider === "credentials" && user) {
        return true;
      }

      return false;
    },
    async session({ session, token }) {
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
    async jwt({ token, user }) {
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
