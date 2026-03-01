import { NextRequest, NextResponse } from "next/server"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt } = await req.json()

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key not configured" }, { status: 500 })
    }

    // UPDATED MODEL: Using the specific model requested by the user.
    // NOTE: This is an embedding model. If this call to chat/completions fails,
    // it's because the model doesn't support the chat completion endpoint.
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://curiosity-engine.vercel.app",
        "X-Title": "Curiosity Engine",
      },
      body: JSON.stringify({
        model: "nvidia/llama-nemotron-embed-vl-1b-v2:free",
        messages: [
          { role: "system", content: systemPrompt || "You are a helpful AI coding assistant." },
          ...messages,
        ],
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("AI Route Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


