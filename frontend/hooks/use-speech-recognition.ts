"use client"

import { useCallback, useState, useRef, useEffect } from "react"

type UseSpeechRecognitionReturn = {
  isListening: boolean
  transcript: string
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")
  const [isSupported, setIsSupported] = useState(false)

  // Initialize Speech Recognition API on client side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setIsSupported(true)
      } else {
        setError("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.")
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("Speech Recognition API not available")
      return
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError("Speech Recognition not available")
        return
      }

      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {
          console.warn("Error aborting existing recognition:", e)
        }
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Configuration
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"
      recognition.maxAlternatives = 1

      // Event handlers
      recognition.onstart = () => {
        console.log("🎤 Speech recognition started")
        setIsListening(true)
        setError(null)
      }

      recognition.onresult = (event: any) => {
        let interimTranscript = ""
        let finalTranscript = finalTranscriptRef.current

        for (let i = 0; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart + " "
          } else {
            interimTranscript += transcriptPart
          }
        }

        // Update the ref with final results
        finalTranscriptRef.current = finalTranscript

        // Display: final + interim (interim is temporary visual only)
        const displayTranscript = (finalTranscript + interimTranscript).trim()
        setTranscript(displayTranscript)

        if (finalTranscript !== finalTranscriptRef.current) {
          console.log("✅ Final result accumulated:", finalTranscript.trim())
        }
      }

      recognition.onerror = (event: any) => {
        console.error("🚫 Speech recognition error:", event.error)
        let errorMsg = `Error: ${event.error}`

        if (event.error === "no-speech") {
          errorMsg = "No speech detected. Please try again."
        } else if (event.error === "network") {
          errorMsg = "Network error. Please check your connection."
        } else if (event.error === "not-allowed") {
          errorMsg = "Microphone permission denied. Please grant access."
        } else if (event.error === "audio-capture") {
          errorMsg = "No microphone found. Please check your device."
        }

        setError(errorMsg)
        setIsListening(false)
      }

      recognition.onend = () => {
        console.log("⏹️ Speech recognition ended")
        setIsListening(false)
        recognitionRef.current = null
      }

      // Start recognition
      recognition.start()
    } catch (e: any) {
      console.error("Failed to start recognition:", e)
      setError(`Failed to start: ${e.message}`)
      setIsListening(false)
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    console.log("Stopping speech recognition...")
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        console.warn("Error stopping recognition:", e)
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    finalTranscriptRef.current = ""
    setError(null)
  }, [])

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
