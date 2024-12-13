"use client"

import * as z from "zod"
import { Icons } from "@/components/ui/icons"

export const passwordRules = [
  {
    id: "minLength",
    label: "Pelo menos 8 caracteres",
    regex: /.{8,}/,
  },
  {
    id: "uppercase",
    label: "Uma letra maiúscula",
    regex: /[A-Z]/,
  },
  {
    id: "lowercase",
    label: "Uma letra minúscula",
    regex: /[a-z]/,
  },
  {
    id: "number",
    label: "Um número",
    regex: /[0-9]/,
  },
  {
    id: "special",
    label: "Um caractere especial",
    regex: /[^A-Za-z0-9]/,
  },
] as const

export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres")
  .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
  .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
  .regex(/[0-9]/, "A senha deve conter pelo menos um número")
  .regex(
    /[^A-Za-z0-9]/,
    "A senha deve conter pelo menos um caractere especial"
  )

interface PasswordRulesProps {
  password: string
  showRules: boolean
}

export function PasswordRules({ password, showRules }: PasswordRulesProps) {
  if (!showRules) return null

  return (
    <div className="space-y-1">
      {passwordRules.map((rule) => {
        const isValid = rule.regex.test(password)
        return (
          <div
            key={rule.id}
            className="flex items-center space-x-2 text-sm"
          >
            {isValid ? (
              <Icons.check className="h-4 w-4 text-green-500" />
            ) : (
              <Icons.circle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={
                isValid
                  ? "text-green-500"
                  : "text-muted-foreground"
              }
            >
              {rule.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
