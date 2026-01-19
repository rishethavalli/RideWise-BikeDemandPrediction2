"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

type Review = {
  id: number
  name: string
  rating: number
  text: string
  date: string
  helpfulCount: number
}

const STORAGE_KEY = "ridewise-reviews"

const DEFAULT_REVIEWS: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    text: "RideWise has transformed how we manage our bike fleet. The predictions are incredibly accurate!",
    date: "2026-01-05",
    helpfulCount: 14,
  },
  {
    id: 2,
    name: "Mike Chen",
    rating: 4,
    text: "Great tool for urban planning. Helps us optimize bike station placement.",
    date: "2026-01-04",
    helpfulCount: 9,
  },
]

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_REVIEWS)
  const [name, setName] = useState("")
  const [rating, setRating] = useState(5)
  const [text, setText] = useState("")
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState<"newest" | "helpful">("newest")

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as Review[]
      if (Array.isArray(parsed) && parsed.length) {
        setReviews(parsed)
      }
    } catch (error) {
      console.error("Failed to parse stored reviews", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews))
  }, [reviews])

  const filteredReviews = useMemo(() => {
    const base = reviews.filter((review) => review.rating >= minRating)
    if (sortBy === "helpful") {
      return [...base].sort((a, b) => b.helpfulCount - a.helpfulCount)
    }
    return [...base].sort((a, b) => b.id - a.id)
  }, [minRating, reviews, sortBy])

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return Number((total / reviews.length).toFixed(1))
  }, [reviews])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return

    const newReview: Review = {
      id: Date.now(),
      name,
      rating,
      text,
      date: new Date().toISOString().split("T")[0],
      helpfulCount: 0,
    }

    setReviews((prev) => [newReview, ...prev])
    setName("")
    setRating(5)
    setText("")
  }

  const incrementHelpful = (id: number) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === id ? { ...review, helpfulCount: review.helpfulCount + 1 } : review))
    )
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/images/background.png)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-800/65 to-slate-900/70" />
      </div>

      <div className="relative z-10 min-h-screen">
        <PageHeader title="Reviews" />

        <div className="mx-auto max-w-4xl p-4 py-8">
          <h1 className="mb-8 text-center text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,166,81,0.5)]">
            <span className="text-[#00a651]">Reviews</span>
          </h1>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Average rating</CardTitle>
                <CardDescription className="text-gray-600">Across all submitted reviews</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-gray-800">
                <div className="flex items-center gap-2 text-3xl font-bold">
                  {averageRating.toFixed(1)}
                  <Star className="size-6 fill-amber-500 text-amber-500" />
                </div>
                <span className="text-sm text-gray-600">{reviews.length} review(s)</span>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Rating filter</CardTitle>
                <CardDescription className="text-gray-600">Show only reviews at or above a rating</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                >
                  <option value={0}>All ratings</option>
                  <option value={5}>5 stars</option>
                  <option value={4}>4+ stars</option>
                  <option value={3}>3+ stars</option>
                </select>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-gray-800">Sort</CardTitle>
                <CardDescription className="text-gray-600">Prioritize newest or most helpful</CardDescription>
              </CardHeader>
              <CardContent>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "helpful")}
                  className="w-full rounded-lg border border-gray-300 bg-white/90 px-3 py-2 text-gray-800 focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                >
                  <option value="newest">Newest first</option>
                  <option value="helpful">Most helpful</option>
                </select>
              </CardContent>
            </Card>
          </div>

          {/* Review Form - Updated card styling */}
          <Card className="mb-8 border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-gray-800">Leave a Review</CardTitle>
              <CardDescription className="text-gray-600">Share your experience with RideWise</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2 text-gray-800 backdrop-blur-sm transition-all placeholder:text-gray-400 focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`size-8 ${star <= rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="text" className="mb-2 block text-sm font-medium text-gray-700">
                    Review
                  </label>
                  <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 bg-white/90 px-4 py-2 text-gray-800 backdrop-blur-sm transition-all placeholder:text-gray-400 focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                    placeholder="Tell us about your experience..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-[#00a651] text-white shadow-lg hover:bg-[#008c45]">
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card
                key={review.id}
                className="border-white/10 bg-white/95 shadow-xl backdrop-blur-xl transition-all hover:border-[#00a651]/30 hover:shadow-[0_0_20px_rgba(0,166,81,0.3)]"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-800">{review.name}</CardTitle>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <CardDescription className="text-gray-500">{review.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{review.text}</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-gray-200 text-gray-800 hover:border-[#00a651]/40 hover:bg-[#00a651]/10"
                      onClick={() => incrementHelpful(review.id)}
                    >
                      Helpful • {review.helpfulCount}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
