import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import type { Message } from "@/types/chat"

export async function GET() {
  try {
    const db = await getDatabase()
    const messages = await db.collection("messages").find({}).sort({ timestamp: 1 }).toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, sender } = body

    if (!text || !sender) {
      return NextResponse.json({ error: "Text and sender are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Save user message
    const userMessage: Omit<Message, "_id"> = {
      text,
      sender,
      timestamp: new Date(),
    }

    const userResult = await db.collection("messages").insertOne(userMessage)
    const savedUserMessage = {
      _id: userResult.insertedId.toString(),
      ...userMessage,
    }

    // Generate AI response using Gemini
    let aiResponse = ""
    try {
      const { text: generatedText } = await generateText({
        model: google("gemini-1.5-flash"),
        prompt: `You are a helpful and friendly AI assistant. Respond to the user's message in a conversational and helpful manner. User message: "${text}"`,
        maxTokens: 150,
      })
      aiResponse = generatedText
    } catch (aiError) {
      console.error("Error generating AI response:", aiError)
      aiResponse = "I'm sorry, I'm having trouble responding right now. Please try again later."
    }

    // Save AI response
    const botMessage: Omit<Message, "_id"> = {
      text: aiResponse,
      sender: "bot",
      timestamp: new Date(),
    }

    const botResult = await db.collection("messages").insertOne(botMessage)
    const savedBotMessage = {
      _id: botResult.insertedId.toString(),
      ...botMessage,
    }

    return NextResponse.json({
      userMessage: savedUserMessage,
      botMessage: savedBotMessage,
    })
  } catch (error) {
    console.error("Error saving message:", error)
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 })
  }
}
