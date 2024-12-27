"use client"

import * as React from "react"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          tabIndex={-1}
        >
          {showPassword ? (
            <Icons.eyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Icons.eye className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Esconder senha" : "Mostrar senha"}
          </span>
        </Button>
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
