import { NextResponse } from "next/server"

const MODEL = "gemini-2.5-flash" // Correct model confirmed by /v1beta/models endpoint

async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)
      
      // If 503 (overloaded) and we have retries left, wait and retry
      if (response.status === 503 && i < retries) {
        console.log(`Gemini API overloaded, retrying in ${delay}ms... (${i + 1}/${retries})`)
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return response
    } catch (error) {
      if (i === retries) throw error
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries reached")
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
    }

    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid or empty prompt" }, { status: 400 })
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }

    const resp = await fetchWithRetry(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }, 2, 1500)

    if (!resp.ok) {
      const errText = await resp.text()
      
      // Better error messages for common issues
      if (resp.status === 503) {
        return NextResponse.json(
          { error: "Gemini API is currently overloaded. Please try again in a moment." },
          { status: 503 }
        )
      }
      
      return NextResponse.json(
        { error: `Gemini API error: ${resp.status} ${errText}` },
        { status: 502 }
      )
    }

    const data = await resp.json()
    // Safely extract text from candidates
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text)?.filter(Boolean)?.join("\n") ||
      data?.candidates?.[0]?.output ||
      "No response from Gemini."

    return NextResponse.json({ output: text })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unexpected error" }, { status: 500 })
  }
}
