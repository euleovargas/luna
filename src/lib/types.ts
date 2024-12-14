import { User, UserRole } from "@prisma/client";
import { DefaultSession } from "next-auth";

// Extende o tipo User da sessão do NextAuth para incluir role
declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
    } & DefaultSession["user"];
  }
}

// Tipo para formulário de login
export type LoginFormData = {
  email: string;
  password: string;
};

// Tipo para formulário de registro
export type SignUpFormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

// Tipo para formulário de recuperação de senha
export type ForgotPasswordFormData = {
  email: string;
};

// Tipo para formulário de reset de senha
export type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
  token: string;
};
