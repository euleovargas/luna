import { Metadata } from "next"
import { LoginPage } from "./login-page"

export const metadata: Metadata = {
  title: "Login | Luna",
  description: "Faça login na sua conta",
}

export default function Page() {
  return <LoginPage />
}