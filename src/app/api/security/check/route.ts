import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { checkBlockedIP } from "@/lib/security"

export async function GET() {
  const headersList = headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"

  try {
    const isBlocked = await checkBlockedIP(ip)
    if (isBlocked) {
      return NextResponse.json(
        { error: "IP blocked due to suspicious activity" },
        { status: 403 }
      )
    }
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("Error checking IP:", error)
    return NextResponse.json({ status: "ok" }) // Falha segura
  }
}
