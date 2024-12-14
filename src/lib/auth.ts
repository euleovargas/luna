import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { db } from "@/lib/db"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { Adapter } from "next-auth/adapters"
import { verifyJwt } from "./jwt"

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
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified,
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
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                image: user.image,
                emailVerified: new Date(),
              },
            })
          } else {
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
              },
            })
          }
        } catch (error) {
          console.error("[GOOGLE_SIGNIN_ERROR]", error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.sub as string,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: token.role as UserRole,
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
}
