import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const start = Date.now()
  
  try {
    // Tenta conectar diretamente ao MongoDB
    const client = new MongoClient(process.env.DIRECT_URL || "")
    console.log("Conectando ao MongoDB...", Date.now() - start, "ms")
    
    await client.connect()
    console.log("Conectado ao MongoDB!", Date.now() - start, "ms")
    
    const db = client.db()
    const collection = db.collection("User")
    
    // Faz uma query simples
    const count = await collection.countDocuments()
    console.log("Query executada!", Date.now() - start, "ms")
    
    await client.close()
    console.log("Conexão fechada!", Date.now() - start, "ms")
    
    return NextResponse.json({ 
      success: true,
      count,
      time: Date.now() - start
    })
    
  } catch (error) {
    console.error("Erro:", error)
    return NextResponse.json({ 
      error: "Erro ao conectar com MongoDB",
      details: error instanceof Error ? error.message : "Erro desconhecido",
      time: Date.now() - start
    }, { status: 500 })
  }
}
