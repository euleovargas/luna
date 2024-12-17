import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 10

// Cache da conexão entre invocações da função
let cachedClient: MongoClient | null = null

async function getMongoClient() {
  if (cachedClient) {
    return cachedClient
  }

  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error('DATABASE_URL não configurada')
  }

  cachedClient = new MongoClient(uri, {
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 5000,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 5000,
  })

  await cachedClient.connect()
  return cachedClient
}

export async function GET() {
  const start = Date.now()
  let client: MongoClient | null = null
  
  try {
    console.log("Iniciando conexão...", Date.now() - start, "ms")
    client = await getMongoClient()
    console.log("Conectado!", Date.now() - start, "ms")
    
    const db = client.db()
    const collection = db.collection("User")
    
    const count = await collection.countDocuments()
    console.log("Query executada!", Date.now() - start, "ms")
    
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
