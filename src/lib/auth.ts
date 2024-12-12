import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { db } from "@/lib/db"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { UserRole } from "@prisma/client"
import { Adapter } from "next-auth/adapters"

// Criando um adapter tipado corretamente
const prismaAdapter = PrismaAdapter(db) as Adapter

export const authOptions: NextAuthOptions = {
  adapter: prismaAdapter,
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/error",
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
        console.log("=== Google Profile Raw ===", profile);

        // Primeiro, vamos verificar se já existe um usuário com este email
        const existingUser = await db.user.findUnique({
          where: { email: profile.email }
        });

        // Se existir, vamos atualizar a imagem
        if (existingUser) {
          const updatedUser = await db.user.update({
            where: { email: profile.email },
            data: { image: profile.picture }
          });
          console.log("=== Updated User ===", updatedUser);
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: profile.email_verified
        };
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        console.log("=== Google Sign In ===");
        console.log("Profile:", JSON.stringify(profile, null, 2));
        console.log("User:", JSON.stringify(user, null, 2));
        console.log("Account:", JSON.stringify(account, null, 2));
        
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        });

        console.log("Existing User:", JSON.stringify(existingUser, null, 2));

        // Se não existir usuário, cria um novo
        if (!existingUser) {
          console.log("Creating new user with image:", user.image);
          const newUser = await db.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              emailVerified: new Date(),
              accounts: {
                create: {
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              },
            },
            include: { accounts: true }
          });
          
          console.log("Created User:", JSON.stringify(newUser, null, 2));
          return true;
        }

        // Se existir usuário mas não tiver conta Google vinculada
        const existingAccount = await db.account.findFirst({
          where: {
            userId: existingUser.id,
            provider: account.provider,
          },
        });

        if (!existingAccount) {
          console.log("Updating existing user with image:", user.image);
          
          // Atualiza a imagem do usuário existente com a do Google
          const updatedUser = await db.user.update({
            where: { id: existingUser.id },
            data: { 
              image: user.image,
              emailVerified: new Date()
            },
            include: { accounts: true }
          });
          
          console.log("Updated User:", JSON.stringify(updatedUser, null, 2));

          await db.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });
        } else {
          // Mesmo que a conta já exista, vamos atualizar a imagem
          console.log("Updating existing user image:", user.image);
          const updatedUser = await db.user.update({
            where: { id: existingUser.id },
            data: { 
              image: user.image
            }
          });
          console.log("Updated User:", JSON.stringify(updatedUser, null, 2));
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        return {
          ...token,
          role: user.role,
          id: user.id,
          picture: user.image
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole;
        session.user.id = token.id as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamento para a URL de callback após o login
      if (url.includes('/login')) {
        return baseUrl + '/dashboard'
      }
      
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      
      return baseUrl
    },
  },
}
